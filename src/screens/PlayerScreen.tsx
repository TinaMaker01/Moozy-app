import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerScreen = () => {
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const isPlaying = playbackState.state === State.Playing;

  const togglePlayback = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
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
      <View style={styles.albumArt} />
      <Text style={styles.title}>{activeTrack.title}</Text>
      <Text style={styles.artist}>{activeTrack.artist}</Text>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => TrackPlayer.skipToPrevious()}>
          <Text>Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
          <Text style={styles.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => TrackPlayer.skipToNext()}>
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  albumArt: { width: 300, height: 300, backgroundColor: '#ccc', marginBottom: 20, borderRadius: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  artist: { fontSize: 18, color: '#666', marginBottom: 30 },
  text: { fontSize: 20 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '80%' },
  controlButton: { padding: 15 },
  playButton: { paddingHorizontal: 30, paddingVertical: 15, backgroundColor: '#007AFF', borderRadius: 30 },
  playButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default PlayerScreen;
