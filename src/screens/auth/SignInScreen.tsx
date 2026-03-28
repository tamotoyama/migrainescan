import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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
import { theme } from '../../styles/theme';
import { logAuthSigninCompleted } from '../../firebase/analytics';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const { signIn, signInApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Sign in failed.');
    } else {
      logAuthSigninCompleted();
    }
  };

  const handleApple = async () => {
    setError(null);
    setAppleLoading(true);
    const result = await signInApple();
    setAppleLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Apple sign in failed.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backLabel}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.headline}>Welcome back</Text>
          <Text style={styles.subhead}>Sign in to continue.</Text>

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
            <FormInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
            />

            <TouchableOpacity
              style={styles.forgot}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotLabel}>Forgot password?</Text>
            </TouchableOpacity>

            <PrimaryButton
              label="Sign In"
              onPress={handleSignIn}
              loading={loading}
            />

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.orLine} />
            </View>

            <PrimaryButton
              label="Continue with Apple"
              variant="secondary"
              onPress={handleApple}
              loading={appleLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
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
  forgot: { alignSelf: 'flex-end', marginTop: -theme.spacing.xs },
  forgotLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  orLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  orText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
});
