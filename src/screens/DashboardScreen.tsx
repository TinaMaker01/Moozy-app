import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DashboardScreen = () => {
  const stats = [
    { label: 'Total Listening Time', value: '12h 45m' },
    { label: 'Favorite Artist', value: 'Artist A' },
    { label: 'Tracks Played Today', value: '24' },
    { label: 'New Discoveries', value: '5' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Usage Statistics</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});

export default DashboardScreen;
