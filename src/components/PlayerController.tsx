import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import TrackPlayer from 'react-native-track-player';

const PlayerController = () => {
  return (
    <View style={styles.container}>
      <Text>Now Playing: Track Name</Text>
      <View style={styles.controls}>
        <Button title="Play" onPress={() => TrackPlayer.play()} />
        <Button title="Pause" onPress={() => TrackPlayer.pause()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#eee', borderTopWidth: 1, borderColor: '#ccc' },
  controls: { flexDirection: 'row', justifyContent: 'space-around' },
});

export default PlayerController;
