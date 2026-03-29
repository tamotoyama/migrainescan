import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/RootStackParamList';
import type { TriggerCategory, SensitivityLevel } from '../../types';
import { SettingsRow } from '../../components/common/SettingsRow';
import { theme, getSensitivityLabel, TABLET_MAX_WIDTH } from '../../styles/theme';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useUserProfile } from '../../hooks/useUserProfile';
import { logError } from '../../firebase/crashlytics';

type Props = NativeStackScreenProps<MainTabParamList, 'AccountTab'>;

const TRIGGER_ROWS: { category: TriggerCategory; label: string }[] = [
  { category: 'tyramine', label: 'Tyramine' },
  { category: 'histamine', label: 'Histamine' },
  { category: 'msg_glutamates', label: 'MSG / Glutamates' },
  { category: 'nitrates_nitrites', label: 'Nitrates / Nitrites' },
  { category: 'artificial_sweeteners', label: 'Artificial Sweeteners' },
  { category: 'caffeine', label: 'Caffeine' },
  { category: 'alcohol', label: 'Alcohol' },
];

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const { isPremium, restore } = useSubscription();
  const { triggerProfile, userDoc } = useUserProfile();
  const [restoreLoading, setRestoreLoading] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. Your scan history and profile will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Account deletion flow — requires re-auth in production
            // For v1 we show sign out; full deletion requires reauthentication
            Alert.alert(
              'Contact Support',
              'To permanently delete your account, email support@migrainescan.app',
            );
          },
        },
      ],
    );
  };

  const handleRestorePurchases = async () => {
    setRestoreLoading(true);
    try {
      const result = await restore();
      if (result.isPremium) {
        Alert.alert('Restored', 'Your premium subscription has been restored.');
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found for this Apple ID.');
      }
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), { context: 'restorePurchases' });
      Alert.alert('Error', 'Could not restore purchases. Please try again.');
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Account</Text>

        {/* Account section */}
        <View style={styles.card}>
          <Text style={styles.email}>{user?.email ?? 'No email'}</Text>
          <View style={[styles.planBadge, isPremium && styles.planBadgePremium]}>
            <Text style={[styles.planLabel, isPremium && styles.planLabelPremium]}>
              {isPremium ? 'Premium' : 'Free plan'}
            </Text>
          </View>
          {!isPremium && (
            <TouchableOpacity
              style={styles.upgradeLink}
              onPress={() => (navigation as any).navigate('PaywallModal', { source: 'profile' })}
              activeOpacity={0.7}
            >
              <Text style={styles.upgradeLinkLabel}>Upgrade to Premium →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Trigger profile */}
        <SectionHeader title="Trigger Profile" />
        <View style={styles.card}>
          {TRIGGER_ROWS.map((row, idx) => (
            <View key={row.category} style={idx > 0 ? styles.rowDivider : null}>
              <SettingsRow
                label={row.label}
                value={getSensitivityLabel(triggerProfile[row.category] as SensitivityLevel)}
                onPress={() => (navigation as any).navigate('EditTriggerSensitivityModal')}
              />
            </View>
          ))}
        </View>

        {/* Profile mode */}
        <SectionHeader title="My Profile" />
        <View style={styles.card}>
          <SettingsRow
            label="Profile Mode"
            value={
              userDoc?.profileMode === 'doctor_diagnosed'
                ? 'Diagnosed'
                : userDoc?.profileMode === 'suspected_food_trigger'
                  ? 'Suspected'
                  : userDoc?.profileMode === 'just_exploring'
                    ? 'Exploring'
                    : 'Not set'
            }
            onPress={() => (navigation as any).navigate('EditProfileModeModal')}
            showChevron={true}
          />
        </View>

        {/* Support */}
        <SectionHeader title="Support" />
        <View style={styles.card}>
          <SettingsRow
            label="About & Disclaimer"
            onPress={() => (navigation as any).navigate('Disclaimer')}
          />
          <View style={styles.rowDivider}>
            <SettingsRow
              label={restoreLoading ? 'Restoring…' : 'Restore Purchases'}
              onPress={handleRestorePurchases}
            />
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.card}>
          <SettingsRow label="Sign Out" onPress={handleSignOut} showChevron={false} />
          <View style={styles.rowDivider}>
            <SettingsRow
              label="Delete Account"
              onPress={handleDeleteAccount}
              showChevron={false}
              danger
            />
          </View>
        </View>

        <Text style={styles.version}>MigraineScan v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
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
  screenTitle: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  sectionHeader: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: -theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  email: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  planBadge: {
    alignSelf: 'flex-start',
    marginHorizontal: theme.spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  planBadgePremium: {
    backgroundColor: theme.colors.primaryLight,
  },
  planLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  planLabelPremium: {
    color: theme.colors.primaryDark,
  },
  upgradeLink: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  upgradeLinkLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  version: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.sm,
  },
});
