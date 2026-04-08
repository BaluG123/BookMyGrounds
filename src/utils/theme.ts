export const theme = {
  colors: {
    primary: '#10B981', // Vibrant emerald green for sports
    primaryDark: '#047857',
    primaryLight: '#D1FAE5',
    secondary: '#3B82F6', // Trustworthy blue
    background: '#FFFFFF',
    backgroundLight: '#F3F4F6',
    textMain: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    white: '#FFFFFF',
    black: '#000000',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const },
    h2: { fontSize: 24, fontWeight: '700' as const },
    h3: { fontSize: 20, fontWeight: '600' as const },
    bodyL: { fontSize: 18, fontWeight: '400' as const },
    bodyM: { fontSize: 16, fontWeight: '400' as const },
    bodyS: { fontSize: 14, fontWeight: '400' as const },
    caption: { fontSize: 12, fontWeight: '400' as const },
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
    pill: 999,
  },
};
