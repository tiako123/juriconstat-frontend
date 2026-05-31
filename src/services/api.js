import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de l'adresse du backend :
// - Pour l'Émulateur Android (AVM) : 'http://10.0.2.2:8085/api' (adresse spéciale pointant sur votre PC)
// - Pour un téléphone physique branché en USB (avec adb reverse) : 'http://localhost:8085/api'
const api = axios.create({
  baseURL: 'http://10.73.2.199:8085/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;