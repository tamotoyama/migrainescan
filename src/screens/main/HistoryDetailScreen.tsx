import React, { useState } from 'react';
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
import { DisclaimerCard } from '../../components/common/DisclaimerCard';
import { ProfileSnapshotSheet } from '../../components/result/ProfileSnapshotSheet';
import { theme, TABLET_MAX_WIDTH } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'HistoryDetail'>;

export function HistoryDetailScreen({ navigation, route }: Props) {
  const { scan } = route.params;
  const [sheetVisible, setSheetVisible] = useState(false);

  const scanDate = new Date(scan.scannedAt);

  // Full date+time for product card: "Mon Jan 6, 2025 at 2:34 PM"
  const fullDateTime = scanDate.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + scanDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Short date for attribution chip: "Jan 6"
  const shortDate = scanDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  // Full date for sheet explanation: "Jan 6, 2025"
  const sheetDate = scanDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={18} color={theme.colors.primary} />
          <Text style={styles.backLabel}>History</Text>
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
            {scan.productName ?? 'Unknown Product'}
          </Text>
          {scan.brandName && (
            <Text style={styles.brandName}>{scan.brandName}</Text>
          )}
          <Text style={styles.scannedAt}>Scanned {fullDateTime}</Text>
        </View>

        {/* Verdict badge */}
        <VerdictBadge verdict={scan.verdict} message={scan.verdictMessage} />

        {/* Attribution chip */}
        <TouchableOpacity
          style={styles.attributionChip}
          onPress={() => setSheetVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.attributionText}>
            Scored with your profile from {shortDate}
          </Text>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary} />
        </TouchableOpacity>

        {/* Trigger breakdown */}
        {scan.scoredTriggers.length > 0 ? (
          <TriggerBreakdownCard triggers={scan.scoredTriggers} />
        ) : (
          <View style={styles.noTriggersCard}>
            <Text style={styles.noTriggersText}>
              No common migraine trigger ingredients were detected in our database.
            </Text>
          </View>
        )}

        {/* Disclaimer */}
        <DisclaimerCard />
      </ScrollView>

      <ProfileSnapshotSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        snapshot={scan.triggerProfileSnapshot}
        scanDate={sheetDate}
      />
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    maxWidth: TABLET_MAX_WIDTH,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
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
  attributionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
  },
  attributionText: {
    flex: 1,
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.textSecondary,
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
