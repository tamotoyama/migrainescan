import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { SensitivityLevel } from '../../types';
import { theme, getSensitivityLabel } from '../../styles/theme';

const SENSITIVITY_OPTIONS: SensitivityLevel[] = ['none', 'mild', 'moderate', 'high', 'unknown'];

interface Props {
  selected: SensitivityLevel;
  onChange: (level: SensitivityLevel) => void;
}

export function SensitivityChips({ selected, onChange }: Props) {
  return (
    <View style={styles.row}>
      {SENSITIVITY_OPTIONS.map((level) => (
        <TouchableOpacity
          key={level}
          style={[styles.chip, selected === level && styles.chipSelected]}
          onPress={() => onChange(level)}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.label, selected === level && styles.labelSelected]}
          >
            {getSensitivityLabel(level)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: 'transparent',
  },
  label: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  labelSelected: {
    color: theme.colors.white,
  },
});
