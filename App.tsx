import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
    }
    init();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />
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
