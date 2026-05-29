import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
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

  return (
    <ScrollView style={styles.container}
      contentContainerStyle={styles.content}>
      <Text style={styles.title}>Créer un compte</Text>
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
      <Text style={styles.label}>Pays</Text>
      <View style={styles.picker}>
        <Picker selectedValue={form.pays}
          onValueChange={(v) => setForm({ ...form, pays: v })}
          style={{ color: '#fff' }}>
          {PAYS.map((p) => <Picker.Item key={p} label={p} value={p} />)}
        </Picker>
      </View>
      <Text style={styles.label}>Langue</Text>
      <View style={styles.picker}>
        <Picker selectedValue={form.langue}
          onValueChange={(v) => setForm({ ...form, langue: v })}
          style={{ color: '#fff' }}>
          {LANGUES.map((l) => <Picker.Item key={l} label={l} value={l} />)}
        </Picker>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>S'inscrire</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold',
    color: '#fff', marginBottom: 32, textAlign: 'center' },
  input: { backgroundColor: '#1a1a1a', color: '#fff',
    padding: 14, borderRadius: 8, marginBottom: 16,
    borderWidth: 1, borderColor: '#333' },
  label: { color: '#666', marginBottom: 8, fontSize: 13 },
  picker: { backgroundColor: '#1a1a1a', borderRadius: 8,
    marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#2d6a4f', padding: 16,
    borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#666', textAlign: 'center', marginTop: 16 },
});