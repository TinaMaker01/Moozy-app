import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerScreen = () => {
  const activeTrack = useActiveTrack();
  const { state } = usePlaybackState();

  const isPlaying = state === State.Playing;

  if (!activeTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTrackText}>No track selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.trackInfo}>
        <View style={styles.artworkPlaceholder} />
        <Text style={styles.title}>{activeTrack.title}</Text>
        <Text style={styles.artist}>{activeTrack.artist}</Text>
      </View>

      <View style={styles.controls}>
        <Button title="Previous" onPress={() => TrackPlayer.skipToPrevious()} />
        {isPlaying ? (
          <Button title="Pause" onPress={() => TrackPlayer.pause()} />
        ) : (
          <Button title="Play" onPress={() => TrackPlayer.play()} />
        )}
        <Button title="Next" onPress={() => TrackPlayer.skipToNext()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  noTrackText: { fontSize: 18, color: '#888' },
  trackInfo: { alignItems: 'center', marginBottom: 40 },
  artworkPlaceholder: { width: 250, height: 250, backgroundColor: '#ddd', borderRadius: 10, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  artist: { fontSize: 18, color: '#666', marginTop: 5 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20 },
});

export default PlayerScreen;
