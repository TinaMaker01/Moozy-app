module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/__tests__/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-track-player|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-navigation)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
};
