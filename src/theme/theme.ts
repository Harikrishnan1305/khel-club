// ─── Colors ──────────────────────────────────────────────────────────────────
export const colors = {
  // Primary
  violet: '#6C3CE1',       // primary brand violet
  violetLight: '#8F6AEC',  // hover / pressed state
  violetDark: '#4B29B0',   // active / deep accent

  // Backgrounds
  ivory: '#FAFAF7',        // main screen background
  surface: '#FFFFFF',      // cards, sheets
  surfaceAlt: '#F3F1FB',   // subtle tinted surface (violet-tinted)

  // Text
  textPrimary: '#1A1A2E',  // headings
  textSecondary: '#4A4A6A',// body
  textMuted: '#9898B0',    // captions, placeholders

  // Semantic
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',

  // Misc
  border: '#E0DFF0',
  overlay: 'rgba(0,0,0,0.4)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorToken = keyof typeof colors;

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Border radius ───────────────────────────────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────
export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 36,
} as const;

export const fontWeight = {
  regular: '400',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

