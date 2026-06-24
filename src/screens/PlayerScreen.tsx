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
      <View style={styles.artworkContainer}>
        <View style={styles.placeholderArtwork} />
      </View>
      <Text style={styles.title}>{activeTrack.title}</Text>
      <Text style={styles.artist}>{activeTrack.artist}</Text>

      <View style={styles.controls}>
        <Button title="Prev" onPress={() => TrackPlayer.skipToPrevious()} />
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  artworkContainer: { width: 300, height: 300, marginBottom: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5 },
  placeholderArtwork: { width: '100%', height: '100%', backgroundColor: '#ddd', borderRadius: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  artist: { fontSize: 18, color: '#666', marginBottom: 40, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', width: '80%' },
  noTrackText: { fontSize: 18, color: '#999' },
});

export default PlayerScreen;
