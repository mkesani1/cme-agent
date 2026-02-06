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
    let authSubscription: { unsubscribe: () => void } | null = null;
    let timeoutId: NodeJS.Timeout;

    async function setupAuthListener() {
      // Safety timeout - if nothing happens in 30 seconds, show error
      timeoutId = setTimeout(() => {
        if (isMounted && verifying) {
          setError('Connection timed out. Please check your internet and try again.');
          setVerifying(false);
        }
      }, 30000);

      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;

          console.log('Auth event:', event, 'Session:', !!session);

          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            if (session) {
              clearTimeout(timeoutId);
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.history.replaceState(null, '', window.location.pathname);
              }
              setSessionValid(true);
              setVerifying(false);
            }
          } else if (event === 'TOKEN_REFRESHED' && session) {
            clearTimeout(timeoutId);
            setSessionValid(true);
            setVerifying(false);
          }
        }
      );

      authSubscription = subscription;

      // For web, check if there's a hash fragment that Supabase needs to process
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const hash = window.location.hash;
        console.log('URL hash present:', !!hash, hash?.substring(0, 50));

        if (hash && hash.includes('access_token')) {
          // Parse the hash and set session manually
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const errorCode = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');

          // Check for error in the hash (Supabase returns errors this way)
          if (errorCode) {
            clearTimeout(timeoutId);
            setError(errorDescription || `Error: ${errorCode}`);
            setVerifying(false);
            return;
          }

          if (accessToken && refreshToken) {
            try {
              console.log('Setting session with tokens...');
              const { data, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });

              if (!isMounted) return;

              if (sessionError) {
                console.error('Session set error:', sessionError);
                clearTimeout(timeoutId);
                setError(sessionError.message || 'Failed to verify reset link.');
                setVerifying(false);
                return;
              }

              if (data.session) {
                console.log('Session set successfully');
                clearTimeout(timeoutId);
                window.history.replaceState(null, '', window.location.pathname);
                setSessionValid(true);
                setVerifying(false);
                return;
              }
            } catch (e: any) {
              console.error('Error setting session:', e);
              if (!isMounted) return;
              clearTimeout(timeoutId);
              setError(e?.message || 'Failed to verify reset link.');
              setVerifying(false);
              return;
            }
          }
        }

        // Check for existing session as fallback
        try {
          console.log('Checking for existing session...');
          const { data: { session } } = await supabase.auth.getSession();

          if (!isMounted) return;

          clearTimeout(timeoutId);
          if (session) {
            console.log('Found existing session');
            setSessionValid(true);
          } else {
            console.log('No session found');
            setError('Invalid or expired reset link. Please request a new one.');
          }
          setVerifying(false);
        } catch (e: any) {
          if (!isMounted) return;
          clearTimeout(timeoutId);
          setError(e?.message || 'Failed to check session.');
          setVerifying(false);
        }
      } else {
        // For native
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!isMounted) return;

          clearTimeout(timeoutId);
          if (session) {
            setSessionValid(true);
          } else {
            setError('Invalid or expired reset link. Please request a new one.');
          }
          setVerifying(false);
        } catch (e: any) {
          if (!isMounted) return;
          clearTimeout(timeoutId);
          setError(e?.message || 'Failed to check session.');
          setVerifying(false);
        }
      }
    }

    setupAuthListener();

    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

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

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    }
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
          <Text style={styles.successTitle}>Password Updated!</Text>
          <Text style={styles.successText}>
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
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
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
