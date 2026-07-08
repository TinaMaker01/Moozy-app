import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';

const PlayerController = () => {
  const activeTrack = useActiveTrack();
  const { state } = usePlaybackState();

  if (!activeTrack) {
    return null;
  }

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
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{activeTrack.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{activeTrack.artist}</Text>
      </View>
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
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: { flex: 1, marginRight: 10 },
  title: { fontWeight: 'bold' },
  artist: { color: '#666', fontSize: 12 },
  controls: { minWidth: 60 },
});

export default PlayerController;
