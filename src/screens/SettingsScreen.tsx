import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Appearance</Text>
      <View style={styles.settingItem}>
        <Text>Dark Mode</Text>
        <Switch value={false} onValueChange={() => {}} />
      </View>
      <Text style={styles.header}>Other Settings</Text>
      <View style={styles.settingItem}>
        <Text>Enable Notifications</Text>
        <Switch value={true} onValueChange={() => {}} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
});

export default SettingsScreen;
