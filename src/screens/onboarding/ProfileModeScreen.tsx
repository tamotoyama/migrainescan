import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/RootStackParamList';
import type { ProfileMode } from '../../types';
import { OnboardingProgressDots } from '../../components/onboarding/OnboardingProgressDots';
import { ProfileModeCard } from '../../components/onboarding/ProfileModeCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useUserProfile } from '../../hooks/useUserProfile';
import { theme, TABLET_MAX_WIDTH } from '../../styles/theme';
import { logProfileModeSelected } from '../../firebase/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ProfileMode'>;

const MODES: { mode: ProfileMode; title: string; description: string }[] = [
  {
    mode: 'doctor_diagnosed',
    title: 'Doctor-diagnosed migraines',
    description: 'A clinician has diagnosed my condition.',
  },
  {
    mode: 'suspected_food_trigger',
    title: 'Suspected food triggers',
    description: "I notice patterns but I'm still figuring it out.",
  },
  {
    mode: 'just_exploring',
    title: 'Just exploring',
    description: 'I want to learn more about food triggers.',
  },
];

export function ProfileModeScreen({ navigation }: Props) {
  const { saveProfile } = useUserProfile();
  const [selected, setSelected] = useState<ProfileMode | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await saveProfile({ profileMode: selected });
      logProfileModeSelected(selected);
    } catch {
      // Non-blocking — continue even if save fails
    } finally {
      setLoading(false);
    }
    navigation.navigate('TriggerSelection');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingProgressDots total={5} current={2} />

        <View style={styles.header}>
          <Text style={styles.headline}>How do you relate{'\n'}to migraines?</Text>
          <Text style={styles.subhead}>
            This helps us calibrate your results appropriately.
          </Text>
        </View>

        <View style={styles.options}>
          {MODES.map((m) => (
            <ProfileModeCard
              key={m.mode}
              mode={m.mode}
              title={m.title}
              description={m.description}
              selected={selected === m.mode}
              onSelect={setSelected}
            />
          ))}
        </View>

        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={!selected}
        />

        <Text style={styles.skip} onPress={() => navigation.navigate('TriggerSelection')}>
          Skip for now
        </Text>
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
  options: { gap: theme.spacing.sm },
  skip: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xs,
  },
});
