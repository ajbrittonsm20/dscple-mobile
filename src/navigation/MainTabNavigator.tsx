import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { colors, fonts } from '../lib/theme';

import HomeScreen from '../screens/HomeScreen';
import DevotionalsScreen from '../screens/DevotionalsScreen';
import DevotionalDetailScreen from '../screens/DevotionalDetailScreen';
import SavedScreen from '../screens/SavedScreen';
import MissionScreen from '../screens/MissionScreen';
import MissionaryMapScreen from '../screens/MissionaryMapScreen';
import MissionaryDetailScreen from '../screens/MissionaryDetailScreen';
import PrayerRequestScreen from '../screens/PrayerRequestScreen';
import DonateScreen from '../screens/DonateScreen';
import PricingScreen from '../screens/PricingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Home Stack (includes Profile as a push screen)
const HomeStack = createNativeStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="DevotionalDetail" component={DevotionalDetailScreen} />
      <HomeStack.Screen name="Saved" component={SavedScreen} />
      <HomeStack.Screen name="Profile" component={ProfileScreen} />
    </HomeStack.Navigator>
  );
}

// Devotionals Stack
const DevotionalsStack = createNativeStackNavigator();
function DevotionalsStackScreen() {
  return (
    <DevotionalsStack.Navigator screenOptions={{ headerShown: false }}>
      <DevotionalsStack.Screen name="DevotionalsMain" component={DevotionalsScreen} />
      <DevotionalsStack.Screen name="DevotionalDetail" component={DevotionalDetailScreen} />
    </DevotionalsStack.Navigator>
  );
}

// Mission Stack
const MissionStack = createNativeStackNavigator();
function MissionStackScreen() {
  return (
    <MissionStack.Navigator screenOptions={{ headerShown: false }}>
      <MissionStack.Screen name="MissionMain" component={MissionScreen} />
      <MissionStack.Screen name="MissionaryMap" component={MissionaryMapScreen} />
      <MissionStack.Screen name="MissionaryDetail" component={MissionaryDetailScreen} />
    </MissionStack.Navigator>
  );
}

// Give Stack
const GiveStack = createNativeStackNavigator();
function GiveStackScreen() {
  return (
    <GiveStack.Navigator screenOptions={{ headerShown: false }}>
      <GiveStack.Screen name="DonateMain" component={DonateScreen} />
      <GiveStack.Screen name="Pricing" component={PricingScreen} />
    </GiveStack.Navigator>
  );
}

const tabIcons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Devotionals: { active: 'book', inactive: 'book-outline' },
  Mission: { active: 'globe', inactive: 'globe-outline' },
  Prayer: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  Give: { active: 'heart', inactive: 'heart-outline' },
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          const icons = tabIcons[route.name];
          const iconName = focused ? icons.active : icons.inactive;
          return (
            <View style={styles.tabIconContainer}>
              <Ionicons name={iconName} size={22} color={focused ? colors.foreground : colors.mutedForeground} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
        tabBarLabel: route.name,
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11, marginTop: -2 },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Devotionals" component={DevotionalsStackScreen} />
      <Tab.Screen name="Mission" component={MissionStackScreen} />
      <Tab.Screen name="Prayer" component={PrayerRequestScreen} />
      <Tab.Screen name="Give" component={GiveStackScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: { alignItems: 'center', paddingTop: 2 },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.foreground,
    marginTop: 3,
  },
});
