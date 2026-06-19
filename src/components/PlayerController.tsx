import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer, { useTrackPlayerEvents, Event, State } from 'react-native-track-player';

const PlayerController = () => {
  const [trackTitle, setTrackTitle] = useState<string>('No Track Playing');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useTrackPlayerEvents([Event.PlaybackTrackChanged, Event.PlaybackState], async (event) => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      setTrackTitle(track?.title || 'Unknown Title');
    }
    if (event.type === Event.PlaybackState) {
      setIsPlaying(event.state === State.Playing);
    }
  });

  const togglePlayback = async () => {
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Now Playing: {trackTitle}</Text>
      <View style={styles.controls}>
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePlayback} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#eee', borderTopWidth: 1, borderColor: '#ccc' },
  title: { textAlign: 'center', marginBottom: 5, fontWeight: 'bold' },
  controls: { flexDirection: 'row', justifyContent: 'space-around' },
});

export default PlayerController;
