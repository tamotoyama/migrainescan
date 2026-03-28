import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../styles/theme';

interface Props {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorCard({ message, onRetry, retryLabel = 'Try Again' }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
          <Text style={styles.retryLabel}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.verdictAvoidBg,
    borderColor: theme.colors.verdictAvoidBorder,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  message: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.verdictAvoid,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.verdictAvoid,
  },
  retryLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.verdictAvoid,
  },
});
