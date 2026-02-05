// CME Agent - Sand Theme
// Design System Colors and Constants

export const colors = {
  // Sand palette
  sand: {
    50: '#FDFCFB',
    100: '#FAF8F5',  // Background
    200: '#F5F0E8',
    300: '#E8E0D5',
    400: '#D4C4B0',
    500: '#A68B5B',  // Accent
    600: '#8B7349',
    700: '#705C3A',
    800: '#554530',
    900: '#3D3D3D',  // Text
  },

  // Semantic colors
  background: '#FAF8F5',
  text: '#3D3D3D',
  textSecondary: '#6B6B6B',
  accent: '#A68B5B',

  // Status colors
  success: '#5D8A66',
  successLight: '#7AA882',
  warning: '#C4883A',
  warningLight: '#D9A25C',
  risk: '#B85C5C',
  riskLight: '#CF7A7A',

  // UI colors
  card: '#FFFFFF',
  border: '#E8E0D5',
  divider: '#F5F0E8',
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
