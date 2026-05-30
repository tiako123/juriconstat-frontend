import React from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, TouchableOpacity, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AVOCATS = [
  { 
    id: 1, 
    nom: 'Marc Dubois', 
    experience: 'Avocat de 10 ans d\'expérience. Spécialiste des accidents de la route.',
    subscribers: '1M abonnés', 
    likes: '4.4M j\'aime', 
    videos: 46,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
    banner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
    bio: 'Spécialiste dans le domaine des litiges routiers et accidents de la circulation. Aide les victimes à faire valoir leurs droits face aux compagnies d\'assurance.'
  },
  { 
    id: 2, 
    nom: 'Marie Martin', 
    experience: 'Avocate pro en informatique et nouvelles technologies.',
    subscribers: '450K abonnés', 
    likes: '1.2M j\'aime', 
    videos: 23,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    banner: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600',
    bio: 'Conseille les start-ups et grands groupes sur la protection des données personnelles (RGPD), la cybersécurité et la propriété intellectuelle dans le monde digital.'
  },
  { 
    id: 3, 
    nom: 'Jeanne Kamga', 
    experience: 'Avocate pro en droit du travail et de l\'agriculture.',
    subscribers: '80K abonnés', 
    likes: '240K j\'aime', 
    videos: 12,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    banner: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=600',
    bio: 'Accompagne les agriculteurs et exploitants dans la gestion de leurs baux ruraux, les conflits fonciers et la transmission de leurs exploitations.'
  },
];

export default function CollaborateursScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nos collaborateurs</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Intro info card */}
      <View style={styles.infoBanner}>
        <Ionicons name="shield-checkmark" size={32} color="#52b788" style={{ marginRight: 16 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoBannerTitle}>Avocats Agréés JuriConstat</Text>
          <Text style={styles.infoBannerSub}>Consultez le profil de nos experts et abonnez-vous pour suivre leurs publications de conseils juridiques.</Text>
        </View>
      </View>

      {/* Lawyers List */}
      <View style={styles.listContainer}>
        {AVOCATS.map((avocat) => (
          <TouchableOpacity 
            key={avocat.id} 
            style={styles.card}
            onPress={() => navigation.navigate('CollaborateurDetail', { avocat })}
          >
            <Image source={{ uri: avocat.avatar }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{avocat.nom}</Text>
              <Text style={styles.experience} numberOfLines={2}>{avocat.experience}</Text>
              <View style={styles.statsRow}>
                <Ionicons name="people-outline" size={12} color="#666" style={{ marginRight: 4 }} />
                <Text style={styles.statsText}>{avocat.subscribers}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#444" />
          </TouchableOpacity>
        ))}
      </View>
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
  
  infoBanner: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 16,
    backgroundColor: '#141414', borderRadius: 12, borderWidth: 1, borderColor: '#2d6a4f' },
  infoBannerTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  infoBannerSub: { color: '#888', fontSize: 12, marginTop: 4, lineHeight: 18 },

  listContainer: { paddingHorizontal: 16 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, 
    backgroundColor: '#141414', borderRadius: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#222' },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16,
    backgroundColor: '#222', borderWidth: 1, borderColor: '#333' },
  info: { flex: 1 },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  experience: { color: '#aaa', fontSize: 12, marginTop: 4, lineHeight: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statsText: { color: '#666', fontSize: 11 }
});