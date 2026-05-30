import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

import api from '../../services/api';

export default function AdminScreen({ route }) {
  const userRole = route?.params?.role || 'USER';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole === 'ADMIN') {
      chargerUtilisateurs();
    } else {
      setLoading(false);
    }
  }, []);

  const chargerUtilisateurs = async () => {
    try {
      setLoading(true);

      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Erreur',
        'Impossible de charger la liste des utilisateurs.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.nom || item.name}</Text>
      <Text style={styles.email}>{item.email}</Text>
      <Text style={styles.count}>
        Consultations : {item.nbConsultations || 0}
      </Text>
    </View>
  );

  if (userRole !== 'ADMIN') {
    return (
      <View style={styles.center}>
        <Text style={styles.forbiddenTitle}>Accès refusé</Text>
        <Text style={styles.forbiddenText}>
          Cette page est réservée aux administrateurs.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text>Chargement des utilisateurs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administration</Text>

      <FlatList
        data={users}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun utilisateur trouvé.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  email: {
    color: '#555',
    marginTop: 4,
  },
  count: {
    marginTop: 8,
    fontWeight: '600',
    color: '#0066cc',
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#777',
  },
  forbiddenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  forbiddenText: {
    textAlign: 'center',
    fontSize: 16,
  },
});