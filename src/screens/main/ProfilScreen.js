import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const MENU_ITEMS = [
  { title: 'Gérer le compte', icon: 'person-outline' },
  { title: 'Changer de compte', icon: 'swap-horizontal-outline' },
  { title: 'Souscrire à un forfait', icon: 'card-outline' },
  { title: 'Usage limité', icon: 'speedometer-outline' },
  { title: 'Personnaliser l\'agent', icon: 'color-palette-outline' },
  { title: 'Changer de pays/région', icon: 'globe-outline' },
  { title: 'Paramètres généraux', icon: 'options-outline' },
];

export default function ProfilScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Avatar Section (with pinkish circle background) */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {/* Circular pink/peach visual background overlay */}
          <View style={styles.avatarBackground} />
          {/* Centered avatar graphics */}
          <Ionicons name="person" size={54} color="#0d0d0d" />
        </View>
        <Text style={styles.name}>{user?.nom || 'Choussi Akuta'}</Text>
        <Text style={styles.email}>{user?.email || 'choussi69@gmail.com'}</Text>
      </View>

      {/* Menu Options styled exactly like Figma */}
      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.title} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon} size={20} color="#888" style={{ marginRight: 12 }} />
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#444" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16,
    paddingTop: 54, paddingBottom: 16, backgroundColor: '#141414',
    borderBottomWidth: 1, borderBottomColor: '#222' },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  
  avatarSection: { alignItems: 'center', paddingVertical: 30 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#ffb5a7', justifyContent: 'center',
    alignItems: 'center', marginBottom: 16, overflow: 'hidden',
    borderWidth: 2, borderColor: '#fff', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3 },
  avatarBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: '#ffccd5', opacity: 0.5 },
  name: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 0.5 },
  email: { color: '#888', fontSize: 13, marginTop: 4 },
  
  menuContainer: { paddingHorizontal: 16, marginTop: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#141414',
    borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginTop: 24, paddingVertical: 14,
    backgroundColor: '#b91c1c', borderRadius: 12, borderWidth: 1, borderColor: '#ef4444' },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});