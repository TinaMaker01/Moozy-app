// Manual Jest mock — the real module reads the native filesystem, which
// doesn't exist under the Jest environment.
module.exports = {
  __esModule: true,
  default: {
    ExternalStorageDirectoryPath: '/storage/emulated/0',
    DocumentDirectoryPath: '/document',
    MainBundlePath: '/bundle',
    exists: jest.fn(() => Promise.resolve(false)),
    readDir: jest.fn(() => Promise.resolve([])),
    readFile: jest.fn(() => Promise.resolve('')),
  },
};
