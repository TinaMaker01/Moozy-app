import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerController = () => {
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();

  if (!activeTrack) {
    return null;
  }

  const isPlaying = playbackState.state === State.Playing;

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
  container: { padding: 10, backgroundColor: '#eee', borderTopWidth: 1, borderColor: '#ccc' },
  trackTitle: { fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'space-around' },
});

export default PlayerController;
