import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john.doe@example.com</Text>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Subscription</Text>
        <Text style={styles.infoText}>Premium Member</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', padding: 40, borderBottomWidth: 1, borderBottomColor: '#eee' },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold' },
  email: { fontSize: 16, color: '#666' },
  infoSection: { padding: 20 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  infoText: { fontSize: 16, color: '#333' },
});

export default ProfileScreen;
