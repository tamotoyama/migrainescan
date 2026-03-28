import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ConfidenceLevel } from '../../types';
import { theme, getConfidenceColor } from '../../styles/theme';

interface Props {
  confidence: ConfidenceLevel;
}

const CONFIDENCE_BG: Record<ConfidenceLevel, string> = {
  high:   '#EAF5EE',
  medium: '#EEF2F8',
  low:    '#F5EFE6',
};

export function ConfidencePill({ confidence }: Props) {
  const textColor = getConfidenceColor(confidence);
  const bg = CONFIDENCE_BG[confidence];

  const label =
    confidence === 'high' ? 'High Confidence' :
    confidence === 'medium' ? 'Medium Confidence' :
    'Low Confidence';

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
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
