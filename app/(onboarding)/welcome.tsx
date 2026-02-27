import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/lib/theme';
import { useScaleIn, useFadeInUp, useStaggeredList } from '../../src/lib/animations';

type IconName = keyof typeof Ionicons.glyphMap;

const features: { icon: IconName; text: string }[] = [
  { icon: 'document-text-outline', text: 'Track all your state licenses in one place' },
  { icon: 'sync-outline', text: 'Auto-sync certificates from CME providers' },
  { icon: 'sparkles-outline', text: 'AI agent to guide your compliance' },
  { icon: 'alarm-outline', text: 'Never miss a deadline again' },
];

export default function WelcomeScreen() {
  const logoAnim = useScaleIn(0);
  const appNameAnim = useFadeInUp(200);
  const taglineAnim = useFadeInUp(350);
  const featureAnims = useStaggeredList(features.length, 500);
  const ctaAnim = useFadeInUp(900);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Animated.View style={logoAnim}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
            />
          </Animated.View>
          <Animated.View style={appNameAnim}>
            <Text style={styles.appName}>CME Agent</Text>
          </Animated.View>
        </View>

        {/* Tagline */}
        <Animated.View style={taglineAnim}>
          <Text style={styles.tagline}>
            Your AI-powered CME compliance partner
          </Text>
        </Animated.View>

        {/* Features */}
        <View style={styles.features}>
          {features.map((feature, index) => (
            <Animated.View key={index} style={featureAnims[index]}>
              <View style={styles.featureRow}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={22} color={colors.accent} />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <Animated.View style={[styles.footer, ctaAnim]}>
        <Button
          title="Get Started"
          onPress={() => router.push('/(onboarding)/degree-select')}
          size="lg"
        />
        <Text style={styles.footerText}>
          Takes less than 2 minutes to set up
        </Text>
      </Animated.View>
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
    borderRadius: 20,
    marginBottom: spacing.md,
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
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
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
