import React, {
    useEffect,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import api from '../../services/api';

const DEMO_MODE = true;

const UTILISATEURS_DEMO = [
    {
        id: 1,
        nom: 'Marc',
        email: 'marc@email.com',
        nbConsultations: 8,
    },

    {
        id: 2,
        nom: 'Marie',
        email: 'marie@email.com',
        nbConsultations: 5,
    },

    {
        id: 3,
        nom: 'Jeanne',
        email: 'jeanne@email.com',
        nbConsultations: 3,
    },
];

export default function AdminScreen({
    navigation,
    route,
}) {
    const role = route?.params?.role ?? 'ADMIN';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const ouvrirMenu = () => {
        if (navigation?.openDrawer) {
            navigation.openDrawer();
        }
    };

    const chargerUtilisateurs = async () => {
        try {
            setLoading(true);

            if (DEMO_MODE) {
                setUsers(UTILISATEURS_DEMO);
                return;
            }

            const response = await api.get('/admin/users');

            const donnees =
                response.data?.data ??
                response.data;

            setUsers(
                Array.isArray(donnees) ? donnees : []
            );
        } catch (error) {
            console.log('GET /admin/users :', error);

            Alert.alert(
                'Erreur',
                'Impossible de charger la liste des utilisateurs.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (role === 'ADMIN') {
            chargerUtilisateurs();
        } else {
            setLoading(false);
        }
    }, [role]);

    if (role !== 'ADMIN') {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.screen}>
                    <View style={styles.header}>
                        <Pressable
                            onPress={ouvrirMenu}
                            hitSlop={12}
                        >
                            <MaterialCommunityIcons
                                name="menu"
                                size={22}
                                color="#F4F4F4"
                            />
                        </Pressable>

                        <Text style={styles.headerTitle}>
                            Administration
                        </Text>
                    </View>

                    <View style={styles.deniedBox}>
                        <MaterialCommunityIcons
                            name="shield-lock-outline"
                            size={38}
                            color="#D86565"
                        />

                        <Text style={styles.deniedTitle}>
                            Accès refusé
                        </Text>

                        <Text style={styles.deniedText}>
                            Cette page est réservée aux administrateurs.
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screen}>
                <View style={styles.header}>
                    <Pressable
                        onPress={ouvrirMenu}
                        hitSlop={12}
                    >
                        <MaterialCommunityIcons
                            name="menu"
                            size={22}
                            color="#F4F4F4"
                        />
                    </Pressable>

                    <Text style={styles.headerTitle}>
                        Utilisateurs
                    </Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.pageTitle}>
                        Gestion des utilisateurs
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
                            data={users}
                            keyExtractor={(item, index) =>
                                String(item.id ?? index)
                            }
                            renderItem={({ item }) => (
                                <View style={styles.card}>
                                    <View style={styles.avatar}>
                                        <MaterialCommunityIcons
                                            name="account"
                                            size={22}
                                            color="#D5D5D5"
                                        />
                                    </View>

                                    <View style={styles.userInfo}>
                                        <Text style={styles.name}>
                                            {item.nom ??
                                                item.name ??
                                                'Utilisateur'}
                                        </Text>

                                        <Text style={styles.email}>
                                            {item.email ??
                                                'Email non précisé'}
                                        </Text>

                                        <Text style={styles.count}>
                                            {item.nbConsultations ?? 0}{' '}
                                            consultation(s)
                                        </Text>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>
                                    Aucun utilisateur trouvé.
                                </Text>
                            }
                        />
                    )}
                </View>
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

    pageTitle: {
        color: '#A5A5A5',
        fontSize: 13,
        fontStyle: 'italic',
        marginBottom: 11,
    },

    card: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        backgroundColor: '#292A28',
        borderWidth: 1,
        borderColor: '#343434',
        padding: 9,
        marginBottom: 9,
    },

    avatar: {
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#393A38',
        borderRadius: 26,
    },

    userInfo: {
        flex: 1,
    },

    name: {
        color: '#F4F4F4',
        fontSize: 15,
    },

    email: {
        color: '#B3B3B3',
        fontSize: 12,
        marginTop: 3,
    },

    count: {
        color: '#77A8FF',
        fontSize: 11,
        marginTop: 5,
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

    deniedBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 26,
    },

    deniedTitle: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 20,
        marginTop: 9,
    },

    deniedText: {
        color: '#BDBDBD',
        textAlign: 'center',
        marginTop: 7,
        lineHeight: 19,
    },
});