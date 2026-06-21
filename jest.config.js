module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/__tests__/jest.setup.js'],
  testPathIgnorePatterns: ['/__tests__/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-track-player|react-native-gesture-handler|react-native-reanimated|@react-navigation)/)',
  ],
};
