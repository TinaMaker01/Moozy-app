import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerScreen = () => {
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const isPlaying = playbackState.state === State.Playing;

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
      {activeTrack.artwork && (
        <Image source={{ uri: activeTrack.artwork }} style={styles.artwork} />
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{activeTrack.title}</Text>
        <Text style={styles.artist}>{activeTrack.artist}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => TrackPlayer.skipToPrevious()}>
          <Text style={styles.controlText}>Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlButton, styles.playButton]} onPress={togglePlayback}>
          <Text style={styles.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={() => TrackPlayer.skipToNext()}>
          <Text style={styles.controlText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  artwork: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 30,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    padding: 15,
  },
  controlText: {
    fontSize: 18,
    color: '#007AFF',
  },
  playButton: {
    backgroundColor: '#007AFF',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  text: {
    fontSize: 20,
    color: '#666',
  },
});

export default PlayerScreen;
