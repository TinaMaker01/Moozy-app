module.exports = {
  preset: 'react-native',
  setupFiles: ['./__tests__/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-track-player|react-native-gesture-handler|@react-navigation)/)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/jest.setup.js',
  ],
};
