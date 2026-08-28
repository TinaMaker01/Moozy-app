import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Compass, Library, Settings } from 'lucide-react-native';
import { ColorTokens, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList, RootTabParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import EqualizerScreen from '../screens/EqualizerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PlayerScreen from '../screens/PlayerScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import ArtistDetailScreen from '../screens/ArtistDetailScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeTabIcon({ color, size }: { color: string; size: number }) {
  return <Compass size={size || 22} color={color} />;
}

function LibraryTabIcon({ color, size }: { color: string; size: number }) {
  return <Library size={size || 22} color={color} />;
}

function SettingsTabIcon({ color, size }: { color: string; size: number }) {
  return <Settings size={size || 22} color={color} />;
}

// Only the three primary destinations live in the tab bar. The equalizer is
// a secondary/settings-adjacent tool (reached from Settings or the Player's
// tools row below), not something worth a permanent slot next to Home and
// Library — see Phase 4 navigation notes.
const TabNavigator = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Explorer',
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Bibliothèque',
          tabBarIcon: LibraryTabIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Paramètres',
          tabBarIcon: SettingsTabIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="PlaylistDetail"
        component={PlaylistDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ArtistDetail"
        component={ArtistDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Equalizer"
        component={EqualizerScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    tabBar: {
      backgroundColor: colors.tabBarBg,
      borderTopWidth: 1,
      borderTopColor: colors.borderGlass,
      height: 60,
      paddingBottom: 8,
      paddingTop: 6,
    },
    tabBarLabel: {
      ...typography.badge,
      fontSize: 11,
      fontWeight: '600',
    },
  });
}

export default AppNavigator;
