import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerController = () => {
  const activeTrack = useActiveTrack();
  const { state } = usePlaybackState();

  const isPlaying = state === State.Playing;

  if (!activeTrack) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.trackTitle}>Now Playing: {activeTrack.title}</Text>
      <View style={styles.controls}>
        {isPlaying ? (
          <Button title="Pause" onPress={() => TrackPlayer.pause()} />
        ) : (
          <Button title="Play" onPress={() => TrackPlayer.play()} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trackTitle: { fontSize: 14, fontWeight: '600', marginBottom: 5, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'center' },
});

export default PlayerController;
