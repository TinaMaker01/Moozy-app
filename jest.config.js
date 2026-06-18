module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-track-player|react-native-gesture-handler|@react-navigation)/)',
  ],
  setupFiles: ['<rootDir>/__tests__/jest.setup.js'],
};
