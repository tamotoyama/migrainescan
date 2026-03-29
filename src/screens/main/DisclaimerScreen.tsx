import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme, TABLET_MAX_WIDTH } from '../../styles/theme';

export function DisclaimerScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLabel}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>About & Disclaimer</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is MigraineScan?</Text>
          <Text style={styles.body}>
            MigraineScan is an educational label-literacy tool that helps you identify
            common migraine-related trigger ingredients in packaged foods. It is not a
            medical device, diagnostic tool, treatment advisor, or symptom tracker.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What the verdicts mean</Text>
          <Text style={styles.body}>
            <Text style={styles.bold}>SAFE</Text> — No common migraine triggers were
            detected in our database for this product.{'\n\n'}
            <Text style={styles.bold}>REVIEW</Text> — The product contains one or more
            ingredients that may be migraine triggers for some people.{'\n\n'}
            <Text style={styles.bold}>AVOID</Text> — The product contains multiple or
            stronger migraine trigger signals based on your profile.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health disclaimer</Text>
          <Text style={styles.body}>
            The information provided by MigraineScan is for educational and
            informational purposes only. It is not intended as medical advice and
            should not be used as a substitute for professional medical diagnosis,
            advice, or treatment.{'\n\n'}
            Food triggers are highly individual. An ingredient flagged by this app
            may not trigger a migraine in you, and an unlisted ingredient may still
            be a personal trigger. Always consult a qualified healthcare professional
            regarding any medical decisions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data sources</Text>
          <Text style={styles.body}>
            Product ingredient data is sourced from OpenFoodFacts
            (openfoodfacts.org), a free, open, collaborative database of food
            products. Data quality and completeness varies by product and region.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.body}>support@migrainescan.app</Text>
        </View>
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
  },
  backLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
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
  title: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  section: { gap: theme.spacing.sm },
  sectionTitle: {
    fontFamily: theme.fontFamily.serif,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  body: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    lineHeight: 23,
  },
  bold: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
