import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  hero: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
};
