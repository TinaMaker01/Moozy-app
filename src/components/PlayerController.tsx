import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerController = () => {
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();

  if (!activeTrack) {
    return null;
  }

  const isPlaying = playbackState.state === State.Playing;

  const togglePlayback = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {activeTrack.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {activeTrack.artist}
        </Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
        <Text style={styles.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 12,
    color: '#666',
  },
  playButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PlayerController;
