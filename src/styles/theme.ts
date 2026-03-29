import { StyleSheet, Platform } from 'react-native';
import type { ScanVerdict, SeverityLevel, ConfidenceLevel, SensitivityLevel } from '../types';

// ─── Colors ───────────────────────────────────────────────────────────────────

export const colors = {
  // Brand
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryDeep: '#1d4ed8',
  primaryLight: '#dbeafe',

  // Backgrounds
  background: '#FDFBF7',
  surface: '#F5EFE6',
  white: '#FFFFFF',

  // Text
  textPrimary: '#2D2A26',
  textSecondary: '#7A6F65',

  // Borders
  border: '#E8DDD3',

  // Verdict — SAFE
  verdictSafe: '#3E9B6E',
  verdictSafeBg: '#EAF5EE',
  verdictSafeBorder: 'rgba(62,155,110,0.3)',

  // Verdict — REVIEW
  verdictReview: '#C47A1A',
  verdictReviewBg: '#FFF4DF',
  verdictReviewBorder: 'rgba(196,122,26,0.3)',

  // Verdict — AVOID
  verdictAvoid: '#D4584A',
  verdictAvoidBg: '#FDEEEC',
  verdictAvoidBorder: 'rgba(212,88,74,0.3)',

  // Severity
  severitySignificant: '#D4584A',
  severityModerate: '#C47A1A',
  severityMild: '#3b82f6',

  // Confidence
  confidenceHigh: '#3E9B6E',
  confidenceMedium: '#7A8BA6',
  confidenceLow: '#7A6F65',

  // Functional
  error: '#D4584A',
  nudgeBg: '#FFF4DF',
  nudgeBorder: '#F5D899',

  // Splash gradient stops
  splashGradient0: '#60a5fa',
  splashGradient1: '#1d4ed8',
  splashGradient2: '#1d4ed8',

  // Transparent
  overlay: 'rgba(45,42,38,0.48)',
  scannerOverlay: 'rgba(0,0,0,0.55)',
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

// ─── Border radii ─────────────────────────────────────────────────────────────

export const radius = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 100,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontFamily = {
  // Shorthand aliases used throughout the app
  sans: 'Nunito_400Regular',
  serif: 'Lora_400Regular',
  // Full weight variants
  display: 'Nunito_900Black',
  heading: 'Lora_700Bold',
  uiHeading: 'Nunito_800ExtraBold',
  body: 'Nunito_400Regular',
  bodyMedium: 'Nunito_500Medium',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  label: 'Nunito_700Bold',
  wordmark: 'Nunito_900Black',
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────
// Max content width for tablet layouts. No-op on iPhone (< 620px wide).
// On iPad the content centers within the wider screen.
export const TABLET_MAX_WIDTH = 500;

// ─── Gradients ────────────────────────────────────────────────────────────────

export const gradients = {
  splash: ['#60a5fa', '#1d4ed8'] as const,
  primaryLight: ['#dbeafe', '#FDFBF7'] as const,
} as const;

export const fontSize = {
  micro: 10,
  label: 11,
  caption: 13,
  secondary: 14,
  body: 16,
  uiHeading: 20,
  screenHeading: 22,
  display: 28,
  hero: 30,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#2D2A26',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),
  button: Platform.select({
    ios: {
      shadowColor: '#3b82f6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32,
      shadowRadius: 16,
    },
    android: { elevation: 6 },
    default: {},
  }),
  splashIcon: Platform.select({
    ios: {
      shadowColor: '#3b82f6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
    default: {},
  }),
  scanButton: Platform.select({
    ios: {
      shadowColor: '#3b82f6',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.38,
      shadowRadius: 20,
    },
    android: { elevation: 10 },
    default: {},
  }),
} as const;

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getVerdictColors(verdict: ScanVerdict) {
  switch (verdict) {
    case 'SAFE':
      return {
        text: colors.verdictSafe,
        bg: colors.verdictSafeBg,
        border: colors.verdictSafeBorder,
      };
    case 'REVIEW':
      return {
        text: colors.verdictReview,
        bg: colors.verdictReviewBg,
        border: colors.verdictReviewBorder,
      };
    case 'AVOID':
      return {
        text: colors.verdictAvoid,
        bg: colors.verdictAvoidBg,
        border: colors.verdictAvoidBorder,
      };
  }
}

export function getSeverityColor(severity: SeverityLevel): string {
  switch (severity) {
    case 'significant': return colors.severitySignificant;
    case 'moderate':    return colors.severityModerate;
    case 'mild':        return colors.severityMild;
  }
}

export function getSeverityBg(severity: SeverityLevel): string {
  switch (severity) {
    case 'significant': return colors.verdictAvoidBg;
    case 'moderate':    return colors.verdictReviewBg;
    case 'mild':        return colors.primaryLight;
  }
}

export function getConfidenceColor(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case 'high':   return colors.confidenceHigh;
    case 'medium': return colors.confidenceMedium;
    case 'low':    return colors.confidenceLow;
  }
}

export function getSensitivityLabel(sensitivity: SensitivityLevel): string {
  switch (sensitivity) {
    case 'none':     return 'None';
    case 'mild':     return 'Mild';
    case 'moderate': return 'Moderate';
    case 'high':     return 'High';
    case 'unknown':  return 'Not sure';
  }
}

export function getSeverityLabel(severity: SeverityLevel): string {
  switch (severity) {
    case 'mild':        return 'Mild';
    case 'moderate':    return 'Moderate';
    case 'significant': return 'Significant';
  }
}

export function getConfidenceLabel(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case 'low':    return 'Low';
    case 'medium': return 'Medium';
    case 'high':   return 'High';
  }
}

// ─── Theme bundle ─────────────────────────────────────────────────────────────
// Convenience object so screens can import `{ theme }` and access all tokens.

export const theme = {
  colors,
  spacing,
  radius,
  fontFamily,
  fontSize,
  shadows,
  gradients,
} as const;

// ─── Common reusable styles ───────────────────────────────────────────────────

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sectionLabel: {
    fontFamily: fontFamily.label,
    fontSize: fontSize.label,
    color: colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});
