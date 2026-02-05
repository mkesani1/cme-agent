import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/hooks/useAuth';
import { Button, Input, Card } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/lib/theme';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
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

    const { error: signUpError } = await signUp(email, password, fullName);

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
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
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join thousands of physicians managing their CME effortlessly
            </Text>
          </View>

          {/* Register Form */}
          <Card style={styles.card}>
            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successTitle}>Check your email!</Text>
                <Text style={styles.successText}>
                  We've sent a confirmation link to {email}. Please check your inbox and click the link to activate your account.
                </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity style={styles.backToLogin}>
                    <Text style={styles.loginLink}>Back to Sign In</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            ) : null}

            {!success && (
              <>
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
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

                <Button
                  title="Create Account"
                  onPress={handleRegister}
                  loading={loading}
                  style={styles.button}
                />

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                      <Text style={styles.loginLink}>Sign In</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </>
            )}
          </Card>
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
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  backToLogin: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
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
