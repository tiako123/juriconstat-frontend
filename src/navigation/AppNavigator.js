import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProfilScreen from '../screens/main/ProfilScreen';
import CollaborateursScreen from '../screens/main/CollaborateursScreen';
import CommunauteScreen from '../screens/main/CommunauteScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#333' },
      tabBarActiveTintColor: '#ffffff',
      tabBarInactiveTintColor: '#666666',
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        const icons = {
          'Assistant IA': 'home-outline',
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

export default function AppNavigator() {
  const { token } = useAuth();
  return (
    <NavigationContainer>
      {token ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}