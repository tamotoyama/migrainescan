import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ProfileMode } from '../../types';
import { theme } from '../../styles/theme';

interface Props {
  mode: ProfileMode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: (mode: ProfileMode) => void;
}

export function ProfileModeCard({ mode, title, description, selected, onSelect }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={() => onSelect(mode)}
      activeOpacity={0.7}
    >
      <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  cardSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  title: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  titleSelected: {
    color: theme.colors.primaryDark,
  },
  description: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
