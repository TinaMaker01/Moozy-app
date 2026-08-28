import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ColorTokens, darkColors, lightColors } from './colors';
import { useSettingsStore } from '../store/useSettingsStore';

interface ThemeContextValue {
  colors: ColorTokens;
  isDark: boolean;
}

const defaultValue: ThemeContextValue = { colors: darkColors, isDark: true };

const ThemeContext = createContext<ThemeContextValue>(defaultValue);

/**
 * Resolves the user's Light/Dark/System preference (from useSettingsStore,
 * persisted across restarts) into an actual color palette, reacting to OS
 * appearance changes when the preference is 'system'. Wrap the app once at
 * the root; any component can then call `useTheme()` to read the current
 * palette reactively instead of importing the static (always-dark) `colors`.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const initSettings = useSettingsStore((s) => s.initSettings);
  const systemScheme = useColorScheme();

  useEffect(() => {
    initSettings();
  }, [initSettings]);

  const isDark = themeMode === 'system' ? systemScheme !== 'light' : themeMode === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({ colors: isDark ? darkColors : lightColors, isDark }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
