export const darkColors = {
  // Backgrounds
  background: '#080A0F',
  backgroundElevated: '#0F131C',
  surface: '#141926',
  surfaceCard: '#181F30',
  surfaceGlass: 'rgba(20, 25, 38, 0.85)',
  surfaceHighlight: 'rgba(255, 255, 255, 0.05)',

  // Borders & Dividers
  border: '#1F293D',
  borderGlass: 'rgba(255, 255, 255, 0.08)',
  divider: '#182030',

  // Primary & Accent Palette (Dark Aura)
  primary: '#8B5CF6',       // Electric Violet
  primaryLight: '#A78BFA',
  primaryDark: '#6D28D9',
  primaryGlow: 'rgba(139, 92, 246, 0.35)',

  secondary: '#06B6D4',     // Electric Cyan
  secondaryGlow: 'rgba(6, 182, 212, 0.35)',

  accent: '#EC4899',        // Neon Pink / Coral
  accentGlow: 'rgba(236, 72, 153, 0.35)',

  success: '#10B981',       // Emerald
  warning: '#F59E0B',       // Amber
  error: '#EF4444',         // Crimson

  // Typography
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#080A0F',

  // UI States
  activeTrackBg: 'rgba(139, 92, 246, 0.15)',
  activeTrackBorder: 'rgba(139, 92, 246, 0.4)',
  playerBarBg: 'rgba(15, 19, 28, 0.92)',
  tabBarBg: '#0B0E17',
  progressBarBg: '#232C3F',
};

/**
 * Light counterpart to `darkColors`, keeping the same brand accents
 * (violet / cyan / pink) but on light backgrounds with darker, more
 * saturated accent tones so contrast stays comfortable in daylight.
 */
export const lightColors: ColorTokens = {
  background: '#F6F6FA',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceCard: '#F0F0F6',
  surfaceGlass: 'rgba(255, 255, 255, 0.85)',
  surfaceHighlight: 'rgba(15, 18, 34, 0.04)',

  border: '#E3E3EC',
  borderGlass: 'rgba(15, 18, 34, 0.08)',
  divider: '#E9E9F2',

  primary: '#7C3AED',
  primaryLight: '#8B5CF6',
  primaryDark: '#5B21B6',
  primaryGlow: 'rgba(124, 58, 237, 0.22)',

  secondary: '#0E7490',
  secondaryGlow: 'rgba(14, 116, 144, 0.22)',

  accent: '#DB2777',
  accentGlow: 'rgba(219, 39, 119, 0.22)',

  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',

  text: '#12141F',
  textSecondary: '#4B5065',
  textMuted: '#868CA0',
  textInverse: '#FFFFFF',

  activeTrackBg: 'rgba(124, 58, 237, 0.10)',
  activeTrackBorder: 'rgba(124, 58, 237, 0.30)',
  playerBarBg: 'rgba(255, 255, 255, 0.92)',
  tabBarBg: '#FFFFFF',
  progressBarBg: '#E3E3EC',
};

export type ColorTokens = typeof darkColors;

/**
 * @deprecated Static import kept for screens not yet migrated to
 * `useTheme()` — always resolves to the dark palette regardless of the
 * user's chosen appearance. New/updated screens should use `useTheme()`
 * from `../theme/ThemeContext` instead so they follow Light/Dark/System.
 */
export const colors = darkColors;

export const gradients = {
  primary: ['#8B5CF6', '#EC4899'],
  cyber: ['#06B6D4', '#8B5CF6'],
  sunset: ['#EC4899', '#F59E0B'],
  aurora: ['#10B981', '#06B6D4'],
  cardOverlay: ['transparent', 'rgba(8, 10, 15, 0.95)'],
};
