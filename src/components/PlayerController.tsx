import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerController = () => {
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();

  const isPlaying = playbackState.state === State.Playing;

  if (!activeTrack) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text numberOfLines={1} style={styles.trackTitle}>
        Now Playing: {activeTrack.title || 'Unknown Track'}
      </Text>
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
    backgroundColor: '#eee',
    borderTopWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackTitle: { flex: 1, marginRight: 10 },
  controls: { flexDirection: 'row' },
});

export default PlayerController;
