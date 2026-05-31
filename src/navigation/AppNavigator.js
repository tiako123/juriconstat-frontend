import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProfilScreen from '../screens/main/ProfilScreen';
import CollaborateursScreen from '../screens/main/CollaborateursScreen';
import CommunauteScreen from '../screens/main/CommunauteScreen';
import CollaborateurDetailScreen from '../screens/main/CollaborateurDetailScreen';
import SearchHistoryScreen from '../screens/main/SearchHistoryScreen';
import PostDetailScreen from '../screens/main/PostDetailScreen';
import ConstatNumerique from '../screens/main/ConstatNumerique';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarStyle: { 
        backgroundColor: colors.surface, 
        borderTopColor: colors.borderSoft,
        height: 66,
        paddingBottom: 10,
        paddingTop: 8,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        const icons = {
          'Assistant IA': 'chatbubble-ellipses-outline',
          'Community': 'people-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Assistant IA" component={HomeScreen} />
    <Tab.Screen name="Community" component={CommunauteScreen} />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="Profil" component={ProfilScreen} />
    <Stack.Screen name="Collaborateurs" component={CollaborateursScreen} />
    <Stack.Screen name="CollaborateurDetail" component={CollaborateurDetailScreen} />
    <Stack.Screen name="SearchHistory" component={SearchHistoryScreen} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    <Stack.Screen name="ConstatNumerique" component={ConstatNumerique} />
  </Stack.Navigator>
);

export default function AppNavigator() {
  const { token } = useAuth();
  return (
    <NavigationContainer>
      {token ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
