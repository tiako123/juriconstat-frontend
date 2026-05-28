import React from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AVOCATS = [
  { id: 1, nom: 'Marc Dubois', experience: 'Avocat de 10ans d\'expérience...' },
  { id: 2, nom: 'Sophie Martin', experience: 'Avocate de 7ans d\'expérience...' },
  { id: 3, nom: 'Jean Kamga', experience: 'Avocat de 15ans d\'expérience...' },
];

export default function CollaborateursScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="menu" size={24} color="#fff" />
        <Text style={styles.headerTitle}>Nos collaborateurs</Text>
        <View style={{ width: 24 }} />
      </View>
      {AVOCATS.map((avocat) => (
        <TouchableOpacity key={avocat.id} style={styles.card}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color="#fff" />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{avocat.nom}</Text>
            <Text style={styles.experience}>{avocat.experience}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  header: { flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16, paddingTop: 50,
    backgroundColor: '#1a1a1a' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  avatar: { width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#333', justifyContent: 'center',
    alignItems: 'center', marginRight: 16 },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  experience: { color: '#666', fontSize: 13, marginTop: 4 },
});