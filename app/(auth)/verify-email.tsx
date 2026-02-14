import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { Button, Card } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/lib/theme';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const email = (params.email as string) || '';
  const tokenHash = params.token_hash as string;
  const type = params.type as string;

  useEffect(() => {
    let isMounted = true;

    async function verifyEmail() {
      // If we have token_hash in query params, verify it
      if (tokenHash && type === 'signup') {
        try {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'signup',
          });

          if (!isMounted) return;

          if (verifyError) {
            setError(verifyError.message || 'Failed to verify email.');
            setVerifying(false);
            return;
          }

          if (data.session) {
            setSuccess(true);
            setVerifying(false);
            // Auto-redirect after 2 seconds
            setTimeout(() => {
              if (isMounted) {
                router.replace('/');
              }
            }, 2000);
            return;
          }
        } catch (e: any) {
          if (!isMounted) return;
          setError(e?.message || 'Failed to verify email.');
          setVerifying(false);
          return;
        }
      } else {
        // No token provided, show verification pending screen
        setVerifying(false);
      }
    }

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [tokenHash, type]);

  async function handleResendEmail() {
    if (!email) {
      setError('Email address not found');
      return;
    }

    setResendLoading(true);
    setError('');

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    setResendLoading(false);

    if (resendError) {
      setError(resendError.message);
    } else {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    }
  }

  if (verifying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Verifying your email...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Email Verified!</Text>
          <Text style={styles.successText}>
            Your account has been activated. Redirecting to the app...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>✉️</Text>
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to {email}
          </Text>
        </View>

        {/* Content */}
        <Card style={styles.card}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {resendSuccess ? (
            <View style={styles.successContainer}>
              <Text style={styles.successMessage}>
                Verification email sent! Check your inbox.
              </Text>
            </View>
          ) : null}

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionTitle}>What's next?</Text>
            <View style={styles.instruction}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>
                Check your email inbox for a message from CME Agent
              </Text>
            </View>
            <View style={styles.instruction}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>
                Click the verification link in the email
              </Text>
            </View>
            <View style={styles.instruction}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>
                Your account will be activated automatically
              </Text>
            </View>

            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>💡 Tip:</Text>
              <Text style={styles.tipsText}>
                If you don't see the email, check your spam folder
              </Text>
            </View>
          </View>

          <Button
            title="Resend Verification Email"
            onPress={handleResendEmail}
            loading={resendLoading}
            variant="outline"
            style={styles.resendButton}
          />

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            style={styles.backLink}
          >
            <Text style={styles.backLinkText}>Back to Sign In</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
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
  successContainer: {
    backgroundColor: colors.success + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  successMessage: {
    color: colors.success,
    fontSize: typography.bodySmall.fontSize,
    textAlign: 'center',
    fontWeight: '600',
  },
  instructionsContainer: {
    marginBottom: spacing.lg,
  },
  instructionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    color: colors.background,
    fontSize: typography.label.fontSize,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: spacing.md,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text,
    lineHeight: 22,
  },
  tipsBox: {
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    marginBottom: spacing.lg,
  },
  tipsTitle: {
    fontSize: typography.label.fontSize,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  tipsText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  resendButton: {
    marginBottom: spacing.md,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    color: colors.accent,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
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
  },
});
