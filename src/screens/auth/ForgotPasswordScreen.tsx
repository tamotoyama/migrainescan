import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/RootStackParamList';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../hooks/useAuth';
import { theme, TABLET_MAX_WIDTH } from '../../styles/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error ?? 'Could not send reset email.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backLabel}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.headline}>Reset your password</Text>
          <Text style={styles.subhead}>
            We'll send a reset link to your email address.
          </Text>

          {sent ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                Check your email for a password reset link. It may take a minute to arrive.
              </Text>
              <PrimaryButton
                label="Back to Sign In"
                onPress={() => navigation.navigate('SignIn')}
                style={styles.button}
              />
            </View>
          ) : (
            <View style={styles.form}>
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              <FormInput
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="email"
              />
              <PrimaryButton
                label="Send Reset Link"
                onPress={handleReset}
                loading={loading}
                style={styles.button}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    maxWidth: TABLET_MAX_WIDTH,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  back: { alignSelf: 'flex-start', paddingBottom: theme.spacing.sm },
  backLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  headline: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subhead: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginTop: -theme.spacing.xs,
  },
  form: { gap: theme.spacing.md, marginTop: theme.spacing.sm },
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
  },
  successBox: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  successText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  button: { marginTop: theme.spacing.sm },
});
