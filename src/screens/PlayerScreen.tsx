import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerScreen = () => {
  const activeTrack = useActiveTrack();
  const { state } = usePlaybackState();

  const isPlaying = state === State.Playing;

  const togglePlayback = () => {
    if (isPlaying) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  };

  if (!activeTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No track selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{activeTrack.title}</Text>
      <Text style={styles.artist}>{activeTrack.artist}</Text>
      <View style={styles.controls}>
        <Button title="Prev" onPress={() => TrackPlayer.skipToPrevious()} />
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePlayback} />
        <Button title="Next" onPress={() => TrackPlayer.skipToNext()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 18, color: '#666' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  artist: { fontSize: 18, color: '#666', marginBottom: 30, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
});

export default PlayerScreen;
