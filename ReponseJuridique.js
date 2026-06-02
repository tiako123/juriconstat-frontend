import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const convertirEnListe = (valeur) => {
    if (Array.isArray(valeur)) return valeur;
    if (!valeur) return [];
    return [String(valeur)];
};

const obtenirConfiance = (confiance) => {
    const valeur = String(confiance ?? '').trim().toLowerCase();

    if (['élevé', 'eleve', 'élevée', 'elevee', 'high'].includes(valeur)) {
        return {
            label: 'Élevé',
            style: styles.badgeEleve,
        };
    }

    if (['moyen', 'moyenne', 'medium'].includes(valeur)) {
        return {
            label: 'Moyen',
            style: styles.badgeMoyen,
        };
    }

    return {
        label: 'Faible',
        style: styles.badgeFaible,
    };
};

export default function ReponseJuridique({
    articles,
    actions,
    confiance,
}) {
    const listeArticles = convertirEnListe(articles);
    const listeActions = convertirEnListe(actions);
    const niveauConfiance = obtenirConfiance(confiance);

    return (
        <View style={styles.container}>
            <View style={[styles.badge, niveauConfiance.style]}>
                <Text style={styles.badgeText}>
                    Confiance : {niveauConfiance.label}
                </Text>
            </View>

            <View style={[styles.card, styles.cardBleue]}>
                <Text style={styles.cardTitle}>Articles de loi</Text>

                {listeArticles.length > 0 ? (
                    listeArticles.map((article, index) => (
                        <Text key={`${article}-${index}`} style={styles.cardText}>
                            • {article}
                        </Text>
                    ))
                ) : (
                    <Text style={styles.cardText}>
                        Aucun article identifié.
                    </Text>
                )}
            </View>

            <View style={[styles.card, styles.cardVerte]}>
                <Text style={styles.cardTitle}>Actions à faire</Text>

                {listeActions.length > 0 ? (
                    listeActions.map((action, index) => (
                        <Text key={`${action}-${index}`} style={styles.cardText}>
                            • {action}
                        </Text>
                    ))
                ) : (
                    <Text style={styles.cardText}>
                        Aucune action proposée.
                    </Text>
                )}
            </View>

            <Text style={styles.avertissement}>
                Cette réponse est informative et ne remplace pas l’avis d’un professionnel.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },

    badge: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 11,
        borderRadius: 16,
    },

    badgeEleve: {
        backgroundColor: '#258A50',
    },

    badgeMoyen: {
        backgroundColor: '#D08000',
    },

    badgeFaible: {
        backgroundColor: '#B83D3D',
    },

    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },

    card: {
        borderRadius: 9,
        borderLeftWidth: 4,
        padding: 13,
    },

    cardBleue: {
        backgroundColor: '#17283B',
        borderLeftColor: '#3C8DFF',
    },

    cardVerte: {
        backgroundColor: '#183425',
        borderLeftColor: '#38B76A',
    },

    cardTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 7,
    },

    cardText: {
        color: '#E3E3E3',
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 4,
    },

    avertissement: {
        color: '#929292',
        fontSize: 11,
        fontStyle: 'italic',
        lineHeight: 15,
        marginTop: 2,
    },
});