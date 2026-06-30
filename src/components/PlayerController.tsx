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
      <Text style={styles.title}>Now Playing: {activeTrack.title}</Text>
      <Text style={styles.artist}>{activeTrack.artist}</Text>
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
  title: { fontWeight: 'bold' },
  artist: { fontSize: 12, color: '#666' },
  controls: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 },
});

export default PlayerController;
