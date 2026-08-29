import React from 'react';
import { Text } from 'react-native';
import { act, create } from 'react-test-renderer';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Boom');
  }
  return <Text>OK</Text>;
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // React logs its own "above error occurred in" noise when an error
    // boundary catches something, on top of our own componentDidCatch
    // warning — both are expected here, not test failures.
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('renders children normally when nothing throws', () => {
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ErrorBoundary>
          <Bomb shouldThrow={false} />
        </ErrorBoundary>
      );
    });

    expect(JSON.stringify(renderer!.toJSON())).toContain('OK');
  });

  it('catches a render error and shows the fallback instead of crashing the app', () => {
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ErrorBoundary>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      );
    });

    const tree = JSON.stringify(renderer!.toJSON());
    expect(tree).toContain('Oups');
    expect(tree).toContain('Réessayer');
  });

  it('logs the caught error instead of swallowing it silently', () => {
    act(() => {
      create(
        <ErrorBoundary>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      );
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('caught a render error'),
      expect.any(Error),
      expect.anything()
    );
  });
});
