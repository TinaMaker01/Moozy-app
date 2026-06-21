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
      <Text style={styles.trackTitle}>
        Now Playing: {activeTrack.title || 'Unknown Track'}
      </Text>
      <Text style={styles.artistName}>{activeTrack.artist || 'Unknown Artist'}</Text>
      <View style={styles.controls}>
        <Button
          title={isPlaying ? 'Pause' : 'Play'}
          onPress={togglePlayback}
        />
        <Button title="Stop" onPress={() => TrackPlayer.stop()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  trackTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  artistName: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 10 },
  controls: { flexDirection: 'row', justifyContent: 'space-around' },
});

export default PlayerController;
