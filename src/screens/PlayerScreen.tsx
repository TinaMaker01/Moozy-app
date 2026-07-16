import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';

const PlayerScreen = () => {
  const activeTrack = useActiveTrack();

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  artist: { fontSize: 18, color: '#666', textAlign: 'center' },
  text: { fontSize: 18, color: '#999' },
});

export default PlayerScreen;
