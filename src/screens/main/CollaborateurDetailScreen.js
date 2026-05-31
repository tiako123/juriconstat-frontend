import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, ImageBackground, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme';
import BrandBackdrop from '../../components/BrandBackdrop';

const { width } = Dimensions.get('window');

const VIDEOS = [
  { id: 1, title: 'Accident à Happy : Analyse des responsabilités', views: '28K vues', date: 'il y a 4 jours', duration: '5:40', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400' },
  { id: 2, title: 'Délit de fuite : Comment agir immédiatement ?', views: '14K vues', date: 'il y a 1 semaine', duration: '8:12', thumbnail: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400' },
  { id: 3, title: 'Assurances : Les pièges à éviter absolument', views: '9K vues', date: 'il y a 2 semaines', duration: '12:05', thumbnail: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400' },
];

export default function CollaborateurDetailScreen({ route, navigation }) {
  const { avocat } = route.params || {};
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState('Accueil');

  if (!avocat) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Aucun collaborateur sélectionné.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    Alert.alert(
      isSubscribed ? "Abonnement retiré" : "Abonnement réussi !",
      isSubscribed 
        ? `Vous ne recevrez plus de notifications pour ${avocat.nom}.`
        : `Vous êtes maintenant abonné(e) à ${avocat.nom}. Vous recevrez ses conseils juridiques.`
    );
  };

  const handlePlayVideo = (video) => {
    Alert.alert("Lecture", `Lancement de la vidéo conseil : \n"${video.title}"`);
  };

  return (
    <View style={styles.root}>
      <BrandBackdrop />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner + Back Button */}
      <ImageBackground source={{ uri: avocat.banner }} style={styles.banner}>
        <TouchableOpacity style={styles.circleBackBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </ImageBackground>

      {/* Avatar overlay */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avocat.avatar }} style={styles.avatar} />
      </View>

      {/* Lawyer Information */}
      <View style={styles.infoSection}>
        <Text style={styles.name}>{avocat.nom}</Text>
        <Text style={styles.specialty}>{avocat.experience}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{avocat.subscribers}</Text>
          <Text style={styles.statDivider}>•</Text>
          <Text style={styles.statText}>{avocat.likes}</Text>
          <Text style={styles.statDivider}>•</Text>
          <Text style={styles.statText}>{avocat.videos} vidéos</Text>
        </View>

        {/* Subscription Pill Button (toggles states) */}
        <TouchableOpacity 
          style={[styles.subBtn, isSubscribed ? styles.subBtnActive : styles.subBtnInactive]}
          onPress={handleSubscribe}
        >
          <Ionicons 
            name={isSubscribed ? "checkmark-circle" : "notifications-outline"} 
            size={18} 
            color="#fff" 
            style={{ marginRight: 8 }} 
          />
          <Text style={styles.subBtnText}>
            {isSubscribed ? 'Abonné' : "S'abonner"}
          </Text>
        </TouchableOpacity>

        {/* Bio description */}
        <Text style={styles.bioText}>{avocat.bio}</Text>
      </View>

      {/* Navigation Tabs (Accueil, Vidéos, Playlists) */}
      <View style={styles.tabRow}>
        {['Accueil', 'Vidéos', 'Playlists'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Contents */}
      {activeTab === 'Accueil' && (
        <View style={styles.videosSection}>
          <Text style={styles.sectionTitle}>Pour vous</Text>
          {VIDEOS.map((video) => (
            <TouchableOpacity 
              key={video.id} 
              style={styles.videoCard}
              onPress={() => handlePlayVideo(video)}
            >
              <ImageBackground source={{ uri: video.thumbnail }} style={styles.videoThumbnail}>
                <View style={styles.videoDurationContainer}>
                  <Text style={styles.videoDuration}>{video.duration}</Text>
                </View>
                <View style={styles.playIconOverlay}>
                  <Ionicons name="play" size={32} color="#fff" />
                </View>
              </ImageBackground>
              <View style={styles.videoDetails}>
                <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                <Text style={styles.videoMeta}>{video.views} • {video.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeTab === 'Vidéos' && (
        <View style={styles.videosSection}>
          <Text style={styles.sectionTitle}>Toutes les vidéos</Text>
          {VIDEOS.map((video) => (
            <TouchableOpacity 
              key={video.id} 
              style={styles.videoCard}
              onPress={() => handlePlayVideo(video)}
            >
              <ImageBackground source={{ uri: video.thumbnail }} style={styles.videoThumbnail}>
                <View style={styles.videoDurationContainer}>
                  <Text style={styles.videoDuration}>{video.duration}</Text>
                </View>
                <View style={styles.playIconOverlay}>
                  <Ionicons name="play" size={32} color="#fff" />
                </View>
              </ImageBackground>
              <View style={styles.videoDetails}>
                <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                <Text style={styles.videoMeta}>{video.views} • {video.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeTab === 'Playlists' && (
        <View style={styles.emptyPlaylistContainer}>
          <Ionicons name="folder-open-outline" size={48} color="#444" />
          <Text style={styles.emptyPlaylistText}>Aucune playlist publique disponible</Text>
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingBottom: 40 },
  
  errorContainer: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: colors.text, fontSize: 16, marginBottom: 20 },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primaryDeep, borderRadius: 8 },
  backText: { color: '#fff', fontWeight: 'bold' },

  banner: { height: 180, width: '100%', justifyContent: 'flex-start', padding: 16, paddingTop: 54 },
  circleBackBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center', alignItems: 'center' },
  
  avatarContainer: { alignItems: 'center', marginTop: -50 },
  avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 4, borderColor: colors.bg, backgroundColor: colors.surface, ...shadows.card },
  
  infoSection: { alignItems: 'center', paddingHorizontal: 24, marginTop: 12 },
  name: { color: colors.text, fontSize: 23, fontWeight: '800' },
  specialty: { color: colors.primary, fontSize: 14, marginTop: 4, fontWeight: '600', textAlign: 'center' },
  
  statsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  statText: { color: '#888', fontSize: 12 },
  statDivider: { color: '#444', marginHorizontal: 8 },
  
  subBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, paddingHorizontal: 32, borderRadius: 20, marginVertical: 8,
    width: '60%', elevation: 2 },
  subBtnInactive: { backgroundColor: '#1a73e8' },
  subBtnActive: { backgroundColor: '#333', borderWidth: 1, borderColor: '#444' },
  subBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  bioText: { color: colors.textSoft, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 12 },
  
  // Custom Tabs Style
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.borderSoft, marginTop: 24 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#52b788' },
  tabText: { color: '#666', fontSize: 14, fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },
  
  // Videos Grid & Cards Style
  videosSection: { padding: 16 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 16 },
  videoCard: { flexDirection: 'row', marginBottom: 16, backgroundColor: 'rgba(17, 27, 23, 0.96)',
    borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  videoThumbnail: { width: 130, height: 90, justifyContent: 'center', alignItems: 'center' },
  videoDurationContainer: { position: 'absolute', bottom: 6, right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  videoDuration: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  playIconOverlay: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center' },
  videoDetails: { flex: 1, padding: 10, justifyContent: 'space-between' },
  videoTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', lineHeight: 18 },
  videoMeta: { color: '#666', fontSize: 11 },

  emptyPlaylistContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 20 },
  emptyPlaylistText: { color: '#666', fontSize: 13, marginTop: 12 }
});
