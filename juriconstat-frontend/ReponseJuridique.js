import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReponseJuridique({ articles, actions, confiance }) {
  const getBadgeStyle = () => {
    if (confiance === 'Élevé' || confiance === 'ELEVEE' || confiance === 'HIGH') {
      return styles.badgeEleve;
    }

    if (confiance === 'Moyen' || confiance === 'MOYENNE' || confiance === 'MEDIUM') {
      return styles.badgeMoyen;
    }

    return styles.badgeFaible;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.badge, getBadgeStyle()]}>
        <Text style={styles.badgeText}>
          Confiance : {confiance || 'Non précisée'}
        </Text>
      </View>

      <View style={styles.sectionBlue}>
        <Text style={styles.sectionTitle}>Articles de loi</Text>

        {articles && articles.length > 0 ? (
          articles.map((article, index) => (
            <Text key={index} style={styles.text}>
              • {article}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>Aucun article trouvé.</Text>
        )}
      </View>

      <View style={styles.sectionGreen}>
        <Text style={styles.sectionTitle}>Actions à faire</Text>

        {actions && actions.length > 0 ? (
          actions.map((action, index) => (
            <Text key={index} style={styles.text}>
              • {action}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>Aucune action proposée.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 20,
  },
  badgeEleve: {
    backgroundColor: '#1f8f4d',
  },
  badgeMoyen: {
    backgroundColor: '#d98c00',
  },
  badgeFaible: {
    backgroundColor: '#c93c3c',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  sectionBlue: {
    backgroundColor: '#16283d',
    borderLeftWidth: 4,
    borderLeftColor: '#2d8cff',
    padding: 14,
    borderRadius: 8,
  },
  sectionGreen: {
    backgroundColor: '#183425',
    borderLeftWidth: 4,
    borderLeftColor: '#35b86b',
    padding: 14,
    borderRadius: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    color: '#e6e6e6',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 5,
  },
});