import React from 'react';
import { act, create } from 'react-test-renderer';
import { useDebouncedValue } from '../../src/hooks/useDebouncedValue';

function TestHarness({
  value,
  delay,
  onRender,
}: {
  value: string;
  delay: number;
  onRender: (v: string) => void;
}) {
  const debounced = useDebouncedValue(value, delay);
  onRender(debounced);
  return null;
}

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const renders: string[] = [];
    act(() => {
      create(<TestHarness value="a" delay={200} onRender={(v) => renders.push(v)} />);
    });

    expect(renders[renders.length - 1]).toBe('a');
  });

  it('does not update until the delay elapses', () => {
    const renders: string[] = [];
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(<TestHarness value="a" delay={200} onRender={(v) => renders.push(v)} />);
    });

    act(() => {
      renderer.update(<TestHarness value="b" delay={200} onRender={(v) => renders.push(v)} />);
    });
    // The prop changed, but the debounced value hasn't caught up yet.
    expect(renders[renders.length - 1]).toBe('a');

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(renders[renders.length - 1]).toBe('b');
  });

  it('resets the timer on rapid successive changes, keeping only the final value', () => {
    const renders: string[] = [];
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(<TestHarness value="a" delay={200} onRender={(v) => renders.push(v)} />);
    });

    act(() => {
      renderer.update(<TestHarness value="ab" delay={200} onRender={(v) => renders.push(v)} />);
    });
    act(() => {
      jest.advanceTimersByTime(100); // not enough to commit "ab" yet
    });
    act(() => {
      renderer.update(<TestHarness value="abc" delay={200} onRender={(v) => renders.push(v)} />);
    });
    act(() => {
      jest.advanceTimersByTime(100); // still not enough since the timer restarted
    });
    expect(renders[renders.length - 1]).toBe('a');

    act(() => {
      jest.advanceTimersByTime(100); // completes the 200ms window from the last change
    });
    expect(renders[renders.length - 1]).toBe('abc');
  });
});
