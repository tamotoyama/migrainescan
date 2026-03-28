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
import type { RootStackParamList } from '../../navigation/RootStackParamList';
import { PaywallFeatureRow } from '../../components/paywall/PaywallFeatureRow';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { theme } from '../../styles/theme';
import { useSubscription } from '../../hooks/useSubscription';
import { getPremiumPackage } from '../../services/revenueCat';
import { logPaywallViewed, logPurchaseStarted, logPurchaseCompleted, logPurchaseRestoreStarted, logPurchaseRestoreCompleted } from '../../firebase/analytics';
import { logError } from '../../firebase/crashlytics';
import type { PurchasesPackage } from 'react-native-purchases';

type Props = NativeStackScreenProps<RootStackParamList, 'PaywallModal'>;

const FEATURES = [
  { title: 'Unlimited food scans', subtitle: 'Scan as much as you need, any time.' },
  { title: 'Full scan history', subtitle: 'Review your past results anytime.' },
  { title: 'Tailored detection', subtitle: 'Results calibrated to your trigger profile.' },
];

export function PaywallScreen({ navigation }: Props) {
  const { purchase, restore, isPremium } = useSubscription();
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [packageLoading, setPackageLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logPaywallViewed();
    getPremiumPackage()
      .then(setPkg)
      .catch((err) => {
        logError(err instanceof Error ? err : new Error(String(err)), { context: 'loadPaywallPackage' });
      })
      .finally(() => setPackageLoading(false));
  }, []);

  // Navigate away if user is already premium
  useEffect(() => {
    if (isPremium) {
      navigation.goBack();
    }
  }, [isPremium, navigation]);

  const handlePurchase = async () => {
    setError(null);
    setPurchaseLoading(true);
    logPurchaseStarted();
    const result = await purchase();
    setPurchaseLoading(false);
    if (result.success) {
      logPurchaseCompleted();
    } else {
      setError(result.error ?? 'Purchase failed. Please try again.');
    }
  };

  const handleRestore = async () => {
    setError(null);
    setRestoreLoading(true);
    logPurchaseRestoreStarted();
    const result = await restore();
    setRestoreLoading(false);
    logPurchaseRestoreCompleted(result.isPremium);
    if (!result.success && !result.isPremium) {
      setError(result.error ?? 'No previous purchases found.');
    }
  };

  const priceString = pkg?.product.priceString ?? '$4.99';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeLabel}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.appName}>MigraineScan</Text>
          <Text style={styles.planName}>Premium</Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <PaywallFeatureRow key={i} title={f.title} subtitle={f.subtitle} />
          ))}
        </View>

        <View style={styles.pricing}>
          <Text style={styles.price}>{priceString} / month</Text>
          <Text style={styles.priceSubtext}>Cancel anytime</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {packageLoading ? (
          <LoadingSpinner />
        ) : (
          <PrimaryButton
            label="Start Premium"
            onPress={handlePurchase}
            loading={purchaseLoading}
          />
        )}

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={restoreLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.restoreLabel}>
            {restoreLoading ? 'Restoring…' : 'Restore Purchases'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Terms · Privacy{'\n'}
          Auto-renews monthly unless cancelled 24 hours before renewal.
          Manage in App Store settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  topBar: {
    alignItems: 'flex-end',
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: { gap: 4 },
  appName: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  planName: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  features: { gap: theme.spacing.lg },
  pricing: { gap: 4, alignItems: 'center' },
  price: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  priceSubtext: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  errorBox: {
    backgroundColor: theme.colors.verdictAvoidBg,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
  },
  errorText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.verdictAvoid,
    textAlign: 'center',
  },
  restoreButton: { alignItems: 'center', paddingVertical: theme.spacing.xs },
  restoreLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  legal: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 11,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
});
