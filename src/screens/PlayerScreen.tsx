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
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{activeTrack?.title || 'No Track Selected'}</Text>
        <Text style={styles.artist}>{activeTrack?.artist || 'Unknown Artist'}</Text>
      </View>
      <View style={styles.controls}>
        <Button title="Prev" onPress={() => TrackPlayer.skipToPrevious()} />
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePlayback} />
        <Button title="Next" onPress={() => TrackPlayer.skipToNext()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 18,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default PlayerScreen;
