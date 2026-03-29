import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/RootStackParamList';
import type { TriggerCategory, SensitivityLevel, TriggerProfile } from '../../types';
import { OnboardingProgressDots } from '../../components/onboarding/OnboardingProgressDots';
import { SensitivityChips } from '../../components/onboarding/SensitivityChips';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useUserProfile } from '../../hooks/useUserProfile';
import { getDefaultTriggerProfile } from '../../logic/profileDefaults';
import { theme, TABLET_MAX_WIDTH } from '../../styles/theme';
import { logTriggerProfileSaved } from '../../firebase/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'TriggerSensitivity'>;

const TRIGGER_ROWS: { category: TriggerCategory; label: string; description: string }[] = [
  { category: 'tyramine', label: 'Tyramine', description: 'Found in aged and cured foods' },
  { category: 'histamine', label: 'Histamine', description: 'Found in fermented and aged foods' },
  { category: 'msg_glutamates', label: 'MSG / Glutamates', description: 'Common in processed and packaged foods' },
  { category: 'nitrates_nitrites', label: 'Nitrates / Nitrites', description: 'Used in cured and processed meats' },
  { category: 'artificial_sweeteners', label: 'Artificial Sweeteners', description: 'Found in diet and sugar-free products' },
  { category: 'caffeine', label: 'Caffeine', description: 'Found in coffee, tea, and energy drinks' },
  { category: 'alcohol', label: 'Alcohol', description: 'Wine, beer, spirits, cooking ingredients' },
];

export function TriggerSensitivityScreen({ navigation }: Props) {
  const { saveProfile } = useUserProfile();
  const [profile, setProfile] = useState<TriggerProfile>(getDefaultTriggerProfile());
  const [loading, setLoading] = useState(false);

  const setLevel = (category: TriggerCategory, level: SensitivityLevel) => {
    setProfile((prev) => ({ ...prev, [category]: level }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveProfile({ triggerProfile: profile });
      logTriggerProfileSaved();
    } catch {
      // Non-blocking — continue
    } finally {
      setLoading(false);
    }
    navigation.navigate('HowItWorks');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingProgressDots total={5} current={4} />

        <View style={styles.header}>
          <Text style={styles.headline}>Set your sensitivities</Text>
          <Text style={styles.subhead}>
            You can update these anytime. We'll use conservative defaults if you skip any.
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

        <PrimaryButton label="Continue" onPress={handleSave} loading={loading} />

        <Text style={styles.skip} onPress={() => navigation.navigate('HowItWorks')}>
          Skip — use conservative defaults
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
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
  skip: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xs,
  },
});
