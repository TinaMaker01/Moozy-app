module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/__tests__/jest.setup.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-track-player|react-native-gesture-handler|@react-navigation)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
};
