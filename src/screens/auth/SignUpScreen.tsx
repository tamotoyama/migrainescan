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
import { theme, TABLET_MAX_WIDTH } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { logAuthSignupCompleted } from '../../firebase/analytics';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const { signUp, signInApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; general?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (password !== confirm) next.confirm = 'Passwords do not match.';
    return next;
  };

  const handleSignUp = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const result = await signUp(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setErrors({ general: result.error });
    } else {
      logAuthSignupCompleted();
    }
  };

  const handleApple = async () => {
    setAppleLoading(true);
    const result = await signInApple();
    setAppleLoading(false);
    if (!result.success) {
      setErrors({ general: result.error });
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
            <Ionicons name="chevron-back" size={18} color={theme.colors.primary} />
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.headline}>Create your account</Text>
          <Text style={styles.subhead}>Free to sign up.</Text>

          <View style={styles.form}>
            {errors.general && (
              <View style={styles.generalError}>
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            <FormInput
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              error={errors.email}
            />
            <FormInput
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              error={errors.password}
            />
            <FormInput
              label="Confirm password"
              placeholder="Repeat password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoComplete="new-password"
              error={errors.confirm}
            />

            <PrimaryButton
              label="Create Account"
              onPress={handleSignUp}
              loading={loading}
              style={styles.ctaButton}
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    maxWidth: TABLET_MAX_WIDTH,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  back: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingBottom: theme.spacing.sm },
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
  generalError: {
    backgroundColor: theme.colors.verdictAvoidBg,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
  },
  generalErrorText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.verdictAvoid,
  },
  ctaButton: { marginTop: theme.spacing.sm },
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
