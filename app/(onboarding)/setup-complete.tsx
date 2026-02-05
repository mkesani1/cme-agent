import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { Button, Card, ProgressBar, CategoryTag } from '../../src/components/ui';
import { colors, spacing, typography, CMECategory } from '../../src/lib/theme';

interface LicenseSummary {
  state: string;
  licenseNumber: string;
  totalRequired: number | null;
  requirements: {
    category: CMECategory;
    required: number;
  }[];
}

export default function SetupCompleteScreen() {
  const { user, profile } = useAuth();
  const [licenses, setLicenses] = useState<LicenseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLicenses();
  }, []);

  async function loadLicenses() {
    const { data: licensesData } = await supabase
      .from('licenses')
      .select(`
        state,
        license_number,
        total_credits_required,
        license_requirements (
          category,
          credits_required
        )
      `)
      .eq('user_id', user!.id);

    if (licensesData) {
      const summaries: LicenseSummary[] = licensesData.map(l => ({
        state: l.state,
        licenseNumber: l.license_number || '',
        totalRequired: l.total_credits_required,
        requirements: (l.license_requirements || []).map(r => ({
          category: r.category as CMECategory,
          required: r.credits_required,
        })),
      }));
      setLicenses(summaries);
    }
    setLoading(false);
  }

  function goToDashboard() {
    router.replace('/(tabs)');
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progress}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressActive]} />
        </View>

        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✓</Text>
        </View>

        {/* Header */}
        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>
          Your CME Agent is ready to help you stay compliant
        </Text>

        {/* Summary */}
        {licenses.length > 0 ? (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Your Licenses</Text>
            {licenses.map((license, index) => (
              <Card key={index} style={styles.licenseCard}>
                <View style={styles.licenseHeader}>
                  <Text style={styles.licenseState}>{license.state}</Text>
                  <Text style={styles.licenseNumber}>#{license.licenseNumber}</Text>
                </View>

                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>Requirements:</Text>
                  <View style={styles.categories}>
                    {license.requirements.map((req, i) => (
                      <View key={i} style={styles.categoryRow}>
                        <CategoryTag category={req.category} size="sm" />
                        <Text style={styles.categoryCredits}>{req.required} hrs</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <ProgressBar
                  progress={0}
                  label={`0/${license.totalRequired ?? 0} credits`}
                  showPercentage
                  size="md"
                />
              </Card>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No licenses added yet. You can add them from the dashboard.
            </Text>
          </Card>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Go to Dashboard"
          onPress={goToDashboard}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
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
    backgroundColor: colors.success,
    width: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  successEmoji: {
    fontSize: 36,
    color: '#FFFFFF',
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  summary: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
    marginBottom: spacing.md,
  },
  licenseCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  licenseState: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text,
  },
  licenseNumber: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  requirementsContainer: {
    marginBottom: spacing.md,
  },
  requirementsTitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryCredits: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
