import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import api from '../../services/api';
import ReponseJuridique from '../../components/ReponseJuridique';

const DEMO_MODE = true;

const CONSULTATIONS_DEMO = [
    {
        id: 1,
        date: 'Aujourd’hui',
        description: 'Réagir en cas d’accident de la route...',
        articles: [
            'Article 1382 : responsabilité civile.',
        ],
        actions: [
            'Conserver les preuves.',
            'Signaler rapidement les faits.',
        ],
        confiance: 'Élevé',
    },

    {
        id: 2,
        date: 'Aujourd’hui',
        description: 'Recherche d’avocat spécialisé...',
        articles: [
            'Article 4 : accès à une assistance juridique.',
        ],
        actions: [
            'Préciser le domaine concerné.',
            'Comparer plusieurs professionnels.',
        ],
        confiance: 'Moyen',
    },

    {
        id: 3,
        date: 'Hier',
        description: 'Bagarre à l’école : quelles démarches effectuer ?',
        articles: [
            'Article 1383 : dommages causés à autrui.',
        ],
        actions: [
            'Informer un adulte responsable.',
            'Conserver les éléments utiles.',
        ],
        confiance: 'Moyen',
    },
];

export default function HistoriqueScreen({
    navigation,
    route,
}) {
    const userId = route?.params?.userId ?? 1;

    const [consultations, setConsultations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const ouvrirMenu = () => {
        if (navigation?.openDrawer) {
            navigation.openDrawer();
        }
    };

    const chargerHistorique = async () => {
        try {
            setLoading(true);

            if (DEMO_MODE) {
                setConsultations(CONSULTATIONS_DEMO);
                return;
            }

            const response = await api.get(
                `/consultations/user/${userId}`
            );

            const donnees = response.data?.data ?? response.data;

            setConsultations(
                Array.isArray(donnees) ? donnees : []
            );
        } catch (error) {
            console.log(
                `GET /consultations/user/${userId} :`,
                error
            );

            Alert.alert(
                'Erreur',
                "Impossible de charger l'historique."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chargerHistorique();
    }, [userId]);

    const consultationsFiltrees = useMemo(() => {
        const recherche = search.trim().toLowerCase();

        if (!recherche) {
            return consultations;
        }

        return consultations.filter((item) => {
            const texte =
                item.description ??
                item.texte ??
                '';

            return texte
                .toLowerCase()
                .includes(recherche);
        });
    }, [consultations, search]);

    const raccourcir = (texte = '') => {
        if (texte.length > 42) {
            return `${texte.slice(0, 42)}...`;
        }

        return texte;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screen}>
                <View style={styles.header}>
                    <Pressable onPress={ouvrirMenu} hitSlop={12}>
                        <MaterialCommunityIcons
                            name="menu"
                            size={22}
                            color="#F4F4F4"
                        />
                    </Pressable>

                    <Text style={styles.headerTitle}>
                        Historique
                    </Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.searchBar}>
                        <MaterialCommunityIcons
                            name="magnify"
                            size={18}
                            color="#A0A0A0"
                        />

                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Rechercher dans les conversations..."
                            placeholderTextColor="#777777"
                            style={styles.searchInput}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>
                        Récentes
                    </Text>

                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator color="#4361EE" />

                            <Text style={styles.loadingText}>
                                Chargement...
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={consultationsFiltrees}
                            keyExtractor={(item, index) =>
                                String(item.id ?? index)
                            }
                            renderItem={({ item }) => {
                                const description =
                                    item.description ??
                                    item.texte ??
                                    'Consultation juridique';

                                return (
                                    <Pressable
                                        style={styles.item}
                                        onPress={() => setSelected(item)}
                                    >
                                        <View style={styles.itemTextBox}>
                                            <Text style={styles.itemTitle}>
                                                {raccourcir(description)}
                                            </Text>

                                            <Text style={styles.itemDate}>
                                                {item.date ?? 'Date non précisée'}
                                            </Text>
                                        </View>

                                        <MaterialCommunityIcons
                                            name="chevron-right"
                                            size={18}
                                            color="#777777"
                                        />
                                    </Pressable>
                                );
                            }}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>
                                    Aucune consultation trouvée.
                                </Text>
                            }
                        />
                    )}
                </View>

                <Modal
                    visible={selected !== null}
                    animationType="slide"
                    onRequestClose={() => setSelected(null)}
                >
                    <SafeAreaView style={styles.modalSafeArea}>
                        <View style={styles.modalHeader}>
                            <Pressable
                                onPress={() => setSelected(null)}
                                hitSlop={12}
                            >
                                <MaterialCommunityIcons
                                    name="arrow-left"
                                    size={22}
                                    color="#F4F4F4"
                                />
                            </Pressable>

                            <Text style={styles.modalHeaderTitle}>
                                Discussion
                            </Text>
                        </View>

                        <View style={styles.modalContent}>
                            {selected && (
                                <>
                                    <View style={styles.questionCard}>
                                        <Text style={styles.questionLabel}>
                                            Votre situation
                                        </Text>

                                        <Text style={styles.questionText}>
                                            {selected.description ??
                                                selected.texte ??
                                                ''}
                                        </Text>
                                    </View>

                                    <ReponseJuridique
                                        articles={selected.articles}
                                        actions={selected.actions}
                                        confiance={selected.confiance}
                                    />
                                </>
                            )}
                        </View>
                    </SafeAreaView>
                </Modal>
            </View>
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

    content: {
        flex: 1,
        padding: 14,
    },

    searchBar: {
        height: 38,
        borderWidth: 1,
        borderColor: '#555555',
        borderRadius: 19,
        paddingHorizontal: 11,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: '#121212',
    },

    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 12,
    },

    sectionTitle: {
        marginTop: 16,
        marginBottom: 8,
        color: '#888888',
        fontSize: 12,
        fontStyle: 'italic',
    },

    item: {
        minHeight: 52,
        borderBottomWidth: 1,
        borderBottomColor: '#323232',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },

    itemTextBox: {
        flex: 1,
    },

    itemTitle: {
        color: '#F4F4F4',
        fontSize: 13,
        fontStyle: 'italic',
    },

    itemDate: {
        color: '#818181',
        fontSize: 11,
        marginTop: 3,
    },

    center: {
        alignItems: 'center',
        paddingTop: 28,
    },

    loadingText: {
        color: '#BDBDBD',
        marginTop: 8,
        fontSize: 12,
    },

    emptyText: {
        color: '#888888',
        textAlign: 'center',
        paddingTop: 28,
        fontSize: 13,
    },

    modalSafeArea: {
        flex: 1,
        backgroundColor: '#20211F',
    },

    modalHeader: {
        minHeight: 54,
        paddingHorizontal: 16,
        backgroundColor: '#050505',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    modalHeaderTitle: {
        color: '#F4F4F4',
        fontSize: 16,
        fontStyle: 'italic',
    },

    modalContent: {
        padding: 16,
    },

    questionCard: {
        borderRadius: 8,
        backgroundColor: '#2A2B29',
        padding: 13,
        marginBottom: 14,
    },

    questionLabel: {
        color: '#999999',
        fontSize: 11,
        marginBottom: 5,
    },

    questionText: {
        color: '#F4F4F4',
        fontSize: 14,
        lineHeight: 20,
    },
});