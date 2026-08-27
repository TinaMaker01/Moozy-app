import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SystemBars } from 'react-native-edge-to-edge';
import BootSplash from 'react-native-bootsplash';
import AppNavigator from './src/navigation/AppNavigator';
import { MiniPlayer } from './src/components/MiniPlayer';
import { setupPlayer } from './src/services/audioService';
import { useMusicStore } from './src/store/useMusicStore';
import { colors } from './src/theme';

const MoozyDarkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

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
    <SafeAreaProvider>
      {/* Content now draws edge-to-edge; SystemBars only tints the icons/content
          of the status & nav bars (mandatory replacement for <StatusBar> since
          Android 15 deprecates its window-inset APIs). */}
      <SystemBars style="light" />
      <NavigationContainer theme={MoozyDarkNavTheme}>
        <View style={styles.container}>
          <AppNavigator />
          <MiniPlayer />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default App;
