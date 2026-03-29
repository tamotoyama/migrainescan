import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Ellipse, Path, Polygon, Rect } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/RootStackParamList';
import { theme, TABLET_MAX_WIDTH } from '../../styles/theme';
import { useAuth } from '../../hooks/useAuth';
import { useScanLimit } from '../../hooks/useScanLimit';
import { useUserProfile } from '../../hooks/useUserProfile';
import { logScanButtonTapped } from '../../firebase/analytics';

type Props = NativeStackScreenProps<MainTabParamList, 'ScanTab'>;

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { canScan: userCanScan, scanAccessLabel } = useScanLimit();
  const { personalizationCompletion } = useUserProfile();

  const navigateToScanner = () => {
    logScanButtonTapped();
    (navigation as any).navigate('Scanner');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoIconBg}>
            <Svg width={56} height={62} viewBox="0 0 100 100">
              {/* Brain */}
              <Ellipse cx={50} cy={43} rx={24} ry={26} fill={theme.colors.primary} />
              {/* Brain stem */}
              <Rect x={44} y={67} width={12} height={10} rx={3} fill={theme.colors.primary} />
              {/* Lightning bolt */}
              <Polygon
                points="55,24 43,47 52,47 43,64 63,39 54,39"
                fill={theme.colors.primaryDeep}
                opacity={0.75}
              />
            </Svg>
          </View>
          <Text style={styles.wordmark}>MigraineScan</Text>
          <Text style={styles.subtitle}>
            Scan a barcode to check for migraine-related ingredients
          </Text>
        </View>

        {/* Profile nudge */}
        {!personalizationCompletion.isCompleteEnoughForTailoredResults && (
          <TouchableOpacity
            style={styles.nudgeCard}
            onPress={() => (navigation as any).navigate('AccountTab')}
            activeOpacity={0.8}
          >
            <Text style={styles.nudgeTitle}>⚠ Complete your profile</Text>
            <Text style={styles.nudgeBody}>
              Set your trigger sensitivities for more tailored results.
            </Text>
            <Text style={styles.nudgeAction}>Set up →</Text>
          </TouchableOpacity>
        )}

        {/* Scan CTA */}
        <TouchableOpacity
          style={[styles.scanButton, !userCanScan && styles.scanButtonDisabled]}
          onPress={userCanScan ? navigateToScanner : () => (navigation as any).navigate('PaywallModal', { source: 'home_scan_cta' })}
          disabled={false}
          activeOpacity={0.85}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" style={styles.scanButtonIcon}>
            <Path
              d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M15 3h4a2 2 0 012 2v4M15 21h4a2 2 0 002-2v-4"
              stroke={theme.colors.white}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.scanButtonLabel}>
            {userCanScan ? 'Scan Food' : 'Upgrade to Scan'}
          </Text>
        </TouchableOpacity>

        {/* Scan limit — below button */}
        <View style={styles.scanMeta}>
          <Text style={styles.scanMetaLabel}>{scanAccessLabel}</Text>
        </View>

        {!userCanScan && (
          <TouchableOpacity
            style={styles.upgradeLink}
            onPress={() => (navigation as any).navigate('PaywallModal', { source: 'home_scan_limit' })}
            activeOpacity={0.7}
          >
            <Text style={styles.upgradeLinkLabel}>View Premium →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    alignItems: 'center',
    maxWidth: TABLET_MAX_WIDTH,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  hero: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  logoIconBg: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  wordmark: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  nudgeCard: {
    width: '100%',
    backgroundColor: theme.colors.verdictReviewBg,
    borderColor: theme.colors.verdictReviewBorder,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 4,
  },
  nudgeTitle: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.verdictReview,
  },
  nudgeBody: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  nudgeAction: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.verdictReview,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    height: 64,
    width: '100%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.38,
    shadowRadius: 32,
    elevation: 8,
  },
  scanButtonDisabled: { opacity: 0.5 },
  scanButtonIcon: { marginRight: 4 },
  scanButtonLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.white,
  },
  scanMeta: { alignItems: 'center' },
  scanMetaLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  upgradeLink: { alignItems: 'center', paddingVertical: theme.spacing.xs },
  upgradeLinkLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
