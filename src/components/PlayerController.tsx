import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerController = () => {
  const activeTrack = useActiveTrack();
  const { state } = usePlaybackState();

  if (!activeTrack) {
    return null;
  }

  const isPlaying = state === State.Playing;

  const togglePlayback = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title}>{activeTrack.title}</Text>
        <Text style={styles.artist}>{activeTrack.artist}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={togglePlayback}>
        <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: { flex: 1 },
  title: { fontWeight: 'bold', fontSize: 14 },
  artist: { color: '#666', fontSize: 12 },
  button: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#007AFF', borderRadius: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default PlayerController;
