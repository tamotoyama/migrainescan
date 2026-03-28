import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { ScanVerdict } from '../../types';
import { theme, getVerdictColors } from '../../styles/theme';

interface Props {
  verdict: ScanVerdict;
  message: string;
}

function VerdictIcon({ verdict }: { verdict: ScanVerdict }) {
  const colors = getVerdictColors(verdict);
  if (verdict === 'SAFE') {
    return (
      <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
        <Path
          d="M22 11.08V12a10 10 0 11-5.93-9.14"
          stroke={colors.text}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M22 4L12 14.01l-3-3"
          stroke={colors.text}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (verdict === 'REVIEW') {
    return (
      <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-7v2m0-6v4"
          stroke={colors.text}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  // AVOID
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01"
        stroke={colors.text}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function VerdictBadge({ verdict, message }: Props) {
  const colors = getVerdictColors(verdict);

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.header}>
        <VerdictIcon verdict={verdict} />
        <Text style={[styles.title, { color: colors.text }]}>{verdict}</Text>
      </View>
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  message: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    opacity: 0.9,
  },
});
