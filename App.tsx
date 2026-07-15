import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';
import AppNavigator from './src/navigation/AppNavigator';
import PlayerController from './src/components/PlayerController';

async function setupPlayer() {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
  } catch (error) {
    console.error('Error setting up track player:', error);
  }
}

function App(): React.JSX.Element {
  useEffect(() => {
    setupPlayer();
  }, []);

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <AppNavigator />
        <PlayerController />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
