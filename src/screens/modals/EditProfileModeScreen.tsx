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
import type { ProfileMode } from '../../types';
import { ProfileModeCard } from '../../components/onboarding/ProfileModeCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { theme, TABLET_MAX_WIDTH } from '../../styles/theme';
import { useUserProfile } from '../../hooks/useUserProfile';
import { logProfileModeSelected } from '../../firebase/analytics';
import { logError } from '../../firebase/crashlytics';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfileModeModal'>;

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

export function EditProfileModeScreen({ navigation }: Props) {
  const { userDoc, saveProfile } = useUserProfile();
  const [selected, setSelected] = useState<ProfileMode | null>(userDoc?.profileMode ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      await saveProfile({ profileMode: selected });
      logProfileModeSelected(selected);
      navigation.goBack();
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), { context: 'editProfileMode' });
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
          <Text style={styles.headline}>Update profile mode</Text>
          <Text style={styles.subhead}>
            This helps calibrate how your scan results are presented.
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

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <PrimaryButton
          label="Save Changes"
          onPress={handleSave}
          loading={loading}
          disabled={!selected}
        />
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
  options: { gap: theme.spacing.sm },
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
