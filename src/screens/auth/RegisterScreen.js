import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Animated, LayoutAnimation, UIManager, Platform
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Picker } from '@react-native-picker/picker';
import api from '../../services/api';

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
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>

        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.stepTitle}>Étape {step} sur 2</Text>

        {step === 1 && (
          <View style={styles.stepContainer}>
            {['nom', 'email', 'password'].map((field) => (
              <TextInput
                key={field}
                style={styles.input}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                placeholderTextColor="#666"
                value={form[field]}
                onChangeText={(v) => setForm({ ...form, [field]: v })}
                secureTextEntry={field === 'password'}
                autoCapitalize="none"
              />
            ))}
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
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold',
    color: '#fff', marginBottom: 8, textAlign: 'center' },
  stepTitle: { fontSize: 14, color: '#52b788', textAlign: 'center', marginBottom: 24 },
  progressContainer: { height: 4, backgroundColor: '#333', borderRadius: 2, marginBottom: 24, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#52b788', borderRadius: 2 },
  stepContainer: { width: '100%' },
  input: { backgroundColor: '#1a1a1a', color: '#fff',
    padding: 14, borderRadius: 8, marginBottom: 16,
    borderWidth: 1, borderColor: '#333' },
  label: { color: '#888', marginBottom: 8, fontSize: 13, marginTop: 4 },
  picker: { backgroundColor: '#1a1a1a', borderRadius: 8,
    marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#2d6a4f', padding: 16,
    borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  rowButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  backButton: { flex: 1, backgroundColor: '#333', padding: 16, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  submitButton: { flex: 2, backgroundColor: '#2d6a4f', padding: 16, borderRadius: 8, alignItems: 'center' },
  link: { color: '#666', textAlign: 'center', marginTop: 24 },
});