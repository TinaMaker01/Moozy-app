import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerController = () => {
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const isPlaying = playbackState.state === State.Playing;

  if (!activeTrack) {
    return null;
  }

  const togglePlayback = () => {
    if (isPlaying) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.trackInfo}>
        <Text style={styles.title}>{activeTrack.title}</Text>
        <Text style={styles.artist}>{activeTrack.artist}</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={togglePlayback}>
          <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trackInfo: { flex: 1 },
  title: { fontSize: 14, fontWeight: 'bold' },
  artist: { fontSize: 12, color: '#666' },
  controls: { marginLeft: 10 },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
});

export default PlayerController;
