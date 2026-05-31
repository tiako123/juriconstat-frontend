import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  FlatList, TouchableOpacity, ActivityIndicator, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function SearchHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch past consultations from the database
  const loadConsultations = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/consultations/user/${user.id}`);
      const data = res.data || [];
      // Sort newest first
      data.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
      setConsultations(data);
      setFilteredConsultations(data);
    } catch (err) {
      console.error('Failed to load history consultations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, [user]);

  // Real-time search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConsultations(consultations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = consultations.filter(c => 
        (c.requete && c.requete.toLowerCase().includes(query)) ||
        (c.reponseIa && c.reponseIa.toLowerCase().includes(query))
      );
      setFilteredConsultations(filtered);
    }
  }, [searchQuery, consultations]);

  const selectConversation = (item) => {
    // Navigate back to Assistant tab and pass selectedConversation as param
    navigation.navigate('MainTabs', {
      screen: 'Assistant IA',
      params: { selectedConversation: item }
    });
  };

  // Grouping function based on createdAt date
  const getGroupedData = () => {
    const today = [];
    const yesterday = [];
    const older = [];

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    filteredConsultations.forEach(c => {
      const cDate = new Date(c.createdAt || Date.now());
      const diffTime = Math.abs(now - cDate);
      const diffDays = Math.floor(diffTime / oneDay);

      if (diffDays === 0) {
        today.push(c);
      } else if (diffDays === 1) {
        yesterday.push(c);
      } else {
        older.push(c);
      }
    });

    const sections = [];
    if (today.length > 0) sections.push({ title: "Aujourd'hui", data: today });
    if (yesterday.length > 0) sections.push({ title: 'Hier', data: yesterday });
    if (older.length > 0) sections.push({ title: 'Plus anciens', data: older });

    return sections;
  };

  const sectionsData = getGroupedData();

  return (
    <View style={styles.container}>
      {/* Search Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={18} color="#666" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher dans les conversations..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loading state */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#52b788" size="large" />
          <Text style={styles.loaderText}>Chargement de l'historique...</Text>
        </View>
      ) : (
        /* Conversations History List */
        <FlatList
          data={sectionsData}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#444" />
              <Text style={styles.emptyText}>Aucune conversation correspondante</Text>
            </View>
          }
          renderItem={({ item: section }) => (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.data.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.historyCard}
                  onPress={() => selectConversation(item)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.chatIcon}>
                      <Ionicons name="chatbox-ellipses-outline" size={18} color="#52b788" />
                    </View>
                    <Text style={styles.cardTime}>
                      {new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.cardQuery} numberOfLines={1}>
                    {item.requete || "Note vocale"}
                  </Text>
                  <Text style={styles.cardResponse} numberOfLines={2}>
                    {item.reponseIa || "Analyse en cours..."}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: 54, paddingBottom: 16, backgroundColor: '#141414',
    borderBottomWidth: 1, borderBottomColor: '#222' },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  
  searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#222',
    borderRadius: 20, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: '#333' },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, height: '100%', padding: 0 },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: '#888', marginTop: 12, fontSize: 14 },

  listContent: { padding: 16 },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  
  historyCard: { backgroundColor: '#141414', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  chatIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1a2e26', justifyContent: 'center', alignItems: 'center' },
  cardTime: { color: '#666', fontSize: 11 },
  
  cardQuery: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  cardResponse: { color: '#aaa', fontSize: 12, lineHeight: 18 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyText: { color: '#666', fontSize: 14, marginTop: 12, textAlign: 'center' }
});
