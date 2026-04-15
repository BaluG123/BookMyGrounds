import { Dimensions } from 'react-native';
import type { Theme } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const palette = {
  night: '#07111F',
  midnight: '#0D1B2A',
  slate: '#17324D',
  cobalt: '#1E64F0',
  cyan: '#4CB8FF',
  mint: '#3DD9B4',
  gold: '#FFC857',
  coral: '#FF6B57',
  snow: '#F6F8FC',
  cloud: '#E7EEF7',
  steel: '#7E93AB',
  smoke: '#526174',
  ink: '#102033',
  white: '#FFFFFF',
  success: '#20C997',
  warning: '#FFB020',
  danger: '#FF6B6B',
};

export const sportColors = {
  cricket: { bg: '#E8F5E9', text: '#2E7D32', icon: '🏏' },
  football: { bg: '#E3F2FD', text: '#1565C0', icon: '⚽' },
  badminton: { bg: '#FFF3E0', text: '#E65100', icon: '🏸' },
  tennis: { bg: '#F3E5F5', text: '#7B1FA2', icon: '🎾' },
  basketball: { bg: '#FBE9E7', text: '#BF360C', icon: '🏀' },
  hockey: { bg: '#E0F7FA', text: '#00695C', icon: '🏑' },
  multi_sport: { bg: '#EDE7F6', text: '#4527A0', icon: '🏟️' },
};

export const animTiming = {
  fast: 200,
  normal: 300,
  slow: 500,
  spring: { damping: 15, stiffness: 150 },
};

export const theme = {
  colors: {
    primary: palette.cobalt,
    primaryDark: palette.midnight,
    primaryLight: '#DDE9FF',
    cyan: palette.cyan,
    secondary: palette.mint,
    accent: palette.gold,
    background: palette.snow,
    backgroundLight: '#EEF3FA',
    backgroundAlt: '#EEF3FA',
    surface: palette.white,
    surfaceMuted: '#F0F4FA',
    surfaceDark: palette.night,
    textMain: palette.ink,
    textMuted: palette.smoke,
    textSoft: palette.steel,
    textSecondary: palette.smoke,
    border: '#D7E1EE',
    borderStrong: '#BDD0E4',
    error: palette.danger,
    success: palette.success,
    warning: palette.warning,
    white: palette.white,
    black: '#000000',
    coral: palette.coral,
    overlay: 'rgba(7, 17, 31, 0.6)',
    tabBar: 'rgba(255,255,255,0.94)',
    verified: '#00B894',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
    screenWidth: width,
    screenHeight: height,
  },
  typography: {
    hero: {
      fontSize: 36,
      lineHeight: 42,
      fontWeight: '800' as const,
      letterSpacing: -1,
    },
    h1: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '800' as const,
      letterSpacing: -0.8,
    },
    h2: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
    },
    bodyL: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    bodyM: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as const,
    },
    bodyS: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500' as const,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600' as const,
      letterSpacing: 0.3,
    },
  },
  borderRadius: {
    s: 10,
    m: 16,
    l: 22,
    xl: 30,
    pill: 999,
  },
  shadows: {
    soft: {
      shadowColor: '#16385B',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 5,
    },
    strong: {
      shadowColor: '#0B2340',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.14,
      shadowRadius: 28,
      elevation: 8,
    },
  },
};

export function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', emoji: '🌅' };
  if (hour < 17) return { text: 'Good Afternoon', emoji: '☀️' };
  return { text: 'Good Evening', emoji: '🌙' };
}

export const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.textMain,
    border: theme.colors.border,
    notification: theme.colors.accent,
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '800',
    },
  },
};
