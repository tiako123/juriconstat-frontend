import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Animated, Image, Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { colors, shadows } from '../../theme';
import BrandBackdrop from '../../components/BrandBackdrop';

const INTRO_SOUND = require('../../../assets/intro-chime.wav');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const introAnim = React.useRef(new Animated.Value(0)).current;

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

    Animated.timing(introAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    let sound;
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
    }).catch(() => {});

    Audio.Sound.createAsync(INTRO_SOUND, { shouldPlay: true, volume: 0.75 })
      .then(({ sound: loadedSound }) => {
        sound = loadedSound;
      })
      .catch(() => {});

    const timer = setTimeout(() => setShowIntro(false), 2100);
    return () => {
      clearTimeout(timer);
      if (sound) sound.unloadAsync();
    };
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
      <BrandBackdrop />
      <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, styles.formWrapper]}>
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>Justice mobile</Text>
          <Text style={styles.heroTitle}>JuriConstat</Text>
          <Text style={styles.heroSubtitle}>Votre portail juridique intelligent, rapide et sécurisé.</Text>
        </View>

        <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Votre assistant juridique securise</Text>
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
        </View>
      </Animated.View>

      {showIntro && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.introOverlay,
            {
              opacity: introAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
              transform: [{ scale: introAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }],
            },
          ]}
        >
          <View style={styles.introRing}>
            <Image source={require('../../../assets/icon.png')} style={styles.introLogo} resizeMode="contain" />
          </View>
          <Text style={styles.introTitle}>JuriConstat</Text>
          <Text style={styles.introSubtitle}>Portail juridique sécurisé</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 22 },
  formWrapper: { flex: 1, justifyContent: 'flex-end', paddingBottom: 28 },
  heroCopy: { marginBottom: 28 },
  kicker: { color: colors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 },
  heroTitle: { color: colors.text, fontSize: 42, fontWeight: '900', marginTop: 8 },
  heroSubtitle: { color: colors.textSoft, fontSize: 15, lineHeight: 22, marginTop: 8, maxWidth: 330 },
  card: { backgroundColor: 'rgba(17, 27, 23, 0.92)', borderColor: colors.border, borderWidth: 1,
    borderRadius: 20, padding: 18, ...shadows.card },
  logoContainer: { alignItems: 'center', marginBottom: 12 },
  logo: { width: 76, height: 76 },
  title: { fontSize: 26, fontWeight: '800',
    color: colors.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: colors.textMuted,
    textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: colors.bgSoft, color: colors.text,
    padding: 15, borderRadius: 12, marginBottom: 14,
    borderWidth: 1, borderColor: colors.border },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgSoft,
    borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  passwordInput: { flex: 1, color: colors.text, padding: 15 },
  eyeIcon: { padding: 14 },
  button: { backgroundColor: colors.primaryDeep, padding: 16,
    borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: colors.text, fontWeight: '800', fontSize: 16 },
  link: { color: colors.primary, textAlign: 'center', marginTop: 8, fontWeight: '700' },
  introOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg,
    justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  introRing: { width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(82, 183, 136, 0.10)', borderWidth: 1, borderColor: colors.primary,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.75,
    shadowRadius: 22, elevation: 12 },
  introLogo: { width: 96, height: 96 },
  introTitle: { color: colors.text, fontSize: 34, fontWeight: '900', marginTop: 24 },
  introSubtitle: { color: colors.primary, fontSize: 13, fontWeight: '800', marginTop: 6,
    textTransform: 'uppercase', letterSpacing: 1.4 },
});
