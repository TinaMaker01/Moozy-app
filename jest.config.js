module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/__tests__/jest.setup.tsx'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-track-player|react-native-gesture-handler)/)',
  ],
};
