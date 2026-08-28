module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  // The RN preset only leaves react-native's own packages untransformed by
  // default; several of our dependencies ship ES modules straight to
  // node_modules (react-navigation, the various react-native-* native
  // module wrappers), which Jest can't `require()` without being told to
  // run them through Babel too.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native.*|@react-navigation.*|react-native-.*|lucide-react-native)/)',
  ],
  moduleNameMapper: {
    // Use the package's own official Jest mock instead of the native module.
    '^@react-native-async-storage/async-storage$':
      '@react-native-async-storage/async-storage/jest/async-storage-mock',
  },
};
