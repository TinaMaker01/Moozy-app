import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerController = () => {
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();

  if (!activeTrack) {
    return null;
  }

  const isPlaying = (playbackState.state || playbackState) === State.Playing;

  const togglePlayback = async () => {
    try {
      const currentState = playbackState.state || playbackState;
      if (currentState === State.Playing) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Now Playing: {activeTrack.title || 'Unknown Track'} - {activeTrack.artist || 'Unknown Artist'}
      </Text>
      <View style={styles.controls}>
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePlayback} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#eee', borderTopWidth: 1, borderColor: '#ccc' },
  controls: { flexDirection: 'row', justifyContent: 'space-around' },
  text: { textAlign: 'center', marginBottom: 5, fontWeight: 'bold' },
});

export default PlayerController;
