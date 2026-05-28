import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import ReponseJuridique from '../../components/ReponseJuridique';
import api from '../../services/api';

export default function ConsultationScreen() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [reponse, setReponse] = useState(null);

  const envoyerConsultation = async () => {
    if (description.trim() === '') {
      Alert.alert('Erreur', 'Veuillez décrire votre situation.');
      return;
    }

    try {
      setLoading(true);
      setReponse(null);

      const response = await api.post('/consultations', {
        description: description,
      });

      setReponse(response.data);
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Erreur',
        "Impossible d'envoyer la consultation. Vérifiez le backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.menu}>☰</Text>
        <Text style={styles.headerTitle}>JuriConstat</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!reponse && !loading && (
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeText}>
              Comment votre assistant juridique peut vous aider aujourd’hui ?
            </Text>
          </View>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1f6fff" />
            <Text style={styles.loadingText}>Analyse juridique en cours...</Text>
          </View>
        )}

        {reponse && (
          <View style={styles.responseBox}>
            <ReponseJuridique
              articles={reponse.articles}
              actions={reponse.actions}
              confiance={reponse.confiance}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <Text style={styles.plus}>+</Text>

        <TextInput
          style={styles.input}
          placeholder="Demandez à l’IA..."
          placeholderTextColor="#777"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity style={styles.sendButton} onPress={envoyerConsultation}>
          <Text style={styles.sendText}>➜</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        <Text style={styles.navItem}>Assistant IA</Text>
        <Text style={styles.navItem}>Community</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#20211f',
  },
  header: {
    height: 58,
    backgroundColor: '#050505',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  menu: {
    color: '#fff',
    fontSize: 22,
    marginRight: 14,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontStyle: 'italic',
  },
  content: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  welcomeBox: {
    marginBottom: 25,
    backgroundColor: '#2c2d2b',
    padding: 14,
    borderRadius: 4,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  loadingBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loadingText: {
    color: '#ddd',
    marginTop: 10,
  },
  responseBox: {
    marginBottom: 20,
  },
  inputContainer: {
    minHeight: 48,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 24,
    backgroundColor: '#242424',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  plus: {
    color: '#aaa',
    fontSize: 24,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    maxHeight: 90,
    fontSize: 14,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f4fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomNav: {
    height: 48,
    borderTopWidth: 1,
    borderTopColor: '#444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#20211f',
  },
  navItem: {
    color: '#ddd',
    fontSize: 12,
  },
});