import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  title: string;
  artist: string;
  onPress: () => void;
}

const MusicListItem = ({ title, artist, onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.artist}>{artist}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  title: { fontSize: 16, fontWeight: 'bold' },
  artist: { fontSize: 14, color: '#666' },
});

export default MusicListItem;
