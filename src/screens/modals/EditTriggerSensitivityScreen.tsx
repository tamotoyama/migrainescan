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
import type { TriggerCategory, SensitivityLevel, TriggerProfile } from '../../types';
import { SensitivityChips } from '../../components/onboarding/SensitivityChips';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { theme, TABLET_MAX_WIDTH } from '../../styles/theme';
import { useUserProfile } from '../../hooks/useUserProfile';
import { logTriggerProfileSaved } from '../../firebase/analytics';
import { logError } from '../../firebase/crashlytics';

type Props = NativeStackScreenProps<RootStackParamList, 'EditTriggerSensitivityModal'>;

const TRIGGER_ROWS: { category: TriggerCategory; label: string; description: string }[] = [
  { category: 'tyramine', label: 'Tyramine', description: 'Found in aged and cured foods' },
  { category: 'histamine', label: 'Histamine', description: 'Found in fermented and aged foods' },
  { category: 'msg_glutamates', label: 'MSG / Glutamates', description: 'Common in processed and packaged foods' },
  { category: 'nitrates_nitrites', label: 'Nitrates / Nitrites', description: 'Used in cured and processed meats' },
  { category: 'artificial_sweeteners', label: 'Artificial Sweeteners', description: 'Found in diet and sugar-free products' },
  { category: 'caffeine', label: 'Caffeine', description: 'Found in coffee, tea, and energy drinks' },
  { category: 'alcohol', label: 'Alcohol', description: 'Wine, beer, spirits, cooking ingredients' },
];

export function EditTriggerSensitivityScreen({ navigation }: Props) {
  const { triggerProfile, saveProfile } = useUserProfile();
  const [profile, setProfile] = useState<TriggerProfile>({ ...triggerProfile });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLevel = (category: TriggerCategory, level: SensitivityLevel) => {
    setProfile((prev) => ({ ...prev, [category]: level }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await saveProfile({ triggerProfile: profile });
      logTriggerProfileSaved();
      navigation.goBack();
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), { context: 'editTriggerProfile' });
      setError('Could not save your changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headline}>Update your sensitivities</Text>
          <Text style={styles.subhead}>
            Changes apply to future scans. Past results are not affected.
          </Text>
        </View>

        <View style={styles.rows}>
          {TRIGGER_ROWS.map((row) => (
            <View key={row.category} style={styles.triggerCard}>
              <Text style={styles.triggerLabel}>{row.label}</Text>
              <Text style={styles.triggerDescription}>{row.description}</Text>
              <SensitivityChips
                selected={profile[row.category]}
                onChange={(level) => setLevel(row.category, level)}
              />
            </View>
          ))}
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <PrimaryButton label="Save Changes" onPress={handleSave} loading={loading} />
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
    alignItems: 'flex-start',
  },
  cancelButton: { paddingVertical: theme.spacing.xs },
  cancelLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    maxWidth: TABLET_MAX_WIDTH,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  header: { gap: theme.spacing.sm },
  headline: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    lineHeight: 32,
  },
  subhead: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  rows: { gap: theme.spacing.md },
  triggerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  triggerLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  triggerDescription: {
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
});
