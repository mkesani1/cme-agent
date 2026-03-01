// CME Agent - Meridian Teal (Light Mode)
// Design System Colors and Constants

export const colors = {
  // Meridian palette - light backgrounds, teal accents
  primary: {
    900: '#003D5C',  // Deepest teal
    800: '#005A9C',  // Dark teal
    700: '#0064A6',  // Medium-dark teal
    600: '#0077B6',  // Primary accent
    500: '#0096C7',  // Medium teal
    400: '#00B4D8',  // Light teal
  },
  neutral: {
    50: '#F0F7FA',   // App background
    100: '#E8EEF2',  // Subtle highlight
    200: '#D0DEE6',  // Border light
    300: '#B0C4CE',  // Muted
    400: '#7A93A8',  // Secondary text
    500: '#4A6074',  // Body text
    600: '#1A2B3C',  // Primary text
    700: '#0A1628',  // Headings
  },

  // Semantic colors (light mode)
  background: '#F0F7FA',
  backgroundElevated: '#FFFFFF',
  backgroundCard: '#FFFFFF',
  text: '#0A1628',
  textSecondary: '#4A6074',
  textMuted: '#7A93A8',
  accent: '#0077B6',
  accentLight: '#00B4D8',

  // Status colors - slightly muted for elegance
  success: '#5D8A66',
  successLight: 'rgba(93, 138, 102, 0.15)',
  warning: '#C4883A',
  warningLight: 'rgba(196, 136, 58, 0.15)',
  risk: '#B85C5C',
  riskLight: 'rgba(184, 92, 92, 0.15)',

  // UI colors
  card: '#FFFFFF',
  cardHover: '#F0F7FA',
  border: 'rgba(0, 119, 182, 0.15)',
  borderLight: 'rgba(0, 119, 182, 0.08)',
  divider: '#E8EEF2',

  // Special
  glow: 'rgba(0, 119, 182, 0.2)',
  overlay: 'rgba(10, 22, 40, 0.8)',

  // Backward compatibility aliases (legacy navy/sand references)
  navy: {
    900: '#0A1628',  // Now the dark text color
    800: '#FFFFFF',  // Now white (was card bg)
    700: '#FFFFFF',  // Now white (was elevated)
    600: 'rgba(0, 119, 182, 0.15)',  // Border tint
    500: '#4A6074',  // Body text
    400: '#7A93A8',  // Muted text
  },
  sand: {
    50: '#F0F7FA',   // Background (was light)
    100: '#F0F7FA',  // Background
    200: '#E8EEF2',  // Subtle highlight
    300: '#D0DEE6',  // Border light
    400: '#4A6074',  // Text secondary (was muted accent)
    500: '#0077B6',  // Primary accent (now teal)
    600: '#0064A6',  // Darker (now teal)
    700: '#005A9C',  // Deep (now teal)
  },
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
