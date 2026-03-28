import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../../styles/theme';

interface Props {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

export function SettingsRow({
  label,
  value,
  onPress,
  showChevron = true,
  danger = false,
}: Props) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
      <View style={styles.right}>
        {value && <Text style={styles.value}>{value}</Text>}
        {showChevron && onPress && (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 18l6-6-6-6"
              stroke={danger ? theme.colors.verdictAvoid : theme.colors.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  labelDanger: {
    color: theme.colors.error,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  value: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
});
