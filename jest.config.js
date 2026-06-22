module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/__tests__/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-gesture-handler|react-native-track-player|@react-navigation)/)',
  ],
  testPathIgnorePatterns: ['/__tests__/jest.setup.js'],
};
