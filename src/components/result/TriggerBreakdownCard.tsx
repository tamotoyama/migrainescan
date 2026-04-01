import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import type { ScoredTrigger } from "../../types";
import { theme } from "../../styles/theme";
import { SeverityPill } from "./SeverityPill";
import { ConfidencePill } from "./ConfidencePill";

interface Props {
  triggers: ScoredTrigger[];
}

function TriggerItem({ trigger }: { trigger: ScoredTrigger }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => setExpanded((e) => !e)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemName}>{trigger.displayName}</Text>
          <Text style={styles.itemCategory}>
            {trigger.category
              .replace(/_/g, " / ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </Text>
        </View>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path
            d={expanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}
            stroke={theme.colors.textSecondary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      <View style={styles.pills}>
        <SeverityPill severity={trigger.severity} />
        <ConfidencePill confidence={trigger.confidence} />
      </View>

      {expanded && (
        <View style={styles.explanation}>
          <Text style={styles.explanationText}>{trigger.explanation}</Text>
          {trigger.caveat && (
            <Text style={styles.caveatText}>{trigger.caveat}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export function TriggerBreakdownCard({ triggers }: Props) {
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01"
              stroke={theme.colors.verdictReview}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.headerText}>
            Triggers found ({triggers.length})
          </Text>
          <TouchableOpacity
            onPress={() => setSheetVisible(true)}
            style={styles.infoButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                stroke={theme.colors.primary}
                strokeWidth={1.8}
              />
              <Path
                d="M12 11v6M12 8h.01"
                stroke={theme.colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {triggers.map((trigger, idx) => (
          <View key={trigger.id}>
            {idx > 0 && <View style={styles.divider} />}
            <TriggerItem trigger={trigger} />
          </View>
        ))}

        <Text style={styles.tapHint}>Tap any trigger to learn more.</Text>
      </View>

      <Modal
        visible={sheetVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSheetVisible(false)}
      >
        <View style={styles.sheetContainer}>
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setSheetVisible(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>What these labels mean</Text>
              <TouchableOpacity
                onPress={() => setSheetVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetSection}>
              <Text style={styles.sheetSectionTitle}>Severity</Text>
              <Text style={styles.sheetPills}>Mild · Moderate · Significant</Text>
              <Text style={styles.sheetBody}>
                How strongly this trigger category is linked to migraines, based
                on its known risk level (not the quantity in the product).
              </Text>
            </View>

            <View style={styles.sheetDivider} />

            <View style={styles.sheetSection}>
              <Text style={styles.sheetSectionTitle}>Detection</Text>
              <Text style={styles.sheetPills}>
                Confirmed · Likely present · Inferred
              </Text>
              <Text style={styles.sheetBody}>
                How clearly this ingredient was found in the ingredient list.
                {"\n\n"}
                <Text style={styles.sheetBold}>Confirmed</Text> — found by name
                explicitly.
                {"\n"}
                <Text style={styles.sheetBold}>Likely present</Text> — indirect or
                ambiguous match.
                {"\n"}
                <Text style={styles.sheetBold}>Inferred</Text> — detected
                indirectly; check the label yourself.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.sheetDone}
              onPress={() => setSheetVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.sheetDoneLabel}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  headerText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  item: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  itemLeft: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  itemCategory: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  pills: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    flexWrap: "wrap",
  },
  explanation: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  explanationText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: "400",
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
  caveatText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: "400",
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 17,
  },
  tapHint: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingBottom: theme.spacing.sm,
    opacity: 0.7,
  },
  infoButton: {
    marginLeft: "auto",
  },
  sheetContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
    marginBottom: theme.spacing.xs,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
  },
  sheetSection: {
    gap: theme.spacing.xs,
  },
  sheetSectionTitle: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  sheetPills: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: 0.2,
  },
  sheetBody: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: "400",
    color: theme.colors.textSecondary,
    lineHeight: 21,
  },
  sheetBold: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  sheetDone: {
    marginTop: theme.spacing.sm,
    height: 48,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetDoneLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.primary,
  },
});
