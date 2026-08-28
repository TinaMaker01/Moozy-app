// Manual Jest mock — the real module wraps a native turbo module that
// doesn't exist under the Jest environment (no native binary is loaded).
module.exports = {
  __esModule: true,
  default: {
    hide: jest.fn(() => Promise.resolve()),
    show: jest.fn(() => Promise.resolve()),
    isVisible: jest.fn(() => Promise.resolve(false)),
    getVisibilityStatus: jest.fn(() => Promise.resolve('hidden')),
  },
};
