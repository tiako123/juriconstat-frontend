import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Switch, ActivityIndicator,
  LayoutAnimation, UIManager, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import api from '../../services/api';

// ─── Simulated form sections, matching a real constat amiable ───────────────

const FIELD_GROUPS = [
  {
    section: '1. Informations sur l\'accident',
    fields: [
      { key: 'date', label: 'Date de l\'accident', placeholder: 'JJ/MM/AAAA', keyboard: 'default' },
      { key: 'heure', label: 'Heure', placeholder: 'HH:MM', keyboard: 'default' },
      { key: 'lieu', label: 'Lieu (rue, ville)', placeholder: 'Ex: Carrefour Happy, Yaoundé', keyboard: 'default' },
      { key: 'blesse', label: 'Y a-t-il des blessés ?', type: 'switch' },
      { key: 'degats', label: 'Dégâts matériels hors véhicule ?', type: 'switch' },
    ]
  },
  {
    section: '2. Véhicule A (votre véhicule)',
    fields: [
      { key: 'nomA', label: 'Nom du conducteur A', placeholder: 'Prénom Nom', keyboard: 'default' },
      { key: 'immatA', label: 'Immatriculation A', placeholder: 'LT-123-YA', keyboard: 'default' },
      { key: 'assuranceA', label: 'Compagnie d\'assurance A', placeholder: 'Ex: ACTIVA Assurances', keyboard: 'default' },
      { key: 'policeA', label: 'N° de police A', placeholder: 'Ex: AC2025-00123', keyboard: 'default' },
    ]
  },
  {
    section: '3. Véhicule B (autre véhicule)',
    fields: [
      { key: 'nomB', label: 'Nom du conducteur B', placeholder: 'Prénom Nom', keyboard: 'default' },
      { key: 'immatB', label: 'Immatriculation B', placeholder: 'LT-456-YA', keyboard: 'default' },
      { key: 'assuranceB', label: 'Compagnie d\'assurance B', placeholder: 'Ex: SAAR Assurances', keyboard: 'default' },
      { key: 'policeB', label: 'N° de police B', placeholder: 'Ex: SA2025-00456', keyboard: 'default' },
    ]
  },
  {
    section: '4. Circonstances de l\'accident',
    fields: [
      { key: 'circonstances', label: 'Description des circonstances', placeholder: 'Décrivez comment l\'accident s\'est produit...', keyboard: 'default', multiline: true },
    ]
  },
];

const DEFAULT_FORM = {
  date: '', heure: '', lieu: '', blesse: false, degats: false,
  nomA: '', immatA: '', assuranceA: '', policeA: '',
  nomB: '', immatB: '', assuranceB: '', policeB: '',
  circonstances: '',
};

