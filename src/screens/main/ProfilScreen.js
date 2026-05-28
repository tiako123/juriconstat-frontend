import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const MENU_ITEMS = [
  'Gérer le compte', 'Changer de compte',
  'Souscrire à un forfait', 'Usage limité',
  'Personnaliser l\'agent', 'Changer de pays/région',
  'Paramètres généraux',
];

export default function ProfilScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="menu" size={24} color="#fff" />
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.nom || 'Utilisateur'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity key={item} style={styles.menuItem}>
          <Text style={styles.menuText}>{item}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  header: { flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16, paddingTop: 50,
    backgroundColor: '#1a1a1a' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  avatarSection: { alignItems: 'center', padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#333', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12 },
  name: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  email: { color: '#666', fontSize: 13, marginTop: 4 },
  menuItem: { padding: 16, borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a', backgroundColor: '#111' },
  menuText: { color: '#fff', fontSize: 15 },
  logoutBtn: { margin: 24, padding: 16, backgroundColor: '#c0392b',
    borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});