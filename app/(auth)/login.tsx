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
import { useScaleIn, useFadeInUp, useShake } from '../../src/lib/animations';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyAuthError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please verify your email address before signing in. Check your inbox for a confirmation link.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many login attempts. Please wait a minute and try again.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (msg.includes('user not found')) {
    return 'No account found with this email. Please sign up first.';
  }
  return message;
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Animations
  const logoAnim = useScaleIn(0);
  const brandAnim = useFadeInUp(200);
  const cardAnim = useFadeInUp(350);
  const linkAnim = useFadeInUp(500);
  const { shake, style: shakeStyle } = useShake();

  // Shake on error
  useEffect(() => {
    if (error) {
      shake();
    }
  }, [error]);

  async function handleLogin() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(trimmedEmail, password);

      if (signInError) {
        setError(friendlyAuthError(signInError.message));
        setLoading(false);
      } else {
        setLoading(false);
        router.replace('/');
      }
    } catch (e: any) {
      setError(friendlyAuthError(e?.message || 'Network error'));
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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Animated.View style={logoAnim}>
              <View style={styles.logo}>
                <Text style={styles.logoIcon}>◎</Text>
              </View>
            </Animated.View>
            <Animated.View style={brandAnim}>
              <Text style={styles.appName}>CME Agent</Text>
              <Text style={styles.tagline}>Your AI-powered CME compliance partner</Text>
            </Animated.View>
          </View>

          {/* Login Form */}
          <Animated.View style={cardAnim}>
            <Card style={styles.card}>
              <Text style={styles.title}>Welcome back</Text>

              {error ? (
                <Animated.View style={shakeStyle}>
                  <View style={commonStyles.errorContainer}>
                    <Text style={commonStyles.errorText}>{error}</Text>
                  </View>
                </Animated.View>
              ) : null}

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

              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                style={styles.forgotLink}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={styles.button}
              />

              <Animated.View style={[styles.registerContainer, linkAnim]}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text style={styles.registerLink}>Sign Up</Text>
                  </TouchableOpacity>
                </Link>
              </Animated.View>
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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoIcon: {
    fontSize: 36,
    color: '#FFFFFF',
  },
  appName: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  tagline: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotText: {
    color: colors.accent,
    fontSize: typography.bodySmall.fontSize,
  },
  button: {
    marginBottom: spacing.lg,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  registerLink: {
    color: colors.accent,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
});
