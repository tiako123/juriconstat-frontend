import React from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, TouchableOpacity, Image, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme';
import BrandBackdrop from '../../components/BrandBackdrop';

const POSTS = [
  { 
    id: 1, 
    auteur: 'Marie Martin',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100',
    titre: 'Recherche urgente d\'un avocat d\'expérience',
    titreFull: 'Recherche urgente d\'un avocat - Accident avec délit de fuite',
    excerpt: 'Bonjour à tous, je recherche de toute urgence un avocat spécialisé en droit routier et corporel suite à un délit de fuite...',
    content: 'Bonjour à tous, je recherche de toute urgence un avocat spécialisé en droit des assurances et en préjudices corporels. J\'ai été victime d\'un grave accident de la circulation la semaine dernière au carrefour Happy. Le conducteur responsable a pris la fuite. Les caméras de surveillance ont filmé la scène mais l\'assurance refuse pour l\'instant de couvrir mes frais médicaux en l\'absence de procès-verbal de police finalisé. Si quelqu\'un a des conseils ou peut m\'accompagner, je vous serais extrêmement reconnaissante. Merci pour votre aide précieuse !',
    imageUri: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400',
    time: 'Hier à 14:02',
    likes: 24,
    commentsCount: 2
  },
  { 
    id: 2, 
    auteur: 'Marc Dubois',
    authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100',
    titre: 'Accident à Happy : Analyse des responsabilités',
    titreFull: 'Accident à Happy : Qui est juridiquement responsable ?',
    excerpt: 'Suite à l\'accident survenu au carrefour Happy, voici une analyse de la priorité à droite et du délit de fuite pénal...',
    content: 'Chers membres, j\'ai analysé les règles du carrefour Happy. Beaucoup ignorent que la priorité à droite s\'applique en l\'absence de panneaux, même si la voie semble principale. Dans le cas de l\'accident de la semaine dernière, le véhicule venant de la droite avait la priorité absolue. Commettre un délit de fuite après un tel accrochage est un délit pénal passible de 3 ans d\'emprisonnement et 75 000 € d\'amende. Protégez-vous en installant des dashcams !',
    imageUri: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400',
    time: 'Il y a 3 jours',
    likes: 42,
    commentsCount: 7
  },
];

export default function CommunauteScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <BrandBackdrop />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="scale-outline" size={26} color="#52b788" />
        <Text style={styles.headerTitle}>Communauté</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Collaborateurs')}>
          <Ionicons name="people-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main post list */}
      <View style={styles.feedContainer}>
        {POSTS.map((post) => (
          <TouchableOpacity 
            key={post.id} 
            style={styles.card}
            onPress={() => navigation.navigate('PostDetail', { post })}
          >
            {/* Visual thumbnail wrapper with text overlay */}
            <ImageBackground source={{ uri: post.imageUri }} style={styles.thumbnail}>
              <View style={styles.gradientOverlay} />
              
              <View style={styles.topInfo}>
                <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.author}>{post.auteur}</Text>
                  <Text style={styles.time}>{post.time}</Text>
                </View>
              </View>

              <View style={styles.bottomInfo}>
                <Text style={styles.titre}>{post.titre}</Text>
                <Text style={styles.excerpt} numberOfLines={2}>{post.excerpt}</Text>
              </View>
            </ImageBackground>

            {/* Interaction Bar */}
            <View style={styles.interactionBar}>
              <View style={styles.stat}>
                <Ionicons name="heart-outline" size={16} color="#888" style={{ marginRight: 4 }} />
                <Text style={styles.statText}>{post.likes} J'aime</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="chatbubble-outline" size={16} color="#888" style={{ marginRight: 4 }} />
                <Text style={styles.statText}>{post.commentsCount} Commentaires</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16,
    paddingTop: 54, paddingBottom: 16, backgroundColor: 'rgba(17, 27, 23, 0.92)',
    borderBottomWidth: 1, borderBottomColor: colors.primaryDeep },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  
  feedContainer: { padding: 16 },
  card: { borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(17, 27, 23, 0.96)', marginBottom: 18,
    borderWidth: 1, borderColor: colors.primaryDeep, ...shadows.card },
  
  thumbnail: { height: 250, justifyContent: 'space-between', padding: 16 },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0, 0, 0, 0.48)' },
  
  topInfo: { flexDirection: 'row', alignItems: 'center', zIndex: 2 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#333',
    marginRight: 10, borderWidth: 1, borderColor: '#52b788' },
  author: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  time: { color: '#bbb', fontSize: 11, marginTop: 1 },
  
  bottomInfo: { zIndex: 2 },
  titre: { color: '#fff', fontSize: 16, fontWeight: 'bold', lineHeight: 22, textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  excerpt: { color: '#ddd', fontSize: 12, marginTop: 6, lineHeight: 16, textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  
  interactionBar: { flexDirection: 'row', alignItems: 'center', padding: 14, borderTopWidth: 1, borderTopColor: colors.borderSoft },
  stat: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  statText: { color: '#888', fontSize: 12 }
});
