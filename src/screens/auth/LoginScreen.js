import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Animated, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Remplis tous les champs');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      await login(
        { userId: res.data.userId, role: res.data.role, nom: res.data.nom, email: res.data.email },
        res.data.token
      );
    } catch (e) {
      console.error("Erreur Connexion complète :", e);
      const errorData = e.response?.data;
      if (errorData) {
        if (errorData.erreur) {
          Alert.alert('Erreur', errorData.erreur);
        } else if (typeof errorData === 'object') {
          const messages = Object.values(errorData).join('\n');
          Alert.alert('Erreur', messages);
        } else {
          Alert.alert('Erreur', 'Connexion impossible');
        }
      } else {
        Alert.alert('Erreur', 'Impossible de contacter le serveur. Vérifie ta connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, styles.formWrapper]}>
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>JuriConstat</Text>
        <Text style={styles.subtitle}>Votre assistant juridique</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Mot de passe"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Se connecter</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.6}>
          <Text style={styles.link}>Pas de compte ? S'inscrire</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 24 },
  formWrapper: { flex: 1, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 120, height: 120 },
  title: { fontSize: 32, fontWeight: 'bold',
    color: '#ffffff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666',
    textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#1a1a1a', color: '#fff',
    padding: 14, borderRadius: 8, marginBottom: 16,
    borderWidth: 1, borderColor: '#333' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a',
    borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  passwordInput: { flex: 1, color: '#fff', padding: 14 },
  eyeIcon: { padding: 14 },
  button: { backgroundColor: '#2d6a4f', padding: 16,
    borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#666', textAlign: 'center', marginTop: 8 },
});