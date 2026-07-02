import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';

const PlayerScreen = () => {
  const activeTrack = useActiveTrack();

  return (
    <View style={styles.container}>
      {activeTrack ? (
        <>
          <Text style={styles.title}>{activeTrack.title}</Text>
          <Text style={styles.artist}>{activeTrack.artist}</Text>
        </>
      ) : (
        <Text style={styles.text}>No track playing</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  artist: { fontSize: 18, color: '#666' },
  text: { fontSize: 20 },
});

export default PlayerScreen;
