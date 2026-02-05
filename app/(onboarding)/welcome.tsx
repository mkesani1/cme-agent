import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/lib/theme';

const features = [
  { icon: '📋', text: 'Track all your state licenses in one place' },
  { icon: '🔄', text: 'Auto-sync certificates from CME providers' },
  { icon: '🤖', text: 'AI agent to guide your compliance' },
  { icon: '⏰', text: 'Never miss a deadline again' },
];

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>◎</Text>
          </View>
          <Text style={styles.appName}>CME Agent</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Your AI-powered CME compliance partner
        </Text>

        {/* Features */}
        <View style={styles.features}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={() => router.push('/(onboarding)/degree-select')}
          size="lg"
        />
        <Text style={styles.footerText}>
          Takes less than 2 minutes to set up
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoIcon: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  tagline: {
    fontSize: typography.h3.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  features: {
    gap: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: typography.body.fontSize,
    color: colors.text,
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footerText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
