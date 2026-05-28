import React from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const POSTS = [
  { id: 1, auteur: 'Marc', titre: 'Recherche d\'avocat',
    image: true },
  { id: 2, auteur: 'Marc', titre: 'Accident à Happy',
    image: true },
];

export default function CommunauteScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="menu" size={24} color="#fff" />
        <Text style={styles.headerTitle}>Communauté</Text>
        <View style={{ width: 24 }} />
      </View>
      {POSTS.map((post) => (
        <TouchableOpacity key={post.id} style={styles.card}>
          <View style={styles.thumbnail}>
            <Ionicons name="image-outline" size={32} color="#555" />
          </View>
          <View style={styles.overlay}>
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={14} color="#fff" />
              </View>
              <Text style={styles.author}>{post.auteur}</Text>
            </View>
            <Text style={styles.titre}>{post.titre}</Text>
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
  card: { margin: 16, borderRadius: 12,
    overflow: 'hidden', backgroundColor: '#1a1a1a' },
  thumbnail: { height: 180, backgroundColor: '#222',
    justifyContent: 'center', alignItems: 'center' },
  overlay: { padding: 12 },
  authorRow: { flexDirection: 'row',
    alignItems: 'center', marginBottom: 6 },
  avatar: { width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#333', justifyContent: 'center',
    alignItems: 'center', marginRight: 8 },
  author: { color: '#aaa', fontSize: 12 },
  titre: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});