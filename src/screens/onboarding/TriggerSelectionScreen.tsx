import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/RootStackParamList';
import type { TriggerCategory } from '../../types';
import { OnboardingProgressDots } from '../../components/onboarding/OnboardingProgressDots';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { theme } from '../../styles/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'TriggerSelection'>;

const TRIGGERS: { category: TriggerCategory; label: string; description: string }[] = [
  { category: 'tyramine', label: 'Tyramine', description: 'Aged cheeses, cured meats, fermented foods' },
  { category: 'histamine', label: 'Histamine', description: 'Wine, aged fish, fermented vinegars' },
  { category: 'msg_glutamates', label: 'MSG / Glutamates', description: 'Processed and packaged foods' },
  { category: 'nitrates_nitrites', label: 'Nitrates / Nitrites', description: 'Hot dogs, deli meats, bacon' },
  { category: 'artificial_sweeteners', label: 'Artificial Sweeteners', description: 'Diet drinks, sugar-free products' },
  { category: 'caffeine', label: 'Caffeine', description: 'Coffee, tea, energy drinks, sodas' },
  { category: 'alcohol', label: 'Alcohol', description: 'Wine, beer, spirits, cooking ingredients' },
];

export function TriggerSelectionScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<Set<TriggerCategory>>(new Set());

  const toggle = (cat: TriggerCategory) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingProgressDots total={5} current={3} />

        <View style={styles.header}>
          <Text style={styles.headline}>Which triggers concern you most?</Text>
          <Text style={styles.subhead}>
            Select all that apply. You can change this anytime in your profile.
          </Text>
        </View>

        <View style={styles.list}>
          {TRIGGERS.map((t) => {
            const isSelected = selected.has(t.category);
            return (
              <TouchableOpacity
                key={t.category}
                style={[styles.item, isSelected && styles.itemSelected]}
                onPress={() => toggle(t.category)}
                activeOpacity={0.7}
              >
                <View style={styles.itemLeft}>
                  <Text style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}>
                    {t.label}
                  </Text>
                  <Text style={styles.itemDescription}>{t.description}</Text>
                </View>
                <View style={[styles.checkBox, isSelected && styles.checkBoxSelected]}>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <PrimaryButton
          label={selected.size > 0 ? `Continue (${selected.size} selected)` : 'Continue'}
          onPress={() => navigation.navigate('TriggerSensitivity')}
        />

        <Text style={styles.skip} onPress={() => navigation.navigate('TriggerSensitivity')}>
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
  list: { gap: theme.spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  itemSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  itemLeft: { flex: 1, gap: 2 },
  itemLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  itemLabelSelected: { color: theme.colors.primaryDark },
  itemDescription: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkMark: { color: theme.colors.white, fontSize: 14, fontWeight: '800' },
  skip: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xs,
  },
});
