import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, TextInput, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme';
import BrandBackdrop from '../../components/BrandBackdrop';

export default function PostDetailScreen({ route, navigation }) {
  const { post } = route.params || {};
  const [likesCount, setLikesCount] = useState(post?.likes || 12);
  const [isLiked, setIsLiked] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  
  // Simulated initial comments list
  const [comments, setComments] = useState([
    { id: 1, author: 'Marc Dubois', role: 'Avocat JuriConstat', text: 'Bonjour Marie, dans ce genre de situation, le délit de fuite aggrave la responsabilité pénale du conducteur. Vous devez saisir le Fonds de Garantie Automobile pour vos frais médicaux immédiats. N\'hésitez pas à me contacter en consultation privée.' },
    { id: 2, author: 'Jean Kamga', role: 'Collaborateur', text: 'Courage Marie ! Suivez les conseils de Maître Dubois, il a géré mon dossier l\'année dernière avec beaucoup de professionnalisme.' }
  ]);

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Aucune publication sélectionnée.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    const newComment = {
      id: Date.now(),
      author: 'Choussi Akuta',
      role: 'Membre',
      text: commentInput.trim()
    };
    setComments(prev => [...prev, newComment]);
    setCommentInput('');
    Alert.alert("Succès", "Votre commentaire a été publié dans le flux communautaire !");
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BrandBackdrop />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBackBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détail du post</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Post Container */}
        <View style={styles.postCard}>
          {/* Author Header */}
          <View style={styles.authorRow}>
            <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{post.auteur}</Text>
              <Text style={styles.postTime}>{post.time}</Text>
            </View>
            <TouchableOpacity style={styles.moreBtn}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Title and Body */}
          <Text style={styles.postTitle}>{post.titreFull || post.titre}</Text>
          <Text style={styles.postBody}>{post.content}</Text>

          {/* Media Attachment */}
          {post.imageUri && (
            <Image source={{ uri: post.imageUri }} style={styles.postImage} resizeMode="cover" />
          )}

          {/* Action Row (Like, Comment, Share) */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={22} 
                color={isLiked ? "#f25c54" : "#888"} 
              />
              <Text style={[styles.actionBtnText, isLiked && { color: '#f25c54' }]}>
                {likesCount} J'aime
              </Text>
            </TouchableOpacity>

            <View style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={20} color="#888" />
              <Text style={styles.actionBtnText}>{comments.length} Commentaires</Text>
            </View>

            <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Partage", "Lien de la publication copié !")}>
              <Ionicons name="share-social-outline" size={20} color="#888" />
              <Text style={styles.actionBtnText}>Partager</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section Title */}
        <Text style={styles.commentsTitle}>Discussions communautaires</Text>

        {/* Comments list */}
        <View style={styles.commentsList}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{comment.role}</Text>
                </View>
              </View>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Persistent Bottom Comment Input */}
      <View style={styles.commentInputRow}>
        <TextInput
          style={styles.input}
          placeholder="Répondre à Marie..."
          placeholderTextColor="#666"
          value={commentInput}
          onChangeText={setCommentInput}
          maxLength={500}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendComment}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingBottom: 40 },
  
  errorContainer: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: colors.text, fontSize: 16, marginBottom: 20 },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primaryDeep, borderRadius: 8 },
  backText: { color: '#fff', fontWeight: 'bold' },

  header: { flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16,
    paddingTop: 54, paddingBottom: 16, backgroundColor: 'rgba(17, 27, 23, 0.92)',
    borderBottomWidth: 1, borderBottomColor: colors.primaryDeep },
  circleBackBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center', flex: 1 },

  postCard: { margin: 16, padding: 16, backgroundColor: 'rgba(17, 27, 23, 0.96)', borderWidth: 1, borderColor: colors.border, borderRadius: 18, ...shadows.card },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  authorAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#333', marginRight: 12 },
  authorDetails: { flex: 1 },
  authorName: { color: colors.text, fontSize: 15, fontWeight: '800' },
  postTime: { color: '#666', fontSize: 12, marginTop: 2 },
  moreBtn: { padding: 4 },
  
  postTitle: { color: colors.text, fontSize: 19, fontWeight: '800', lineHeight: 25, marginVertical: 10 },
  postBody: { color: colors.textSoft, fontSize: 14, lineHeight: 22, marginBottom: 16 },
  postImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16, backgroundColor: '#222' },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: 14 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionBtnText: { color: '#888', fontSize: 12, marginLeft: 6, fontWeight: '500' },

  commentsTitle: { color: colors.text, fontSize: 15, fontWeight: '800', margin: 16, marginBottom: 8 },
  commentsList: { paddingHorizontal: 16 },
  commentItem: { backgroundColor: 'rgba(17, 27, 23, 0.96)', padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  commentAuthor: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginRight: 8 },
  badge: { backgroundColor: '#2d6a4f', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  commentText: { color: '#aaa', fontSize: 13, lineHeight: 18 },

  commentInputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingBottom: Platform.OS === 'ios' ? 24 : 10 },
  input: { flex: 1, color: colors.text, backgroundColor: colors.bgSoft, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, marginRight: 8, maxHeight: 100 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center' }
});
