import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerController = () => {
  const activeTrack = useActiveTrack();
  const { state } = usePlaybackState();

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
      <Text style={styles.title}>
        Now Playing: {activeTrack?.title || 'None'}
      </Text>
      <View style={styles.controls}>
        <Button
          title={isPlaying ? 'Pause' : 'Play'}
          onPress={togglePlayback}
        />
        <Button
          title="Next"
          onPress={() => TrackPlayer.skipToNext()}
        />
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
  title: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default PlayerController;
