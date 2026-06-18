module.exports = {
  preset: 'react-native',
  testPathIgnorePatterns: ['/__tests__/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-gesture-handler|react-native-track-player|@react-navigation)/)',
  ],
  setupFiles: [
    './node_modules/react-native-gesture-handler/jestSetup.js',
    './__tests__/jest.setup.js',
  ],
};
