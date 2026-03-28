import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { ScoredTrigger } from '../../types';
import { theme } from '../../styles/theme';
import { SeverityPill } from './SeverityPill';
import { ConfidencePill } from './ConfidencePill';

interface Props {
  triggers: ScoredTrigger[];
}

function TriggerItem({ trigger }: { trigger: ScoredTrigger }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => setExpanded((e) => !e)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemName}>{trigger.displayName}</Text>
          <Text style={styles.itemCategory}>
            {trigger.category.replace(/_/g, ' / ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Text>
        </View>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path
            d={expanded ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
            stroke={theme.colors.textSecondary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      <View style={styles.pills}>
        <SeverityPill severity={trigger.severity} />
        <ConfidencePill confidence={trigger.confidence} />
      </View>

      {expanded && (
        <View style={styles.explanation}>
          <Text style={styles.explanationText}>{trigger.explanation}</Text>
          {trigger.caveat && (
            <Text style={styles.caveatText}>{trigger.caveat}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export function TriggerBreakdownCard({ triggers }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01"
            stroke={theme.colors.verdictReview}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={styles.headerText}>
          Triggers found ({triggers.length})
        </Text>
      </View>

      {triggers.map((trigger, idx) => (
        <View key={trigger.id}>
          {idx > 0 && <View style={styles.divider} />}
          <TriggerItem trigger={trigger} />
        </View>
      ))}

      <Text style={styles.tapHint}>Tap any trigger to learn more.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  headerText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  item: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  itemCategory: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  pills: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  explanation: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  explanationText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
  caveatText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  tapHint: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingBottom: theme.spacing.sm,
    opacity: 0.7,
  },
});
