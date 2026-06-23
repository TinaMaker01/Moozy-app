import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerController = () => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.trackName}>
        Now Playing: {activeTrack?.title || 'None'}
      </Text>
      <View style={styles.controls}>
        <Button
          title={isPlaying ? 'Pause' : 'Play'}
          onPress={togglePlayback}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trackName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default PlayerController;
