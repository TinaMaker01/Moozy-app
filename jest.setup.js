// Registers the native module mocks react-native-gesture-handler needs to
// run under Jest (no real native binary is loaded in tests) — without this,
// any test that imports App.tsx (which imports 'react-native-gesture-handler'
// at the top for the navigator) crashes with a TurboModuleRegistry error.
import 'react-native-gesture-handler/jestSetup';
