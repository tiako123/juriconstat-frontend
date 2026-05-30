import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';

import ReponseJuridique from '../../components/ReponseJuridique';
import api from '../../services/api';

export default function HistoriqueScreen() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {
    chargerHistorique();
  }, []);

  const chargerHistorique = async () => {
    try {
      setLoading(true);

      const userId = 1;
      const response = await api.get(`/consultations/user/${userId}`);

      setConsultations(response.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Erreur', "Impossible de charger l'historique.");
    } finally {
      setLoading(false);
    }
  };

  const afficherDebutTexte = (texte) => {
    if (!texte) return 'Consultation juridique...';
    return texte.length > 35 ? texte.substring(0, 35) + '...' : texte;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => setSelectedConsultation(item)}
    >
      <Text style={styles.itemTitle}>
        {afficherDebutTexte(item.description || item.texte)}
      </Text>
      <Text style={styles.date}>{item.date || 'Date non précisée'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.menu}>☰</Text>
        <Text style={styles.headerTitle}>Historique</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Récents</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#1f6fff" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <FlatList
            data={consultations}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.empty}>Aucune consultation trouvée.</Text>
            }
          />
        )}
      </View>

      <Modal
        visible={selectedConsultation !== null}
        animationType="slide"
        onRequestClose={() => setSelectedConsultation(null)}
      >
        <ScrollView contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Détail de la consultation</Text>

          {selectedConsultation && (
            <>
              <Text style={styles.label}>Situation décrite :</Text>

              <Text style={styles.fullText}>
                {selectedConsultation.description || selectedConsultation.texte}
              </Text>

              <ReponseJuridique
                articles={selectedConsultation.articles}
                actions={selectedConsultation.actions}
                confiance={selectedConsultation.confiance}
              />
            </>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedConsultation(null)}
          >
            <Text style={styles.closeText}>Fermer</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

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
  container: {
    flex: 1,
    padding: 18,
  },
  sectionTitle: {
    color: '#777',
    fontSize: 15,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  item: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  itemTitle: {
    color: '#fff',
    fontSize: 15,
    fontStyle: 'italic',
  },
  date: {
    color: '#777',
    fontSize: 12,
    marginTop: 4,
  },
  center: {
    alignItems: 'center',
    marginTop: 30,
  },
  loadingText: {
    color: '#ccc',
    marginTop: 8,
  },
  empty: {
    color: '#777',
    textAlign: 'center',
    marginTop: 30,
  },
  modal: {
    flexGrow: 1,
    backgroundColor: '#20211f',
    padding: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fullText: {
    color: '#ddd',
    backgroundColor: '#2c2d2b',
    padding: 14,
    borderRadius: 8,
    lineHeight: 21,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#1f6fff',
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 25,
  },
  closeText: {
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
  },
  navItem: {
    color: '#ddd',
    fontSize: 12,
  },
});