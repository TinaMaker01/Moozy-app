module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/__tests__/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-gesture-handler|react-native-track-player)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
};
