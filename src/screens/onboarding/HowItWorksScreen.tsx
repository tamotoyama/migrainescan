import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/RootStackParamList';
import { OnboardingProgressDots } from '../../components/onboarding/OnboardingProgressDots';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { DisclaimerCard } from '../../components/common/DisclaimerCard';
import { useUserProfile } from '../../hooks/useUserProfile';
import { theme, TABLET_MAX_WIDTH } from '../../styles/theme';
import { logOnboardingCompleted } from '../../firebase/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'HowItWorks'>;

const STEPS = [
  { title: 'Scan the barcode', body: 'Point your camera at any packaged food barcode.' },
  { title: 'We look up the product', body: 'We fetch ingredient data from the OpenFoodFacts database.' },
  { title: 'We check for triggers', body: 'Our ingredient pipeline scans for common migraine-related compounds.' },
  { title: 'You see a conservative result', body: "When in doubt, we flag it. You decide what's right for you." },
];

export function HowItWorksScreen({ navigation }: Props) {
  const { saveProfile } = useUserProfile();
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await saveProfile({ onboardingComplete: true });
      logOnboardingCompleted();
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
    // Navigation is handled automatically by AppNavigator watching onboardingComplete
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingProgressDots total={5} current={5} />

        <View style={styles.header}>
          <Text style={styles.headline}>How it works</Text>
          <Text style={styles.subhead}>A quick overview before you start scanning.</Text>
        </View>

        <View style={styles.steps}>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepBody}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <DisclaimerCard />

        <PrimaryButton label="Start Scanning" onPress={handleFinish} loading={loading} />
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
  },
  subhead: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  steps: { gap: theme.spacing.md },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.white,
  },
  stepText: { flex: 1, gap: 2 },
  stepTitle: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stepBody: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
});
