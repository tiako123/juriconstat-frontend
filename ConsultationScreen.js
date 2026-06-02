import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import api from '../../services/api';
import ReponseJuridique from '../../components/ReponseJuridique';

const DEMO_MODE = true;

const REPONSE_DEMO = {
    articles: [
        'Article 1382 : toute personne doit respecter ses obligations.',
        'Article 1383 : les dommages causés peuvent engager une responsabilité.',
    ],
    actions: [
        'Conserver les preuves et les documents utiles.',
        'Contacter un professionnel du droit si la situation persiste.',
    ],
    confiance: 'Élevé',
};

const attendre = (temps) =>
    new Promise((resolve) => setTimeout(resolve, temps));

export default function ConsultationScreen({ navigation }) {
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [reponse, setReponse] = useState(null);

    const ouvrirMenu = () => {
        if (navigation?.openDrawer) {
            navigation.openDrawer();
        }
    };

    const envoyerConsultation = async () => {
        const texte = description.trim();

        if (!texte) {
            Alert.alert(
                'Situation manquante',
                'Décrivez votre situation avant de l’envoyer.'
            );

            return;
        }

        try {
            setLoading(true);
            setReponse(null);

            if (DEMO_MODE) {
                await attendre(800);
                setReponse(REPONSE_DEMO);
                return;
            }

            const response = await api.post('/consultations', {
                description: texte,
            });

            const donnees = response.data?.data ?? response.data;
            const resultat = donnees?.reponse ?? donnees;

            setReponse({
                articles: resultat?.articles ?? [],
                actions: resultat?.actions ?? [],
                confiance: resultat?.confiance ?? 'Moyen',
            });
        } catch (error) {
            console.log('POST /consultations :', error);

            Alert.alert(
                'Erreur',
                "La consultation n'a pas pu être envoyée. Vérifiez api.js et le backend."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.screen}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <Pressable onPress={ouvrirMenu} hitSlop={12}>
                        <MaterialCommunityIcons
                            name="menu"
                            size={22}
                            color="#F4F4F4"
                        />
                    </Pressable>

                    <Text style={styles.headerTitle}>JuriConstat</Text>
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {!loading && !reponse && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                Comment votre assistant juridique peut vous aider aujourd’hui ?
                            </Text>
                        </View>
                    )}

                    {loading && (
                        <View style={styles.loading}>
                            <ActivityIndicator
                                size="large"
                                color="#4361EE"
                            />

                            <Text style={styles.loadingText}>
                                Analyse juridique en cours...
                            </Text>
                        </View>
                    )}

                    {reponse && (
                        <ReponseJuridique
                            articles={reponse.articles}
                            actions={reponse.actions}
                            confiance={reponse.confiance}
                        />
                    )}
                </ScrollView>

                <View style={styles.composer}>
                    <MaterialCommunityIcons
                        name="plus-circle-outline"
                        size={23}
                        color="#8E8E93"
                    />

                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Demandez à l’IA..."
                        placeholderTextColor="#77777D"
                        multiline
                        style={styles.input}
                    />

                    <Pressable
                        style={({ pressed }) => [
                            styles.sendButton,
                            pressed && styles.sendButtonPressed,
                        ]}
                        onPress={envoyerConsultation}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                            />
                        ) : (
                            <MaterialCommunityIcons
                                name="arrow-up"
                                size={18}
                                color="#FFFFFF"
                            />
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#050505',
    },

    screen: {
        flex: 1,
        backgroundColor: '#20211F',
    },

    header: {
        minHeight: 54,
        paddingHorizontal: 16,
        backgroundColor: '#050505',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    headerTitle: {
        color: '#F4F4F4',
        fontSize: 16,
        fontStyle: 'italic',
        fontWeight: '600',
    },

    scroll: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },

    emptyState: {
        backgroundColor: '#282927',
        padding: 12,
        marginBottom: 6,
    },

    emptyText: {
        color: '#F4F4F4',
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 19,
    },

    loading: {
        alignItems: 'center',
        paddingVertical: 32,
    },

    loadingText: {
        marginTop: 10,
        color: '#D5D5D5',
        fontSize: 13,
    },

    composer: {
        minHeight: 48,
        marginHorizontal: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#4A4A4A',
        borderRadius: 24,
        backgroundColor: '#242424',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        gap: 8,
    },

    input: {
        flex: 1,
        maxHeight: 96,
        paddingVertical: 10,
        color: '#FFFFFF',
        fontSize: 14,
    },

    sendButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3449D3',
    },

    sendButtonPressed: {
        opacity: 0.75,
    },
});