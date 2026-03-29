import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/RootStackParamList';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { theme, TABLET_MAX_WIDTH } from '../../styles/theme';
import { logAuthSignupStarted } from '../../firebase/analytics';

type Props = NativeStackScreenProps<AuthStackParamList, 'WelcomeAuth'>;

function BarcodeScanIllustration() {
  return (
    <Svg width={200} height={140} viewBox="0 0 200 140">
      {/* Barcode bars */}
      {[10, 18, 24, 32, 38, 50, 56, 62, 70, 78, 88, 94, 100, 110, 116, 124, 132, 140, 148, 156].map(
        (x, i) => (
          <Rect
            key={x}
            x={x}
            y={20}
            width={i % 3 === 0 ? 4 : 2}
            height={90}
            fill={theme.colors.primaryDark}
            opacity={0.7}
          />
        ),
      )}
      {/* Corner brackets */}
      <Path d="M 0 0 L 0 24 M 0 0 L 24 0" stroke={theme.colors.primary} strokeWidth={3} fill="none" />
      <Path d="M 200 0 L 200 24 M 200 0 L 176 0" stroke={theme.colors.primary} strokeWidth={3} fill="none" />
      <Path d="M 0 140 L 0 116 M 0 140 L 24 140" stroke={theme.colors.primary} strokeWidth={3} fill="none" />
      <Path d="M 200 140 L 200 116 M 200 140 L 176 140" stroke={theme.colors.primary} strokeWidth={3} fill="none" />
      {/* Scan line */}
      <Path d="M 0 70 L 200 70" stroke={theme.colors.primary} strokeWidth={1.5} opacity={0.6} />
    </Svg>
  );
}

export function WelcomeAuthScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[theme.colors.primaryLight, theme.colors.background]}
          style={styles.illustrationWrapper}
        >
          <BarcodeScanIllustration />
        </LinearGradient>

        <View style={styles.textBlock}>
          <Text style={styles.headline}>
            Scan packaged foods for common migraine triggers
          </Text>
          <Text style={styles.body}>
            Get a fast, conservative ingredient review tailored to your sensitivities.
          </Text>
        </View>

        <View style={styles.buttons}>
          <PrimaryButton
            label="Create Account"
            onPress={() => {
              logAuthSignupStarted();
              navigation.navigate('SignUp');
            }}
          />
          <PrimaryButton
            label="Sign In"
            variant="secondary"
            onPress={() => navigation.navigate('SignIn')}
          />
        </View>

        <Text style={styles.terms}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    maxWidth: TABLET_MAX_WIDTH,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  illustrationWrapper: {
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  textBlock: {
    gap: theme.spacing.sm,
  },
  headline: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 34,
  },
  body: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  buttons: {
    gap: theme.spacing.sm,
  },
  terms: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 11,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
