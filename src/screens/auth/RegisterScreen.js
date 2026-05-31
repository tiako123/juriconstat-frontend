import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Animated, LayoutAnimation, UIManager, Platform, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import api from '../../services/api';
import { colors, shadows } from '../../theme';
import BrandBackdrop from '../../components/BrandBackdrop';

const PAYS = ['Cameroun', 'Sénégal', 'Côte d\'Ivoire',
  'Mali', 'Burkina Faso', 'Congo', 'Gabon'];
const LANGUES = ['Français', 'Anglais'];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    nom: '', email: '', password: '',
    pays: 'Cameroun', langue: 'Français'
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const progressAnim = React.useRef(new Animated.Value(0.5)).current; // 50% for step 1

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const goToStep2 = () => {
    if (!form.nom || !form.email || !form.password) {
      Alert.alert('Erreur', 'Remplis tous les champs personnels');
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep(2);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const goToStep1 = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep(1);
    Animated.timing(progressAnim, {
      toValue: 0.5,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleRegister = async () => {
    if (!form.nom || !form.email || !form.password) {
      Alert.alert('Erreur', 'Remplis tous les champs');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      Alert.alert('Succès', 'Compte créé ! Connecte-toi.');
      navigation.navigate('Login');
    } catch (e) {
      console.error("Erreur Inscription complète :", e);
      const errorData = e.response?.data;
      if (errorData) {
        if (errorData.erreur) {
          Alert.alert('Erreur', errorData.erreur);
        } else if (typeof errorData === 'object') {
          // Concatène les messages d'erreurs de validation
          const messages = Object.values(errorData).join('\n');
          Alert.alert('Erreur de validation', messages);
        } else {
          Alert.alert('Erreur', 'Inscription impossible');
        }
      } else {
        Alert.alert('Erreur', 'Impossible de contacter le serveur. Vérifie ta connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <BrandBackdrop />
      <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, styles.formWrapper]}>
        
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.kicker}>Nouveau dossier</Text>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.stepTitle}>Étape {step} sur 2</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>

        {step === 1 && (
          <View style={styles.stepContainer}>
            {['nom', 'email'].map((field) => (
              <TextInput
                key={field}
                style={styles.input}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                placeholderTextColor="#666"
                value={form[field]}
                onChangeText={(v) => setForm({ ...form, [field]: v })}
                autoCapitalize="none"
              />
            ))}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mot de passe"
                placeholderTextColor="#666"
                value={form.password}
                onChangeText={(v) => setForm({ ...form, password: v })}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={goToStep2} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Pays de résidence</Text>
            <View style={styles.picker}>
              <Picker selectedValue={form.pays}
                onValueChange={(v) => setForm({ ...form, pays: v })}
                style={{ color: '#fff' }}>
                {PAYS.map((p) => <Picker.Item key={p} label={p} value={p} />)}
              </Picker>
            </View>
            <Text style={styles.label}>Langue préférée</Text>
            <View style={styles.picker}>
              <Picker selectedValue={form.langue}
                onValueChange={(v) => setForm({ ...form, langue: v })}
                style={{ color: '#fff' }}>
                {LANGUES.map((l) => <Picker.Item key={l} label={l} value={l} />)}
              </Picker>
            </View>
            
            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.backButton} onPress={goToStep1} activeOpacity={0.8}>
                <Text style={styles.backButtonText}>Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleRegister} activeOpacity={0.8}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>S'inscrire</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.6}>
          <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  formWrapper: { width: '100%', backgroundColor: 'rgba(17, 27, 23, 0.93)',
    borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 18, ...shadows.card },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 80, height: 80 },
  kicker: { color: colors.primary, fontSize: 12, fontWeight: '800', textAlign: 'center',
    textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800',
    color: colors.text, marginBottom: 8, textAlign: 'center' },
  stepTitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 18 },
  progressContainer: { height: 5, backgroundColor: colors.bgSoft, borderRadius: 3, marginBottom: 24, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  stepContainer: { width: '100%' },
  input: { backgroundColor: colors.bgSoft, color: colors.text,
    padding: 15, borderRadius: 12, marginBottom: 14,
    borderWidth: 1, borderColor: colors.border },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgSoft,
    borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  passwordInput: { flex: 1, color: colors.text, padding: 15 },
  eyeIcon: { padding: 14 },
  label: { color: colors.textMuted, marginBottom: 8, fontSize: 13, marginTop: 4 },
  picker: { backgroundColor: colors.bgSoft, borderRadius: 12,
    marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.primaryDeep, padding: 16,
    borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: colors.text, fontWeight: '800', fontSize: 16 },
  rowButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  backButton: { flex: 1, backgroundColor: colors.surfaceHigh, padding: 16, borderRadius: 12, alignItems: 'center', marginRight: 8 },
  backButtonText: { color: colors.text, fontWeight: '800', fontSize: 16 },
  submitButton: { flex: 2, backgroundColor: colors.primaryDeep, padding: 16, borderRadius: 12, alignItems: 'center' },
  link: { color: colors.primary, textAlign: 'center', marginTop: 24, fontWeight: '700' },
});
