import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { Button, Input, Card } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/lib/theme';
import { commonStyles } from '../../src/lib/commonStyles';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyToken() {
      // Get token_hash from query params (from email link)
      const tokenHash = params.token_hash as string;
      const type = params.type as string;

      console.log('Query params - token_hash:', !!tokenHash, 'type:', type);

      // If we have token_hash in query params, verify it using verifyOtp
      if (tokenHash && type === 'recovery') {
        try {
          console.log('Verifying token with verifyOtp...');
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });

          if (!isMounted) return;

          if (verifyError) {
            console.error('Token verification error:', verifyError);
            setError(verifyError.message || 'Invalid or expired reset link.');
            setVerifying(false);
            return;
          }

          if (data.session) {
            console.log('Token verified successfully, session created');
            setSessionValid(true);
            setVerifying(false);
            return;
          }
        } catch (e: any) {
          console.error('Error verifying token:', e);
          if (!isMounted) return;
          setError(e?.message || 'Failed to verify reset link.');
          setVerifying(false);
          return;
        }
      }

      // Fallback: Check for hash tokens (legacy flow)
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const hash = window.location.hash;
        console.log('URL hash present:', !!hash);

        if (hash && hash.includes('access_token')) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            try {
              console.log('Setting session with hash tokens...');
              const { data, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });

              if (!isMounted) return;

              if (!sessionError && data.session) {
                window.history.replaceState(null, '', window.location.pathname);
                setSessionValid(true);
                setVerifying(false);
                return;
              }
            } catch (e) {
              console.error('Error with hash tokens:', e);
            }
          }
        }
      }

      // No valid token found - check for existing session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session) {
          console.log('Found existing session');
          setSessionValid(true);
        } else {
          console.log('No valid token or session found');
          setError('Invalid or expired reset link. Please request a new one.');
        }
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Failed to check session.');
      }
      setVerifying(false);
    }

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [params.token_hash, params.type]);

  async function handleResetPassword() {
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    // Retry logic for flaky mobile connections
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Password update attempt ${attempt}/${maxRetries}`);
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          lastError = updateError;
          console.error(`Attempt ${attempt} failed:`, updateError.message);

          // Don't retry on certain errors
          if (updateError.message.includes('expired') ||
              updateError.message.includes('invalid') ||
              updateError.message.includes('weak')) {
            setError(updateError.message);
            setLoading(false);
            return;
          }

          // Wait before retry
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        } else {
          // Success!
          console.log('Password updated successfully');
          setSuccess(true);
          setLoading(false);
          return;
        }
      } catch (e: any) {
        lastError = e;
        console.error(`Attempt ${attempt} error:`, e?.message);

        // Wait before retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
    }

    // All retries failed
    setError(lastError?.message || 'Failed to update password. Please try again.');
    setLoading(false);
  }

  // Show loading while verifying session
  if (verifying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Verifying reset link...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show success message
  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={commonStyles.successTitle}>Password Updated!</Text>
          <Text style={commonStyles.successText}>
            Your password has been successfully changed.
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show error if no valid session
  if (!sessionValid) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorTitle}>Link Expired</Text>
          <Text style={styles.errorDescription}>{error}</Text>
          <Button
            title="Request New Link"
            onPress={() => router.replace('/(auth)/forgot-password')}
            style={styles.button}
          />
          <Button
            title="Back to Login"
            variant="outline"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.outlineButton}
          />
        </View>
      </SafeAreaView>
    );
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
            <View style={styles.icon}>
              <Text style={styles.iconText}>🔐</Text>
            </View>
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below
            </Text>
          </View>

          {/* Reset Form */}
          <Card style={styles.card}>
            {error ? (
              <View style={commonStyles.errorContainer}>
                <Text style={commonStyles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="New Password"
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
              title="Update Password"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.button}
            />
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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    padding: spacing.lg,
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
  },
  outlineButton: {
    marginTop: spacing.sm,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successIconText: {
    fontSize: 36,
    color: '#FFFFFF',
  },
  successTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  successText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.risk,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorIconText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  errorDescription: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
