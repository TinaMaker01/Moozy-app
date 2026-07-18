import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerScreen = () => {
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();

  if (!activeTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No Track Selected</Text>
      </View>
    );
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
      {activeTrack.artwork ? (
        <Image source={{ uri: activeTrack.artwork }} style={styles.artwork} />
      ) : null}
      <Text style={styles.title}>{activeTrack.title || 'Unknown Title'}</Text>
      <Text style={styles.artist}>{activeTrack.artist || 'Unknown Artist'}</Text>
      <View style={styles.controls}>
        <Button title="Prev" onPress={() => TrackPlayer.skipToPrevious()} />
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePlayback} />
        <Button title="Next" onPress={() => TrackPlayer.skipToNext()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  artwork: { width: 200, height: 200, marginBottom: 20, borderRadius: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  artist: { fontSize: 18, color: '#666', marginBottom: 30, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  text: { fontSize: 20, color: '#666' },
});

export default PlayerScreen;
