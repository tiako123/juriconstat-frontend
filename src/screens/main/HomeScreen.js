import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function HomeScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/consultations', {
        requete: input,
      });
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: res.data.reponseIa,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: 'Une erreur est survenue. Réessayez.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Ionicons name="menu" size={24} color="#fff"
          onPress={() => navigation.openDrawer?.()} />
        <Text style={styles.headerTitle}>JuriConstat</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messages}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Comment votre assistant Juridique{'\n'}
              peut vous aider aujourd'hui ?...
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[
            styles.bubble,
            item.role === 'user' ? styles.userBubble : styles.botBubble
          ]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
      />
      {loading && <ActivityIndicator color="#fff" style={{ margin: 8 }} />}
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.plusBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Demandez à l'IA..."
          placeholderTextColor="#666"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="mic-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  header: { flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
    paddingTop: 50, backgroundColor: '#1a1a1a' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  messages: { padding: 16, flexGrow: 1, justifyContent: 'flex-end' },
  empty: { flex: 1, justifyContent: 'center',
    alignItems: 'center', marginTop: 200 },
  emptyText: { color: '#555', fontSize: 16,
    textAlign: 'center', fontStyle: 'italic' },
  bubble: { maxWidth: '80%', padding: 12,
    borderRadius: 12, marginBottom: 12 },
  userBubble: { backgroundColor: '#2d6a4f', alignSelf: 'flex-end' },
  botBubble: { backgroundColor: '#1a1a1a', alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#333' },
  bubbleText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center',
    padding: 12, backgroundColor: '#1a1a1a',
    borderTopWidth: 1, borderTopColor: '#333' },
  plusBtn: { width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#333', justifyContent: 'center',
    alignItems: 'center', marginRight: 8 },
  input: { flex: 1, color: '#fff', backgroundColor: '#333',
    borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 8, fontSize: 14, marginRight: 8 },
  sendBtn: { width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#333', justifyContent: 'center',
    alignItems: 'center', marginLeft: 4 },
});