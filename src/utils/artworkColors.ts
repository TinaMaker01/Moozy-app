export interface TrackPalette {
  primary: string;
  secondary: string;
  accent: string;
  glowPrimary: string;
  glowSecondary: string;
  backgroundTint: string;
}

const PALETTES = [
  {
    primary: '#8B5CF6',       // Electric Violet
    secondary: '#06B6D4',     // Electric Cyan
    accent: '#EC4899',        // Neon Pink
    glowPrimary: 'rgba(139, 92, 246, 0.45)',
    glowSecondary: 'rgba(6, 182, 212, 0.35)',
    backgroundTint: 'rgba(139, 92, 246, 0.12)',
  },
  {
    primary: '#EC4899',       // Neon Pink
    secondary: '#F59E0B',     // Amber
    accent: '#8B5CF6',
    glowPrimary: 'rgba(236, 72, 153, 0.45)',
    glowSecondary: 'rgba(245, 158, 11, 0.35)',
    backgroundTint: 'rgba(236, 72, 153, 0.12)',
  },
  {
    primary: '#06B6D4',       // Electric Cyan
    secondary: '#3B82F6',     // Deep Sky Blue
    accent: '#10B981',
    glowPrimary: 'rgba(6, 182, 212, 0.45)',
    glowSecondary: 'rgba(59, 130, 246, 0.35)',
    backgroundTint: 'rgba(6, 182, 212, 0.12)',
  },
  {
    primary: '#10B981',       // Emerald
    secondary: '#06B6D4',     // Cyan
    accent: '#F59E0B',
    glowPrimary: 'rgba(16, 185, 129, 0.45)',
    glowSecondary: 'rgba(6, 182, 212, 0.35)',
    backgroundTint: 'rgba(16, 185, 129, 0.12)',
  },
  {
    primary: '#F59E0B',       // Amber / Gold
    secondary: '#EF4444',     // Sunset Red
    accent: '#8B5CF6',
    glowPrimary: 'rgba(245, 158, 11, 0.45)',
    glowSecondary: 'rgba(239, 68, 68, 0.35)',
    backgroundTint: 'rgba(245, 158, 11, 0.12)',
  },
  {
    primary: '#6366F1',       // Indigo
    secondary: '#A855F7',     // Purple
    accent: '#06B6D4',
    glowPrimary: 'rgba(99, 102, 241, 0.45)',
    glowSecondary: 'rgba(168, 85, 247, 0.35)',
    backgroundTint: 'rgba(99, 102, 241, 0.12)',
  },
];

export function getTrackPalette(titleOrId: string): TrackPalette {
  if (!titleOrId) {
    return PALETTES[0];
  }

  let charSum = 0;
  for (let i = 0; i < titleOrId.length; i++) {
    charSum += titleOrId.charCodeAt(i) * (i + 1);
  }

  const index = charSum % PALETTES.length;
  return PALETTES[index];
}
