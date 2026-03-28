import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStackParamList';
import { VerdictBadge } from '../../components/result/VerdictBadge';
import { TriggerBreakdownCard } from '../../components/result/TriggerBreakdownCard';
import { ProfileNudgeCard } from '../../components/result/ProfileNudgeCard';
import { ConfidencePill } from '../../components/result/ConfidencePill';
import { DisclaimerCard } from '../../components/common/DisclaimerCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { theme } from '../../styles/theme';
import { logResultViewed } from '../../firebase/analytics';
import { generateConfidenceSummaryLabel } from '../../logic/verdictGenerator';

type Props = NativeStackScreenProps<RootStackParamList, 'ResultModal'>;

export function ResultScreen({ navigation, route }: Props) {
  const { scanResult } = route.params;

  React.useEffect(() => {
    logResultViewed(scanResult.verdict);
  }, [scanResult.verdict]);

  const scannedTime = new Date(scanResult.scannedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLabel}>← Result</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Product card */}
        <View style={styles.productCard}>
          <Text style={styles.productName} numberOfLines={2}>
            {scanResult.productName ?? 'Unknown Product'}
          </Text>
          {scanResult.brandName && (
            <Text style={styles.brandName}>{scanResult.brandName}</Text>
          )}
          <Text style={styles.scannedAt}>Scanned {scannedTime}</Text>
        </View>

        {/* Verdict badge */}
        <VerdictBadge
          verdict={scanResult.verdict}
          message={scanResult.verdictMessage}
        />

        {/* Confidence */}
        <View style={styles.confidenceRow}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <ConfidencePill confidence={scanResult.scoreResult.confidenceSummary} />
        </View>
        <Text style={styles.confidenceSummaryText}>
          {generateConfidenceSummaryLabel(scanResult.scoreResult.confidenceSummary)}
        </Text>

        {/* Data completeness note */}
        {scanResult.dataCompletenessNote && (
          <View style={styles.dataNote}>
            <Text style={styles.dataNoteText}>{scanResult.dataCompletenessNote}</Text>
          </View>
        )}

        {/* Triggers breakdown */}
        {scanResult.scoreResult.scoredTriggers.length > 0 ? (
          <TriggerBreakdownCard triggers={scanResult.scoreResult.scoredTriggers} />
        ) : (
          <View style={styles.noTriggersCard}>
            <Text style={styles.noTriggersText}>
              No common migraine trigger ingredients were detected in our database.
            </Text>
          </View>
        )}

        {/* Profile nudge */}
        {scanResult.showProfileNudge && (
          <ProfileNudgeCard
            onSetUp={() => {
              navigation.goBack();
              (navigation as any).navigate('AccountTab');
            }}
          />
        )}

        {/* Disclaimer */}
        <DisclaimerCard />

        <PrimaryButton label="Done" onPress={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  topBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  backLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  productCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: 4,
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  productName: {
    fontFamily: theme.fontFamily.serif,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 26,
  },
  brandName: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  scannedAt: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  confidenceSummaryText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    lineHeight: 19,
    marginTop: -theme.spacing.sm,
  },
  dataNote: {
    backgroundColor: theme.colors.verdictReviewBg,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
  },
  dataNoteText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.verdictReview,
    lineHeight: 19,
  },
  noTriggersCard: {
    backgroundColor: theme.colors.verdictSafeBg,
    borderColor: theme.colors.verdictSafeBorder,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  noTriggersText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.verdictSafe,
    textAlign: 'center',
    lineHeight: 20,
  },
});
