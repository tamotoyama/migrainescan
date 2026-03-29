import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/RootStackParamList';
import type { ScanHistoryDoc } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { theme, getVerdictColors, TABLET_MAX_WIDTH } from '../../styles/theme';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';
import { getScanHistory } from '../../firebase/firestore';
import { logError } from '../../firebase/crashlytics';

type Props = NativeStackScreenProps<MainTabParamList, 'HistoryTab'>;

function PremiumGate({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <View style={styles.gate}>
      <Text style={styles.gateTitle}>History is a premium feature</Text>
      <Text style={styles.gateBody}>
        Upgrade to keep your scan history and scan without limits.
      </Text>
      <TouchableOpacity style={styles.gateButton} onPress={onUpgrade} activeOpacity={0.8}>
        <Text style={styles.gateButtonLabel}>View Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

function HistoryRow({ item, onPress }: { item: ScanHistoryDoc; onPress: () => void }) {
  const colors = getVerdictColors(item.verdict);
  const time = new Date(item.scannedAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowName} numberOfLines={1}>
          {item.productName ?? 'Unknown Product'}
        </Text>
        {item.brandName && (
          <Text style={styles.rowBrand} numberOfLines={1}>{item.brandName}</Text>
        )}
        <Text style={styles.rowTime}>{time}</Text>
      </View>
      <View style={styles.rowRight}>
        <View style={[styles.verdictBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Text style={[styles.verdictLabel, { color: colors.text }]}>{item.verdict}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export function HistoryScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [history, setHistory] = useState<ScanHistoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user || !isPremium) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const docs = await getScanHistory(user.uid, 50);
      setHistory(docs);
    } catch (err) {
      setError('Could not load history. Please try again.');
      logError(err instanceof Error ? err : new Error(String(err)), { context: 'fetchHistory' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isPremium]);

  const handleUpgrade = () => {
    (navigation as any).navigate('PaywallModal', { source: 'history_gate' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>History</Text>
      </View>

      {!isPremium ? (
        <PremiumGate onUpgrade={handleUpgrade} />
      ) : loading ? (
        <LoadingSpinner fullScreen />
      ) : error ? (
        <ErrorCard message={error} onRetry={fetchHistory} />
      ) : history.length === 0 ? (
        <EmptyState
          title="No scans yet"
          subtitle="Your scan history will appear here after your first scan."
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {history.map((item) => (
            <HistoryRow
              key={item.scanId}
              item={item}
              onPress={() => (navigation as any).navigate('HistoryDetail', { scan: item })}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  screenTitle: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
    maxWidth: TABLET_MAX_WIDTH,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  gate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    maxWidth: TABLET_MAX_WIDTH,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  gateTitle: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  gateBody: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  gateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 100,
    height: 52,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  gateButtonLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  rowLeft: { flex: 1, gap: 2 },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  rowName: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  rowBrand: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  rowTime: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  verdictBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  verdictLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
});
