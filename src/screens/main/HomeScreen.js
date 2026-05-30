import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ActivityIndicator,
  KeyboardAvoidingView, Platform, Image, Alert, Animated, Pressable,
  LayoutAnimation, UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function HomeScreen({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Attachment states
  const [attachment, setAttachment] = useState(null); // { uri, type, base64, mimeType, name, duration }
  
  // Voice recording states
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  // Playback states
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Drawer Animation and state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(0)); // 0 = closed, 1 = open
  const [recentConversations, setRecentConversations] = useState([]);

  // Animation values for recording pulse
  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulse animation loop for active recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Handle timer for recording duration
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Handle navigation parameters for loading past conversations
  useEffect(() => {
    if (route?.params?.selectedConversation) {
      loadPastConversation(route.params.selectedConversation);
    }
  }, [route?.params?.selectedConversation]);

  // Fetch recent conversations for the drawer list
  const loadRecentConsultations = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/consultations/user/${user.id}`);
      setRecentConversations(res.data || []);
    } catch (err) {
      console.error('Failed to fetch recent consultations', err);
    }
  };

  useEffect(() => {
    loadRecentConsultations();
  }, [user]);

  // Animation helper for opening/closing drawer
  const toggleDrawer = (open) => {
    if (open) {
      setIsDrawerOpen(true);
      loadRecentConsultations();
      Animated.timing(drawerAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsDrawerOpen(false));
    }
  };

  const loadPastConversation = (c) => {
    // Determine attachment if present
    let attachmentObj = null;
    if (c.mediaData) {
      let type = 'image';
      if (c.mediaMimeType?.startsWith('audio/')) {
        type = 'audio';
      } else if (c.mediaMimeType?.startsWith('video/')) {
        type = 'video';
      }
      attachmentObj = {
        uri: c.mediaData.startsWith('data:') ? c.mediaData : `data:${c.mediaMimeType};base64,${c.mediaData}`,
        type: type,
        name: type === 'audio' ? 'Message Vocal' : 'Fichier média',
        duration: 0
      };
    }

    const userMsg = {
      id: c.id,
      role: 'user',
      text: c.requete,
      attachment: attachmentObj
    };

    const botMsg = {
      id: c.id + 1,
      role: 'bot',
      text: c.reponseIa
    };

    setMessages([userMsg, botMsg]);
  };

  const resetDiscussion = () => {
    setMessages([]);
    setInput('');
    setAttachment(null);
    setIsPlaying(false);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    toggleDrawer(false);
  };

  // --- Voice Recording Logic ---
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert("Permission requise", "L'accès au microphone est nécessaire pour enregistrer des messages vocaux.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Erreur', "Impossible de lancer l'enregistrement audio.");
    }
  };

  const stopRecording = async (shouldAttach = true) => {
    if (!recording) return;
    setIsRecording(false);
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (shouldAttach && uri) {
        // Read file as base64
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const mimeType = Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4';
        
        setAttachment({
          uri,
          type: 'audio',
          base64: base64Data,
          mimeType,
          name: `Message Vocal (${recordingDuration}s)`,
          duration: recordingDuration,
        });
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  // Playback of attached voice note
  const playSound = async () => {
    if (!attachment || attachment.type !== 'audio') return;
    
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
      return;
    }

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: attachment.uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          newSound.unloadAsync();
          setSound(null);
        }
      });
    } catch (err) {
      console.error('Failed to play sound', err);
    }
  };

  // --- Media Picking Logic ---
  const pickMedia = async (useCamera = false) => {
    const permission = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert(
        "Permission requise",
        `L'accès à la ${useCamera ? 'caméra' : 'bibliothèque'} est requis pour joindre des fichiers.`
      );
      return;
    }

    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    };

    const result = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      
      let mimeType = asset.mimeType || 'image/jpeg';
      if (asset.type === 'video') {
        mimeType = 'video/mp4';
      }

      let base64Data = asset.base64;
      if (!base64Data) {
        base64Data = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      setAttachment({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        base64: base64Data,
        mimeType,
        name: asset.type === 'video' ? 'Vidéo' : 'Image',
      });
    }
  };

  const deleteAttachment = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
    setAttachment(null);
  };

  // --- Send Message ---
  const sendMessage = async () => {
    if (!input.trim() && !attachment) return;
    
    // Add user message to UI local list
    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: input.trim(),
      attachment: attachment ? {
        uri: attachment.uri,
        type: attachment.type,
        name: attachment.name,
        duration: attachment.duration
      } : null
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((prev) => [...prev, userMsg]);
    
    // Cache current inputs and clear form immediately for visual responsiveness
    const currentInput = input;
    const currentAttachment = attachment;
    
    setInput('');
    setAttachment(null);
    setIsPlaying(false);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }

    setLoading(true);

    try {
      // Build request payload for the backend
      const payload = {
        requete: currentInput.trim() || (currentAttachment.type === 'audio' ? "Analyse de cette note vocale." : "Analyse de ce fichier média."),
      };

      if (currentAttachment) {
        payload.mediaData = currentAttachment.base64;
        payload.mediaMimeType = currentAttachment.mimeType;
      }

      const res = await api.post('/consultations', payload);
      
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: res.data.reponseIa,
      };
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages((prev) => [...prev, botMsg]);
      // Reload drawer consultations silently so history updates
      loadRecentConsultations();
    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: '⚠️ Une erreur est survenue lors de la communication avec JuriConstat. Veuillez vérifier votre connexion et réessayez.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const showAttachmentOptions = () => {
    Alert.alert(
      "Joindre un fichier",
      "Sélectionnez la source de votre fichier média :",
      [
        { text: "Prendre une Photo/Vidéo", onPress: () => pickMedia(true) },
        { text: "Choisir depuis la Galerie", onPress: () => pickMedia(false) },
        { text: "Annuler", style: "cancel" }
      ]
    );
  };

  // Interpolation styles for sliding drawer
  const drawerTranslateX = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-290, 0],
  });

  const backdropOpacity = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="menu" size={26} color="#fff" onPress={() => toggleDrawer(true)} />
          <Text style={styles.headerTitle}>JuriConstat <Text style={{color: '#2d6a4f', fontSize: 13}}>• Assistant IA</Text></Text>
          <TouchableOpacity onPress={() => Alert.alert("JuriConstat IA", "Votre assistant juridique 24/7 alimenté par Gemini 2.5 Flash.")}>
            <Ionicons name="information-circle-outline" size={26} color="#2d6a4f" />
          </TouchableOpacity>
        </View>

        {/* Message list */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messages}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.logoContainer}>
                <Ionicons name="scale-outline" size={60} color="#2d6a4f" />
              </View>
              <Text style={styles.emptyTextTitle}>Comment votre assistant Juridique{'\n'}peut vous aider aujourd'hui ?...</Text>
              <Text style={styles.emptyTextSub}>
                Posez votre question juridique par texte, envoyez une photo de document, ou enregistrez un message vocal pour obtenir une analyse instantanée.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.botBubble
            ]}>
              {/* If the message has an attachment */}
              {item.attachment && (
                <View style={styles.bubbleAttachmentContainer}>
                  {item.attachment.type === 'image' && (
                    <Image source={{ uri: item.attachment.uri }} style={styles.bubbleImage} resizeMode="cover" />
                  )}
                  {item.attachment.type === 'video' && (
                    <View style={styles.bubbleVideoPlaceholder}>
                      <Ionicons name="play-circle-outline" size={40} color="#fff" />
                      <Text style={{color: '#fff', marginTop: 4, fontSize: 12}}>Vidéo jointe</Text>
                    </View>
                  )}
                  {item.attachment.type === 'audio' && (
                    <View style={styles.bubbleAudioCard}>
                      <Ionicons name="mic" size={24} color="#fff" />
                      <Text style={styles.bubbleAudioText}>Note Vocale ({formatDuration(item.attachment.duration)})</Text>
                    </View>
                  )}
                </View>
              )}
              
              {/* Text message */}
              {item.text ? <Text style={styles.bubbleText}>{item.text}</Text> : null}
            </View>
          )}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#52b788" size="small" />
            <Text style={styles.loadingText}>JuriConstat IA analyse votre requête...</Text>
          </View>
        )}

        {/* Attachment Preview (above input bar) */}
        {attachment && (
          <View style={styles.previewContainer}>
            <View style={styles.previewContent}>
              {attachment.type === 'image' && (
                <Image source={{ uri: attachment.uri }} style={styles.previewThumbnail} />
              )}
              {(attachment.type === 'video' || attachment.type === 'audio') && (
                <View style={[styles.previewThumbnail, styles.previewIconContainer]}>
                  <Ionicons name={attachment.type === 'video' ? "videocam" : "mic"} size={22} color="#52b788" />
                </View>
              )}
              <View style={styles.previewDetails}>
                <Text style={styles.previewTitle} numberOfLines={1}>{attachment.name}</Text>
                {attachment.type === 'audio' && (
                  <TouchableOpacity style={styles.playPreviewBtn} onPress={playSound}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={16} color="#fff" />
                    <Text style={styles.playPreviewText}>{isPlaying ? "Pause" : "Écouter"}</Text>
                  </TouchableOpacity>
                )}
                {attachment.type !== 'audio' && (
                  <Text style={styles.previewSub}>Fichier prêt à être analysé</Text>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.deletePreviewBtn} onPress={deleteAttachment}>
              <Ionicons name="close-circle" size={24} color="#f25c54" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Row / Recording Panel */}
        <View style={styles.inputRow}>
          {isRecording ? (
            /* Active Recording UI */
            <View style={styles.recordingContainer}>
              <View style={styles.recordingLeft}>
                <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={styles.recordingTimer}>Enregistrement : {formatDuration(recordingDuration)}</Text>
              </View>
              <View style={styles.recordingRight}>
                <TouchableOpacity style={styles.recordingCancelBtn} onPress={() => stopRecording(false)}>
                  <Ionicons name="trash" size={20} color="#f25c54" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.recordingStopBtn} onPress={() => stopRecording(true)}>
                  <Ionicons name="checkmark-circle" size={26} color="#52b788" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Standard Input UI */
            <>
              <TouchableOpacity style={styles.plusBtn} onPress={showAttachmentOptions}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.input}
                placeholder="Demandez à l'IA..."
                placeholderTextColor="#666"
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={2000}
              />

              {/* Voice note trigger button */}
              {!input.trim() && !attachment && (
                <TouchableOpacity style={styles.micBtn} onPress={startRecording}>
                  <Ionicons name="mic" size={20} color="#fff" />
                </TouchableOpacity>
              )}

              {/* Send button */}
              {(input.trim() || attachment) && (
                <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* --- SIDEBAR DRAWER OVERLAY --- */}
      {isDrawerOpen && (
        <View style={StyleSheet.absoluteFill}>
          {/* Backdrop */}
          <Pressable style={styles.drawerBackdrop} onPress={() => toggleDrawer(false)}>
            <Animated.View style={[styles.drawerBackdropBackground, { opacity: backdropOpacity }]} />
          </Pressable>

          {/* Drawer Content */}
          <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: drawerTranslateX }] }]}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerBrand}>JuriConstat</Text>
              <Ionicons name="close" size={24} color="#aaa" onPress={() => toggleDrawer(false)} />
            </View>

            {/* Top action shortcuts */}
            <View style={styles.drawerActions}>
              <TouchableOpacity style={styles.drawerActionBtn} onPress={resetDiscussion}>
                <Ionicons name="add" size={20} color="#fff" style={styles.drawerActionIcon} />
                <Text style={styles.drawerActionText}>Nouvelle discussion</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerActionBtn} onPress={() => { toggleDrawer(false); navigation.navigate('SearchHistory'); }}>
                <Ionicons name="search" size={18} color="#aaa" style={styles.drawerActionIcon} />
                <Text style={styles.drawerActionTextSecondary}>Rechercher dans les conv...</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerActionBtn} onPress={() => { toggleDrawer(false); navigation.navigate('Collaborateurs'); }}>
                <Ionicons name="people" size={18} color="#aaa" style={styles.drawerActionIcon} />
                <Text style={styles.drawerActionTextSecondary}>Collaborateurs</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.drawerActionBtn, { borderColor: '#1a73e8' }]} onPress={() => { toggleDrawer(false); navigation.navigate('ConstatNumerique'); }}>
                <Ionicons name="document-text-outline" size={18} color="#1a73e8" style={styles.drawerActionIcon} />
                <Text style={[styles.drawerActionTextSecondary, { color: '#4a90e2' }]}>Constat numérique</Text>
              </TouchableOpacity>
            </View>

            {/* Recents list title */}
            <View style={styles.drawerSectionTitleContainer}>
              <Text style={styles.drawerSectionTitle}>Récents</Text>
            </View>

            {/* Recents consultations list */}
            <FlatList
              data={recentConversations}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.drawerList}
              ListEmptyComponent={
                <Text style={styles.drawerListEmpty}>Aucune consultation récente</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.drawerListItem}
                  onPress={() => {
                    loadPastConversation(item);
                    toggleDrawer(false);
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={16} color="#888" style={{ marginRight: 10 }} />
                  <Text style={styles.drawerListItemText} numberOfLines={1}>
                    {item.requete || "Note vocale"}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* Bottom Profile Panel */}
            <TouchableOpacity 
              style={styles.drawerProfileCard}
              onPress={() => {
                toggleDrawer(false);
                navigation.navigate('Profil');
              }}
            >
              <View style={styles.drawerProfileAvatar}>
                <Text style={styles.drawerProfileInitials}>
                  {user?.nom ? user.nom.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : 'JD'}
                </Text>
              </View>
              <View style={styles.drawerProfileInfo}>
                <Text style={styles.drawerProfileName} numberOfLines={1}>{user?.nom || 'Choussi Akuta'}</Text>
                <Text style={styles.drawerProfileEmail} numberOfLines={1}>{user?.email || 'choussi69@gmail.com'}</Text>
              </View>
              <Ionicons name="settings-outline" size={20} color="#888" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  header: { flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16,
    paddingTop: 54, paddingBottom: 16, backgroundColor: '#141414',
    borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  
  messages: { padding: 16, flexGrow: 1, paddingBottom: 40 },
  
  // Empty State Design System
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120, paddingHorizontal: 32 },
  logoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#141414',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#2d6a4f' },
  emptyTextTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  emptyTextSub: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  
  // Bubbles
  bubble: { maxWidth: '85%', padding: 14, borderRadius: 16, marginBottom: 16 },
  userBubble: { backgroundColor: '#1b4332', alignSelf: 'flex-end',
    borderBottomRightRadius: 4, borderWidth: 1, borderColor: '#2d6a4f' },
  botBubble: { backgroundColor: '#161616', alignSelf: 'flex-start',
    borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#2a2a2a' },
  bubbleText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  
  // Bubble Attachments
  bubbleAttachmentContainer: { marginBottom: 10, borderRadius: 12, overflow: 'hidden' },
  bubbleImage: { width: 220, height: 150, borderRadius: 10 },
  bubbleVideoPlaceholder: { width: 220, height: 150, backgroundColor: '#222', 
    justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  bubbleAudioCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d0d0d',
    padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#333', width: 200 },
  bubbleAudioText: { color: '#fff', marginLeft: 8, fontSize: 13, fontWeight: '500' },

  // Attachment Preview UI
  previewContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#161616',
    borderTopWidth: 1, borderTopColor: '#333' },
  previewContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  previewThumbnail: { width: 44, height: 44, borderRadius: 8, marginRight: 12 },
  previewIconContainer: { backgroundColor: '#0d0d0d', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#333' },
  previewDetails: { flex: 1, justifyContent: 'center' },
  previewTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  previewSub: { color: '#888', fontSize: 11, marginTop: 2 },
  playPreviewBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2d6a4f',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4, alignSelf: 'flex-start' },
  playPreviewText: { color: '#fff', fontSize: 11, marginLeft: 4, fontWeight: 'bold' },
  deletePreviewBtn: { padding: 4 },

  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  loadingText: { color: '#888', fontSize: 12, marginLeft: 8 },

  // Input area
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#141414', borderTopWidth: 1, borderTopColor: '#222', paddingBottom: Platform.OS === 'ios' ? 24 : 10 },
  plusBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222',
    justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  input: { flex: 1, color: '#fff', backgroundColor: '#222', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 8, fontSize: 15, marginRight: 8, maxHeight: 100 },
  micBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2d6a4f',
    justifyContent: 'center', alignItems: 'center' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#52b788',
    justifyContent: 'center', alignItems: 'center' },

  // Recording Active Panel
  recordingContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 40, paddingHorizontal: 4 },
  recordingLeft: { flexDirection: 'row', alignItems: 'center' },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#f25c54', marginRight: 8 },
  recordingTimer: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  recordingRight: { flexDirection: 'row', alignItems: 'center' },
  recordingCancelBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2a1a1c',
    justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  recordingStopBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a2a22',
    justifyContent: 'center', alignItems: 'center' },

  // --- SIDEBAR DRAWER STYLES ---
  drawerBackdrop: { ...StyleSheet.absoluteFillObject },
  drawerBackdropBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  drawerContainer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 280,
    backgroundColor: '#141414', borderRightWidth: 1, borderRightColor: '#222', zIndex: 100,
    paddingTop: 54, flexDirection: 'column' },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  drawerBrand: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  
  drawerActions: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  drawerActionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e',
    paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8, marginBottom: 10,
    borderWidth: 1, borderColor: '#333' },
  drawerActionIcon: { marginRight: 12 },
  drawerActionText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  drawerActionTextSecondary: { color: '#ccc', fontSize: 14 },
  
  drawerSectionTitleContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  drawerSectionTitle: { color: '#666', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  
  drawerList: { paddingHorizontal: 8 },
  drawerListEmpty: { color: '#555', fontSize: 13, paddingHorizontal: 12, paddingTop: 10, fontStyle: 'italic' },
  drawerListItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12,
    borderRadius: 8, marginBottom: 4 },
  drawerListItemText: { color: '#ccc', fontSize: 14, flex: 1 },
  
  drawerProfileCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1,
    borderTopColor: '#222', backgroundColor: '#111', height: 74 },
  drawerProfileAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#c1121f',
    justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  drawerProfileInitials: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  drawerProfileInfo: { flex: 1 },
  drawerProfileName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  drawerProfileEmail: { color: '#666', fontSize: 11, marginTop: 1 }
});