import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../styles/theme';

interface Props {
  compact?: boolean;
}

export function DisclaimerCard({ compact = false }: Props) {
  return (
    <View style={[styles.card, compact && styles.compact]}>
      <Text style={styles.text}>
        MigraineScan is an educational label-literacy tool. It is not a medical device,
        diagnostic tool, or treatment advisor. Always consult a qualified healthcare
        professional regarding medical decisions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  compact: {
    padding: theme.spacing.sm,
  },
  text: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'center',
  },
});
