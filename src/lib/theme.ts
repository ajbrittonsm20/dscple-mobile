import { StyleSheet } from 'react-native';

export const colors = {
  background: '#EFEFEF',
  foreground: '#231E18',
  card: '#FFFDFB',
  cardForeground: '#231E18',
  primary: '#8B6037',
  primaryForeground: '#FAF5F0',
  secondary: '#EDE8E2',
  secondaryForeground: '#3D3229',
  muted: '#EDEBE8',
  mutedForeground: '#7A7269',
  accent: '#E8D8C4',
  accentForeground: '#3D3229',
  border: '#E3DDD7',
  destructive: '#EF4444',
  success: '#22C55E',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
};

export const fonts = {
  light: 'DMSans-Light',
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  semibold: 'DMSans-SemiBold',
  bold: 'DMSans-Bold',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const typography = StyleSheet.create({
  h1: { fontFamily: fonts.bold, fontSize: fontSize['3xl'], color: colors.foreground },
  h2: { fontFamily: fonts.semibold, fontSize: fontSize['2xl'], color: colors.foreground },
  h3: { fontFamily: fonts.semibold, fontSize: fontSize.xl, color: colors.foreground },
  body: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.foreground },
  bodySmall: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.foreground },
  caption: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.mutedForeground },
  button: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.primaryForeground },
});
