// CME Agent - Premium Sand & Navy Theme
// Design System Colors and Constants

export const colors = {
  // Navy palette - for backgrounds, cards, depth
  navy: {
    900: '#0D1321',  // Deepest background
    800: '#151E2F',  // Card backgrounds
    700: '#1D2A3F',  // Elevated surfaces
    600: '#2A3A52',  // Borders, dividers
    500: '#3D4F6A',  // Secondary text
    400: '#5A6F8A',  // Muted text
  },

  // Sand palette - for accents, highlights
  sand: {
    50: '#FDFCFB',   // Lightest
    100: '#FAF8F5',  // Light background
    200: '#F5F0E8',  // Subtle highlight
    300: '#E8E0D5',  // Border light
    400: '#D4C4B0',  // Muted accent
    500: '#A68B5B',  // Primary accent
    600: '#8B7349',  // Darker accent
    700: '#705C3A',  // Deep accent
  },

  // Semantic colors (dark mode - navy backgrounds)
  background: '#0D1321',
  backgroundElevated: '#151E2F',
  backgroundCard: '#1D2A3F',
  text: '#FAF8F5',
  textSecondary: '#D4C4B0',
  textMuted: '#5A6F8A',
  accent: '#A68B5B',
  accentLight: '#D4C4B0',

  // Status colors - slightly muted for elegance
  success: '#5D8A66',
  successLight: 'rgba(93, 138, 102, 0.15)',
  warning: '#C4883A',
  warningLight: 'rgba(196, 136, 58, 0.15)',
  risk: '#B85C5C',
  riskLight: 'rgba(184, 92, 92, 0.15)',

  // UI colors
  card: '#1D2A3F',
  cardHover: '#2A3A52',
  border: '#2A3A52',
  borderLight: 'rgba(166, 139, 91, 0.2)',
  divider: '#1D2A3F',

  // Special
  glow: 'rgba(166, 139, 91, 0.3)',
  overlay: 'rgba(13, 19, 33, 0.8)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
} as const;

// CME Categories
export const cmeCategories = {
  general: { label: 'General', color: colors.accent },
  controlled_substances: { label: 'Ctrl Subst', color: colors.warning },
  risk_management: { label: 'Risk Mgmt', color: colors.risk },
  ethics: { label: 'Ethics', color: colors.success },
  pain_management: { label: 'Pain Mgmt', color: '#8B5A8B' },
} as const;

// Degree types
export const degreeTypes = {
  MD: 'Doctor of Medicine',
  DO: 'Doctor of Osteopathic Medicine',
  RN: 'Registered Nurse',
} as const;

export type DegreeType = keyof typeof degreeTypes;
export type CMECategory = keyof typeof cmeCategories;
