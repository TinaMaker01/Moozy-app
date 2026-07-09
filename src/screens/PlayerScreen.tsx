import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerScreen = () => {
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();

  const isPlaying = playbackState.state === State.Playing;

  if (!activeTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTrack}>No track selected</Text>
      </View>
    );
  }

  const togglePlayback = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.artworkPlaceholder}>
        <Text style={styles.artworkText}>🎵</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{activeTrack.title}</Text>
        <Text style={styles.artist}>{activeTrack.artist}</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => TrackPlayer.skipToPrevious()}>
          <Text style={styles.buttonText}>Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.playButton]} onPress={togglePlayback}>
          <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => TrackPlayer.skipToNext()}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  noTrack: { fontSize: 18, color: '#666' },
  artworkPlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 40,
  },
  artworkText: { fontSize: 80 },
  info: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  artist: { fontSize: 18, color: '#666', marginTop: 10 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' },
  button: { padding: 15, backgroundColor: '#007AFF', borderRadius: 10, minWidth: 80, alignItems: 'center' },
  playButton: { backgroundColor: '#0056b3', minWidth: 100 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default PlayerScreen;
