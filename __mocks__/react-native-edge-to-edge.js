// Manual Jest mock — SystemBars wraps a native module with no effect worth
// simulating under test; render it as an inert component.
module.exports = {
  __esModule: true,
  SystemBars: () => null,
};
