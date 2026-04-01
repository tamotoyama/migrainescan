import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TriggerProfile, SensitivityLevel } from '../../types';
import { theme, getSensitivityLabel } from '../../styles/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  snapshot: TriggerProfile;
  scanDate: string; // formatted date string e.g. "Jan 6, 2025"
}

const TRIGGER_LABELS: { key: keyof TriggerProfile; label: string }[] = [
  { key: 'tyramine', label: 'Tyramine' },
  { key: 'histamine', label: 'Histamine' },
  { key: 'msg_glutamates', label: 'MSG / Glutamates' },
  { key: 'nitrates_nitrites', label: 'Nitrates / Nitrites' },
  { key: 'artificial_sweeteners', label: 'Artificial Sweeteners' },
  { key: 'caffeine', label: 'Caffeine' },
  { key: 'alcohol', label: 'Alcohol' },
];

function SensitivityPill({ level }: { level: SensitivityLevel }) {
  const pillStyle = (() => {
    switch (level) {
      case 'high':     return styles.pillHigh;
      case 'moderate': return styles.pillModerate;
      case 'mild':     return styles.pillMild;
      case 'none':
      case 'unknown':  return styles.pillNeutral;
    }
  })();
  const textStyle = (() => {
    switch (level) {
      case 'high':     return styles.pillTextHigh;
      case 'moderate': return styles.pillTextModerate;
      case 'mild':     return styles.pillTextMild;
      case 'none':
      case 'unknown':  return styles.pillTextNeutral;
    }
  })();

  return (
    <View style={[styles.pill, pillStyle]}>
      <Text style={[styles.pillText, textStyle]}>{getSensitivityLabel(level)}</Text>
    </View>
  );
}

export function ProfileSnapshotSheet({ visible, onClose, snapshot, scanDate }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <SafeAreaView style={styles.sheetContainer} pointerEvents="box-none">
        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Profile at scan time</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Explanation */}
          <View style={styles.explanation}>
            <Text style={styles.explanationDate}>Your sensitivities on {scanDate}</Text>
            <Text style={styles.explanationBody}>
              This scan was scored using these settings. If you've updated your profile since then, past results aren't recalculated.
            </Text>
          </View>

          {/* Sensitivity rows */}
          <ScrollView
            style={styles.rowsScroll}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            {TRIGGER_LABELS.map(({ key, label }, idx) => (
              <View key={key} style={[styles.row, idx > 0 && styles.rowBorder]}>
                <Text style={styles.rowLabel}>{label}</Text>
                <SensitivityPill level={snapshot[key]} />
              </View>
            ))}
          </ScrollView>

          {/* Done */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.doneLabel}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 8,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sheetTitle: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explanation: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  explanationDate: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  explanationBody: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
  rowsScroll: { flexGrow: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  rowLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  pillText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  pillHigh:     { backgroundColor: theme.colors.primaryLight },
  pillModerate: { backgroundColor: theme.colors.verdictReviewBg },
  pillMild:     { backgroundColor: theme.colors.verdictSafeBg },
  pillNeutral:  { backgroundColor: theme.colors.surface },
  pillTextHigh:     { color: theme.colors.primaryDark },
  pillTextModerate: { color: theme.colors.verdictReview },
  pillTextMild:     { color: theme.colors.verdictSafe },
  pillTextNeutral:  { color: theme.colors.textSecondary },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  doneButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
});
