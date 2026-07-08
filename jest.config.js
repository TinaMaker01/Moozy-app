module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/__tests__/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-track-player|react-native-gesture-handler)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
};
