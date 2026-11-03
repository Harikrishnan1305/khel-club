// ─── Colors ──────────────────────────────────────────────────────────────────
// Figma-exact values. Do not hardcode hex anywhere outside this file.
export const colors = {
  // Primary (CHANGED from #6C3CE1 → Figma #6336C5)
  violet: '#6336C5',
  violetLight: '#8F6AEC',   // hover / pressed state — kept
  violetDark: '#3C217D',    // deepViolet alias (CHANGED from #4B29B0)

  // Figma alias names
  deepViolet: '#3C217D',

  // Backgrounds (CHANGED ivory #FAFAF7 → #FAF8F2; lavender #EDE8FC → #EEE8FA)
  ivory: '#FAF8F2',
  paper: '#FFFFFF',          // Figma "paper" = white
  surface: '#FFFFFF',        // kept for backwards compat
  surfaceAlt: '#F3F1FB',     // subtle tinted surface — kept
  lavender: '#EEE8FA',

  // Accents
  saffron: '#F3AD43',        // CHANGED from #F5A623
  saffronSoft: '#FDEFD6',    // NEW — replaces hardcoded #FEF6E7

  // Text (CHANGED textPrimary #1A1A2E → ink #272139; textMuted → #7A7587)
  ink: '#272139',
  textPrimary: '#272139',    // kept for backwards compat
  textSecondary: '#4A4A6A',  // kept
  textMuted: '#7A7587',      // CHANGED from #9898B0

  // Semantic (CHANGED success #2ECC71 → #26805D; error #E74C3C → #C34F54)
  success: '#26805D',
  successSoft: '#E3F2EA',    // NEW
  warning: '#F39C12',        // kept
  error: '#C34F54',
  errorSoft: '#F9E8E9',      // NEW — replaces hardcoded #FDE8E8

  // Misc (CHANGED border #E0DFF0 → #E8E4EE)
  border: '#E8E4EE',
  overlay: 'rgba(0,0,0,0.4)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorToken = keyof typeof colors;

// ─── Game board colours ───────────────────────────────────────────────────────
export const gameColors = {
  ludo: {
    red:    '#DB5F63',
    green:  '#4E9E73',
    blue:   '#4685CE',
    yellow: '#E8B535',
  },
  chess: {
    light:     '#F3E8D3',
    dark:      '#B59B7B',
    highlight: '#DAD39A',
  },
  carrom: {
    boardWood: '#F5DFB5',
    frame:     '#8F5A32',
    pocket:    '#2A1F1A',
    black:     '#2B2B35',
    white:     '#F8EBD8',
    queen:     '#C34F54',
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────
// Figma values: xs 4, sm 8, md 12, lg 20, xl 28, xxl 40, pageMargin 22
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,      // CHANGED from 16
  lg: 20,      // CHANGED from 24
  xl: 28,      // CHANGED from 32
  xxl: 40,     // CHANGED from 48
  pageMargin: 22,  // NEW
} as const;

// ─── Border radius ───────────────────────────────────────────────────────────
// Figma: button 17, small 12, card 20, hero 28, pill 999
export const radius = {
  sm: 12,      // "small" — CHANGED from 8
  md: 12,      // kept alias
  button: 17,  // NEW explicit
  lg: 20,      // "card"
  card: 20,    // NEW explicit alias
  hero: 28,    // NEW
  full: 999,   // "pill" — CHANGED from 9999 (functionally same)
  pill: 999,   // NEW explicit alias
} as const;

// ─── Sizes ───────────────────────────────────────────────────────────────────
export const sizes = {
  buttonHeight: 54,
  minTouch: 44,
  tabBarHeight: 64,
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
