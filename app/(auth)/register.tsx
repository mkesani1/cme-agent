import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/hooks/useAuth';
import { Button, Input, Card } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/lib/theme';
import { commonStyles } from '../../src/lib/commonStyles';
import { useFadeInUp, useShake } from '../../src/lib/animations';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyAuthError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (msg.includes('invalid email') || msg.includes('invalid_email')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('weak password') || msg.includes('password')) {
    return 'Password is too weak. Use at least 8 characters with a mix of letters and numbers.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  return message;
}

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Animations
  const headerAnim = useFadeInUp(0);
  const cardAnim = useFadeInUp(200);
  const linkAnim = useFadeInUp(400);
  const { shake, style: shakeStyle } = useShake();

  useEffect(() => {
    if (error) {
      shake();
    }
  }, [error]);

  async function handleRegister() {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms and conditions to continue');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signUpError } = await signUp(email.trim(), password, fullName.trim());

      if (signUpError) {
        setError(friendlyAuthError(signUpError.message));
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        // Only redirect to verify-email on SUCCESS
        setTimeout(() => {
          router.replace({
            pathname: '/(auth)/verify-email',
            params: { email: email.trim() },
          });
        }, 1500);
      }
    } catch (e: any) {
      setError(e?.message || 'Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerAnim]}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join thousands of physicians managing their CME effortlessly
            </Text>
          </Animated.View>

          {/* Register Form */}
          <Animated.View style={cardAnim}>
            <Card style={styles.card}>
              {success ? (
                <View style={commonStyles.successContainer}>
                  <Text style={commonStyles.successTitle}>Account Created!</Text>
                  <Text style={commonStyles.successText}>
                    We've sent a confirmation link to {email}. Please check your inbox and click the link to activate your account.
                  </Text>
                  <Text style={commonStyles.successSubtext}>
                    Redirecting to email verification...
                  </Text>
                </View>
              ) : null}

              {!success && (
                <>
                  {error ? (
                    <Animated.View style={shakeStyle}>
                      <View style={commonStyles.errorContainer}>
                        <Text style={commonStyles.errorText}>{error}</Text>
                      </View>
                    </Animated.View>
                  ) : null}

                  <Input
                    label="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Dr. Jane Smith"
                    containerStyle={styles.input}
                  />

                  <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    containerStyle={styles.input}
                  />

                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="••••••••"
                    containerStyle={styles.input}
                  />

                  <Input
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="••••••••"
                    containerStyle={styles.input}
                  />

                  {/* Terms Checkbox */}
                  <View style={styles.termsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        termsAccepted && styles.checkboxChecked,
                      ]}
                      onPress={() => setTermsAccepted(!termsAccepted)}
                    >
                      {termsAccepted && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                    <Text style={styles.termsText}>
                      I agree to the{' '}
                      <Text style={styles.termsLink}>Terms of Service</Text>
                      {' '}and{' '}
                      <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                  </View>

                  <Button
                    title="Create Account"
                    onPress={handleRegister}
                    loading={loading}
                    style={styles.button}
                  />

                  <Animated.View style={[styles.loginContainer, linkAnim]}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <Link href="/(auth)/login" asChild>
                      <TouchableOpacity>
                        <Text style={styles.loginLink}>Sign In</Text>
                      </TouchableOpacity>
                    </Link>
                  </Animated.View>
                </>
              )}
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  card: {
    padding: spacing.lg,
  },
  successContainer: {
    backgroundColor: colors.success + '20',
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.success,
    marginBottom: spacing.sm,
  },
  successText: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  successSubtext: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall.fontSize,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: colors.riskLight + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.risk,
    fontSize: typography.bodySmall.fontSize,
    textAlign: 'center',
  },
  input: {
    marginBottom: spacing.md,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    marginRight: spacing.sm,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  termsText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.accent,
    fontWeight: '600',
  },
  button: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  loginLink: {
    color: colors.accent,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
});
