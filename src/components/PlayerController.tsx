import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, {
  useActiveTrack,
  usePlaybackState,
  State,
} from 'react-native-track-player';

const PlayerController = () => {
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const isPlaying = playbackState.state === State.Playing;

  if (!activeTrack) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.trackTitle}>
        Now Playing: {activeTrack.title || 'Unknown Track'}
      </Text>
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
  container: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default PlayerController;
