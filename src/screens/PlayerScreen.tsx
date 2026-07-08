import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerScreen = () => {
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
      {activeTrack ? (
        <>
          <Text style={styles.title}>{activeTrack.title}</Text>
          <Text style={styles.artist}>{activeTrack.artist}</Text>
          <View style={styles.controls}>
            <Button title="Previous" onPress={() => TrackPlayer.skipToPrevious()} />
            <Button
              title={isPlaying ? 'Pause' : 'Play'}
              onPress={togglePlayback}
            />
            <Button title="Next" onPress={() => TrackPlayer.skipToNext()} />
          </View>
        </>
      ) : (
        <Text style={styles.text}>No Track Selected</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  artist: { fontSize: 18, color: '#666', marginBottom: 30 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  text: { fontSize: 20 },
});

export default PlayerScreen;