export default function ConstatNumerique({ navigation }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    ...DEFAULT_FORM,
    nomA: user?.nom || 'Choussi Akuta',
  });
  const [signedA, setSignedA] = useState(false);
  const [signedB, setSignedB] = useState(false);
  const [exported, setExported] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  // Custom notification state
  const [showNotification, setShowNotification] = useState(false);
  const notificationAnim = useRef(new Animated.Value(-120)).current;

  // 0. ENTRY ANIMATION
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  // 1. OFFLINE DRAFT: Charger le brouillon au démarrage
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draftStr = await AsyncStorage.getItem('@constat_draft');
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          Alert.alert(
            "Brouillon trouvé", 
            "Vous avez un constat en cours non exporté. Voulez-vous le restaurer ?",
            [
              { text: "Nouvel accident", style: "cancel", onPress: () => AsyncStorage.removeItem('@constat_draft') },
              { text: "Restaurer", onPress: () => setForm(draft) }
            ]
          );
        }
      } catch (e) {
        console.error("Erreur chargement brouillon", e);
      }
    };
    loadDraft();
  }, []);

  // OFFLINE DRAFT: Sauvegarder à chaque changement
  useEffect(() => {
    const saveDraft = async () => {
      try {
        await AsyncStorage.setItem('@constat_draft', JSON.stringify(form));
      } catch (e) {
        console.error("Erreur sauvegarde brouillon", e);
      }
    };
    if (form.nomA || form.date || form.lieu || form.nomB) saveDraft();
  }, [form]);

  // 2. GPS: Obtenir la localisation
  const getLocationAsync = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Impossible d\'accéder à votre position GPS.');
        setIsLocating(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let reverseGeo = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      if (reverseGeo && reverseGeo.length > 0) {
        const addr = reverseGeo[0];
        const place = `${addr.street || addr.name || ''}, ${addr.city || addr.region || addr.country || ''}`.replace(/^, | ,/g, '').trim();
        update('lieu', place);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de récupérer la position GPS.');
    } finally {
      setIsLocating(false);
    }
  };

  // 3. OCR: Scanner la carte grise ou l'assurance
  const scanDocument = async () => {
    try {
      let { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'JuriConstat a besoin de la caméra pour l\'OCR.');
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsOcrLoading(true);
        const base64Data = result.assets[0].base64;
        
        try {
          const res = await api.post('/consultations/ocr', {
            base64Image: base64Data,
            mimeType: 'image/jpeg'
          });
          
          const ocrData = res.data;
          setForm(prev => ({
            ...prev,
            nomB: ocrData.nom || prev.nomB,
            immatB: ocrData.immatriculation || prev.immatB,
            assuranceB: ocrData.assurance || prev.assuranceB,
            policeB: ocrData.police || prev.policeB,
          }));
          
          Alert.alert("OCR Terminé ✅", "Les informations du conducteur B ont été pré-remplies avec succès !");
        } catch (apiErr) {
          console.error("API Error", apiErr);
          Alert.alert("Erreur", "L'analyse OCR a échoué.");
        } finally {
          setIsOcrLoading(false);
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Problème lors du scan du document.");
      setIsOcrLoading(false);
    }
  };

  // 4. NOTIFICATIONS: Simuler la signature de l'autre conducteur
  const triggerRemoteSignatureSimulation = () => {
    setTimeout(() => {
      setSignedB(true);
      setShowNotification(true);
      Animated.sequence([
        Animated.timing(notificationAnim, {
          toValue: 40, // slide down
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(4000), // wait 4 seconds
        Animated.timing(notificationAnim, {
          toValue: -120, // slide back up
          duration: 400,
          useNativeDriver: true,
        })
      ]).start(() => setShowNotification(false));
    }, 8000); // Déclenchement 8s après l'envoi
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleExport = async () => {
    if (!signedA) {
      Alert.alert('Signature requise', 'Le conducteur A doit signer avant l\'export.');
      return;
    }
    
    const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
            h1 { color: #2d6a4f; text-align: center; border-bottom: 2px solid #52b788; padding-bottom: 10px; margin-bottom: 5px; }
            .section { margin-top: 15px; margin-bottom: 10px; background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 5px solid #2d6a4f; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #1a4332; text-transform: uppercase; }
            .row { display: flex; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
            .label { font-weight: bold; width: 40%; color: #555; }
            .value { width: 60%; }
            .signatures { margin-top: 30px; display: flex; justify-content: space-between; }
            .sig-box { width: 45%; border: 1px solid #ccc; padding: 15px; text-align: center; border-radius: 8px; }
            .sig-status { color: #52b788; font-weight: bold; font-size: 14px; margin-top: 10px; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #888; }
          </style>
        </head>
        <body>
          <h1>Constat Amiable Numérique</h1>
          <p style="text-align: right; color: #666; font-size: 12px;"><strong>Réf:</strong> CONST-${Date.now().toString().slice(-8)}</p>
          
          <div class="section">
            <div class="section-title">1. Informations sur l'accident</div>
            <div class="row"><span class="label">Date:</span> <span class="value">${form.date || 'Non spécifié'} à ${form.heure || 'Non spécifié'}</span></div>
            <div class="row"><span class="label">Lieu:</span> <span class="value">${form.lieu || 'Non spécifié'}</span></div>
            <div class="row"><span class="label">Blessés:</span> <span class="value">${form.blesse ? 'Oui' : 'Non'}</span></div>
            <div class="row"><span class="label">Dégâts extérieurs:</span> <span class="value">${form.degats ? 'Oui' : 'Non'}</span></div>
          </div>

          <div style="display: flex; justify-content: space-between;">
            <div class="section" style="width: 46%;">
              <div class="section-title">2. Véhicule A (Vous)</div>
              <div class="row"><span class="label">Conducteur:</span> <span class="value">${form.nomA || 'Non spécifié'}</span></div>
              <div class="row"><span class="label">Immat:</span> <span class="value">${form.immatA || 'Non spécifié'}</span></div>
              <div class="row"><span class="label">Assurance:</span> <span class="value">${form.assuranceA || 'Non spécifié'}</span></div>
              <div class="row"><span class="label">Police N°:</span> <span class="value">${form.policeA || 'Non spécifié'}</span></div>
            </div>
            
            <div class="section" style="width: 46%;">
              <div class="section-title">3. Véhicule B (Tiers)</div>
              <div class="row"><span class="label">Conducteur:</span> <span class="value">${form.nomB || 'Non spécifié'}</span></div>
              <div class="row"><span class="label">Immat:</span> <span class="value">${form.immatB || 'Non spécifié'}</span></div>
              <div class="row"><span class="label">Assurance:</span> <span class="value">${form.assuranceB || 'Non spécifié'}</span></div>
              <div class="row"><span class="label">Police N°:</span> <span class="value">${form.policeB || 'Non spécifié'}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">4. Circonstances de l'accident</div>
            <p style="white-space: pre-wrap; font-size: 14px;">${form.circonstances || 'Aucune circonstance détaillée.'}</p>
          </div>

          <div class="signatures">
            <div class="sig-box">
              <strong>Signature Conducteur A</strong><br/>
              <span style="font-size: 12px; color: #555;">${form.nomA || ''}</span>
              ${signedA ? '<div class="sig-status">✓ Signé électroniquement</div>' : '<div style="color: #f25c54; margin-top: 10px; font-weight: bold; font-size: 14px;">Non signé</div>'}
            </div>
            <div class="sig-box">
              <strong>Signature Conducteur B</strong><br/>
              <span style="font-size: 12px; color: #555;">${form.nomB || ''}</span>
              ${signedB ? '<div class="sig-status">✓ Signé électroniquement</div>' : '<div style="color: #f25c54; margin-top: 10px; font-weight: bold; font-size: 14px;">Non signé</div>'}
            </div>
          </div>
          
          <div class="footer">
            Document généré et certifié par l'application mobile <strong>JuriConstat</strong>.<br/>
            Horodatage de l'export: ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      setExported(true);
      await AsyncStorage.removeItem('@constat_draft'); // Supprimer le brouillon après export
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Partager le Constat' });
    } catch (error) {
      console.error("Erreur PDF:", error);
      Alert.alert('Erreur', 'Impossible de générer le PDF.');
    }
  };

  const handleReset = () => {
    Alert.alert('Réinitialiser', 'Effacer tout le formulaire ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui, effacer', style: 'destructive', onPress: () => {
        setForm({ ...DEFAULT_FORM, nomA: user?.nom || '' });
        setSignedA(false);
        setSignedB(false);
        setExported(false);
      }}
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d0d' }}>
      {/* Custom Notification Banner */}
      {showNotification && (
        <Animated.View style={[styles.notificationBanner, { transform: [{ translateY: notificationAnim }] }]}>
          <Ionicons name="notifications" size={26} color="#fff" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.notificationTitle}>✅ Signature reçue !</Text>
            <Text style={styles.notificationText}>Le conducteur B a signé le constat.</Text>
          </View>
        </Animated.View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Constat Numérique</Text>
          <TouchableOpacity onPress={handleReset}>
            <Ionicons name="refresh" size={22} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Top banner */}
        <View style={styles.banner}>
          <Ionicons name="document-text-outline" size={28} color="#52b788" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Constat Amiable Numérique</Text>
            <Text style={styles.bannerSub}>Remplissez et faites signer électroniquement par les deux parties.</Text>
          </View>
        </View>

        {/* Form sections */}
        {FIELD_GROUPS.map((group) => (
          <View key={group.section} style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>{group.section}</Text>
            {group.fields.map((f) => (
              f.type === 'switch' ? (
                <View key={f.key} style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{f.label}</Text>
                  <Switch
                    value={form[f.key]}
                    onValueChange={(v) => update(f.key, v)}
                    trackColor={{ false: '#333', true: '#2d6a4f' }}
                    thumbColor={form[f.key] ? '#52b788' : '#666'}
                  />
                </View>
              ) : (
                <View key={f.key} style={styles.fieldBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.fieldLabel}>{f.label}</Text>
                    {f.key === 'lieu' && (
                      <TouchableOpacity style={styles.gpsBtn} onPress={getLocationAsync} disabled={isLocating}>
                        {isLocating ? <ActivityIndicator size="small" color="#52b788" /> : <Ionicons name="navigate-circle" size={24} color="#52b788" />}
                        <Text style={styles.gpsText}>GPS</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={[styles.input, f.multiline && styles.multilineInput]}
                    placeholder={f.placeholder}
                    placeholderTextColor="#555"
                    value={form[f.key]}
                    onChangeText={(v) => update(f.key, v)}
                    keyboardType={f.keyboard || 'default'}
                    multiline={!!f.multiline}
                    numberOfLines={f.multiline ? 4 : 1}
                    autoCapitalize="sentences"
                  />
                </View>
              )
            ))}
          </View>
        ))}

        {/* Scan OCR Button in Vehicle B section */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity style={styles.ocrBtn} onPress={scanDocument} disabled={isOcrLoading}>
            {isOcrLoading ? (
              <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
            ) : (
              <Ionicons name="scan-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
            )}
            <Text style={styles.ocrBtnText}>{isOcrLoading ? 'Analyse OCR en cours...' : 'Scanner papiers Véhicule B (IA)'}</Text>
          </TouchableOpacity>
        </View>

        {/* Signature Section A */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>5. Signature du conducteur A</Text>
          <Text style={styles.sigNote}>En appuyant sur « Signer », vous attestez l'exactitude des informations fournies.</Text>
          <TouchableOpacity
            style={[styles.sigBtn, signedA && styles.sigBtnDone]}
            onPress={() => {
              setSignedA(true);
              Alert.alert('Signature apposée ✅', `${form.nomA} a signé le constat. Envoi d'une demande de signature au conducteur B...`);
              triggerRemoteSignatureSimulation();
            }}
          >
            <Ionicons name={signedA ? "checkmark-circle" : "pencil-outline"} size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.sigBtnText}>{signedA ? 'Signé par ' + (form.nomA || 'Conducteur A') : 'Signer (Conducteur A)'}</Text>
          </TouchableOpacity>
        </View>

        {/* Signature Section B */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>6. Signature du conducteur B</Text>
          <Text style={styles.sigNote}>Partagez ce lien avec l'autre partie pour qu'elle signe à distance.</Text>
          <TouchableOpacity
            style={[styles.sigBtn, signedB && styles.sigBtnDone]}
            onPress={() => {
              setSignedB(true);
              Alert.alert('Signature apposée ✅', `${form.nomB || 'Conducteur B'} a signé le constat.`);
            }}
          >
            <Ionicons name={signedB ? "checkmark-circle" : "pencil-outline"} size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.sigBtnText}>{signedB ? 'Signé par ' + (form.nomB || 'Conducteur B') : 'Signer (Conducteur B)'}</Text>
          </TouchableOpacity>
        </View>

        {/* Signature status indicator */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: signedA ? '#52b788' : '#444' }]} />
          <Text style={styles.statusText}>Conducteur A {signedA ? 'a signé' : 'n\'a pas signé'}</Text>
          <View style={[styles.statusDot, { backgroundColor: signedB ? '#52b788' : '#444', marginLeft: 16 }]} />
          <Text style={styles.statusText}>Conducteur B {signedB ? 'a signé' : 'n\'a pas signé'}</Text>
        </View>

        {/* Export PDF Button */}
        <TouchableOpacity
          style={[styles.exportBtn, !signedA && styles.exportBtnDisabled]}
          onPress={handleExport}
        >
          <Ionicons name="download-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.exportBtnText}>Générer et exporter en PDF</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 54, paddingBottom: 16,
    backgroundColor: '#141414', borderBottomWidth: 1, borderBottomColor: '#222' },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },

  banner: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 16,
    backgroundColor: '#141414', borderRadius: 12, borderWidth: 1, borderColor: '#2d6a4f' },
  bannerTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  bannerSub: { color: '#888', fontSize: 12, marginTop: 4, lineHeight: 16 },

  sectionBox: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#141414',
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222' },
  sectionTitle: { color: '#52b788', fontSize: 13, fontWeight: 'bold', marginBottom: 14,
    textTransform: 'uppercase', letterSpacing: 0.8 },

  fieldBox: { marginBottom: 12 },
  fieldLabel: { color: '#aaa', fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, borderWidth: 1, borderColor: '#333', fontSize: 14 },
  multilineInput: { height: 90, textAlignVertical: 'top' },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#222', marginBottom: 4 },
  switchLabel: { color: '#fff', fontSize: 14, flex: 1 },

  sigNote: { color: '#666', fontSize: 12, marginBottom: 12, lineHeight: 16 },
  sigBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 10, backgroundColor: '#1a3a2a', borderWidth: 1, borderColor: '#2d6a4f' },
  sigBtnDone: { backgroundColor: '#2d6a4f', borderColor: '#52b788' },
  sigBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  statusRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16,
    marginBottom: 20, paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: '#141414', borderRadius: 10, borderWidth: 1, borderColor: '#222' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { color: '#888', fontSize: 12, marginLeft: 6 },

  exportBtn: { marginHorizontal: 16, paddingVertical: 16, borderRadius: 12,
    backgroundColor: '#1a73e8', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: '#4a90e2' },
  exportBtnDisabled: { backgroundColor: '#1a1a1a', borderColor: '#333', opacity: 0.6 },
  exportBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a3a2a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#2d6a4f' },
  gpsText: { color: '#52b788', fontSize: 12, marginLeft: 4, fontWeight: 'bold' },
  ocrBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e07a5f', paddingVertical: 12, borderRadius: 10 },
  ocrBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  notificationBanner: { position: 'absolute', top: 0, left: 16, right: 16, zIndex: 1000, 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#52b788', padding: 16, 
    borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 10 },
  notificationTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  notificationText: { color: '#fff', fontSize: 13, opacity: 0.9 },
});
