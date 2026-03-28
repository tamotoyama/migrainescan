import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../styles/theme';

interface Props {
  onSetUp: () => void;
}

export function ProfileNudgeCard({ onSetUp }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Add your trigger sensitivities</Text>
      <Text style={styles.body}>
        Your profile is incomplete. We're using conservative defaults.
        Set your sensitivities for more tailored results.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onSetUp} activeOpacity={0.7}>
        <Text style={styles.buttonLabel}>Set up profile →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.verdictReviewBg,
    borderColor: theme.colors.verdictReviewBorder,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  title: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.verdictReview,
  },
  body: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  buttonLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.verdictReview,
  },
});
