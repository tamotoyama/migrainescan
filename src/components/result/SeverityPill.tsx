import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SeverityLevel } from '../../types';
import { theme, getSeverityColor, getSeverityBg, getSeverityLabel } from '../../styles/theme';

interface Props {
  severity: SeverityLevel;
}

export function SeverityPill({ severity }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: getSeverityBg(severity) }]}>
      <Text style={[styles.label, { color: getSeverityColor(severity) }]}>
        {getSeverityLabel(severity)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 11,
    fontWeight: '700',
  },
});
