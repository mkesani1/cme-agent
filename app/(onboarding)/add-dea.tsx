import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { Button, Card, Input } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/lib/theme';
import { useFadeInUp } from '../../src/lib/animations';

export default function AddDEAScreen() {
  const { user } = useAuth();
  const [deaNumber, setDeaNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [skipDEA, setSkipDEA] = useState(false);

  // Animations
  const headerAnim = useFadeInUp(0);
  const cardAnim = useFadeInUp(200);
  const infoAnim = useFadeInUp(400);
  const footerAnim = useFadeInUp(500);

  function handleContinue() {
    // Fire-and-forget: save DEA in background, don't block navigation
    if (deaNumber && user) {
      (async () => {
        try {
          const { data: licenses } = await supabase
            .from('licenses')
            .select('state')
            .eq('user_id', user.id);

          const linkedStates = licenses?.map((l: any) => l.state) || [];

          await supabase.from('dea_registrations').insert({
            user_id: user.id,
            dea_number: deaNumber,
            expiry_date: expiryDate || null,
            linked_states: linkedStates,
          });
        } catch (err) {
          console.warn('[Onboarding] DEA save error:', err);
        }
      })();
    }

    // Navigate immediately
    router.push('/(onboarding)/setup-complete');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Progress */}
        <View style={styles.progress}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressActive]} />
          <View style={styles.progressDot} />
        </View>

        {/* Header */}
        <Animated.View style={headerAnim}>
          <Text style={styles.title}>DEA Registration</Text>
          <Text style={styles.subtitle}>
            Add your DEA registration for controlled substances tracking
          </Text>
        </Animated.View>

        {/* DEA Form */}
        <Animated.View style={cardAnim}>
          <Card style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="medkit" size={32} color={colors.accent} />
            </View>

            <Input
              label="DEA Number"
              value={deaNumber}
              onChangeText={setDeaNumber}
              placeholder="AB1234567"
              autoCapitalize="characters"
              containerStyle={styles.input}
            />

            <Input
              label="Expiry Date (Optional)"
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="2027-06-30"
              containerStyle={styles.input}
            />
          </Card>
        </Animated.View>

        {/* Info Box */}
        <Animated.View style={infoAnim}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Why add your DEA?</Text>
            <Text style={styles.infoText}>
              Many states require controlled substances CME credits tied to your DEA registration.
              Adding it helps us track these requirements automatically.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <Animated.View style={[styles.footer, footerAnim]}>
        <Button
          title="Continue"
          onPress={handleContinue}
          size="lg"
        />
        <TouchableOpacity
          onPress={() => {
            setSkipDEA(true);
            router.push('/(onboarding)/setup-complete');
          }}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>I don't have a DEA registration</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sand[300],
  },
  progressActive: {
    backgroundColor: colors.accent,
    width: 24,
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
    marginBottom: spacing.xl,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 48,
  },
  input: {
    marginBottom: spacing.md,
  },
  infoBox: {
    backgroundColor: colors.sand[200],
    padding: spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  infoTitle: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
});
