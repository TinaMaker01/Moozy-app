import { useEffect, useState } from 'react';

/**
 * Delays propagating a fast-changing value (typically search input) by
 * `delayMs`, so expensive recomputation (filtering across tracks, artists,
 * albums and playlists at once) runs once after the user pauses typing
 * instead of on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
