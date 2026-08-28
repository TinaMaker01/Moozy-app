import 'react-native-gesture-handler';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SystemBars } from 'react-native-edge-to-edge';
import BootSplash from 'react-native-bootsplash';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { MiniPlayer } from './src/components/MiniPlayer';
import { setupPlayer } from './src/services/audioService';
import { useMusicStore } from './src/store/useMusicStore';
import { ThemeProvider, useTheme } from './src/theme';

/** Everything that needs the resolved Light/Dark/System palette lives below the ThemeProvider. */
function AppContent(): React.JSX.Element {
  const { colors, isDark } = useTheme();

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
      },
    };
  }, [colors, isDark]);

  return (
    <SafeAreaProvider>
      {/* Content now draws edge-to-edge; SystemBars only tints the icons/content
          of the status & nav bars (mandatory replacement for <StatusBar> since
          Android 15 deprecates its window-inset APIs). */}
      <SystemBars style={isDark ? 'light' : 'dark'} />
      <ErrorBoundary>
        <NavigationContainer theme={navTheme}>
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <AppNavigator />
            <MiniPlayer />
          </View>
        </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function App(): React.JSX.Element {
  useEffect(() => {
    async function init() {
      await setupPlayer();
      await useMusicStore.getState().initStore();
      // Keep the native splash on screen until the player & store are ready,
      // then fade it out instead of an abrupt cut / white flash.
      await BootSplash.hide({ fade: true });
    }
    init();
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
