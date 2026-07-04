import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerScreen = () => {
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();

  const isPlaying = playbackState.state === State.Playing;

  if (!activeTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No track selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{activeTrack.title}</Text>
      <Text style={styles.artist}>{activeTrack.artist}</Text>
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  artist: { fontSize: 18, color: '#666', marginTop: 10, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 40 },
});

export default PlayerScreen;
