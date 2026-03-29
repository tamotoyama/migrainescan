import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/RootStackParamList';
import { OnboardingProgressDots } from '../../components/onboarding/OnboardingProgressDots';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { theme, TABLET_MAX_WIDTH } from '../../styles/theme';
import { logOnboardingStarted } from '../../firebase/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingIntro'>;

const FEATURES = [
  { title: 'Scan packaged foods in seconds', subtitle: 'Just scan the barcode — no manual entry needed.' },
  { title: 'Detect common migraine trigger ingredients', subtitle: 'We check for tyramine, MSG, nitrates, caffeine, and more.' },
  { title: 'Personalize results to your sensitivities', subtitle: 'Tell us what affects you most for tailored results.' },
];

export function OnboardingIntroScreen({ navigation }: Props) {
  const handleContinue = () => {
    logOnboardingStarted();
    navigation.navigate('ProfileMode');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingProgressDots total={5} current={1} />

        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🌿</Text>
          <Text style={styles.heroHeadline}>Reduce uncertainty{'\n'}before you eat.</Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.checkDot} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSubtitle}>{f.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <PrimaryButton label="Let's Get Started" onPress={handleContinue} />
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
  heroCard: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  heroEmoji: { fontSize: 40 },
  heroHeadline: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  features: { gap: theme.spacing.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  checkDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    marginTop: 2,
  },
  featureText: { flex: 1, gap: 2 },
  featureTitle: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  featureSubtitle: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
});
