// Manual Jest mock — the real package ships pure ESM (.mjs) files that
// Jest's default transform doesn't parse, and none of its ~1000 icon
// components matter for what we render under test. Any named import
// (e.g. `import { Compass } from 'lucide-react-native'`) resolves to the
// same inert stub component.
const IconStub = () => null;

module.exports = new Proxy(
  {},
  {
    get: () => IconStub,
  }
);
