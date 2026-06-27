import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerController = () => {
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
    return null;
  }

  return (
    <View style={styles.container}>
      <Text numberOfLines={1} style={styles.trackTitle}>
        Now Playing: {activeTrack.title || 'Unknown'}
      </Text>
      <View style={styles.controls}>
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePlayback} />
        <Button title="Next" onPress={() => TrackPlayer.skipToNext()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#eee',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  trackTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default PlayerController;
