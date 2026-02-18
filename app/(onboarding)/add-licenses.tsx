import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { Button, Card, Input } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/lib/theme';
import { useFadeInUp } from '../../src/lib/animations';

interface StateRequirements {
  total_credits_required: number;
  renewal_cycle_years: number;
  category_requirements: { category: string; credits: number }[];
}

interface LicenseForm {
  state: string;
  licenseNumber: string;
  expiryDate: string;
  stateReqs: StateRequirements | null;
  loadingReqs: boolean;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function AddLicensesScreen() {
  const { user, profile } = useAuth();
  const [licenses, setLicenses] = useState<LicenseForm[]>([
    { state: '', licenseNumber: '', expiryDate: '', stateReqs: null, loadingReqs: false }
  ]);
  // loading state removed — navigation is instant now

  // Look up state CME requirements from the state_requirements table
  const lookupStateRequirements = useCallback(async (stateCode: string, index: number) => {
    if (stateCode.length !== 2) return;

    const degreeType = profile?.degree_type || 'MD';

    // Mark as loading
    setLicenses(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], loadingReqs: true };
      return updated;
    });

    try {
      const { data, error } = await supabase
        .from('state_requirements')
        .select('total_credits_required, renewal_cycle_years, category_requirements')
        .eq('state', stateCode.toUpperCase())
        .eq('degree_type', degreeType)
        .single();

      if (!error && data) {
        setLicenses(prev => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            stateReqs: data as StateRequirements,
            loadingReqs: false,
          };
          return updated;
        });
      } else {
        setLicenses(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], stateReqs: null, loadingReqs: false };
          return updated;
        });
      }
    } catch {
      setLicenses(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], stateReqs: null, loadingReqs: false };
        return updated;
      });
    }
  }, [profile?.degree_type]);

  // Animations
  const headerAnim = useFadeInUp(0);
  const subtitleAnim = useFadeInUp(100);
  const formAnim = useFadeInUp(200);
  const addBtnAnim = useFadeInUp(400);
  const footerAnim = useFadeInUp(500);

  function addLicense() {
    setLicenses([...licenses, { state: '', licenseNumber: '', expiryDate: '', stateReqs: null, loadingReqs: false }]);
  }

  function updateLicense(index: number, field: 'state' | 'licenseNumber' | 'expiryDate', value: string) {
    const updated = [...licenses];
    updated[index] = { ...updated[index], [field]: value };
    setLicenses(updated);

    // When state code is complete (2 chars), look up requirements
    if (field === 'state' && value.length === 2 && US_STATES.includes(value.toUpperCase())) {
      lookupStateRequirements(value.toUpperCase(), index);
    }
  }

  function removeLicense(index: number) {
    if (licenses.length > 1) {
      setLicenses(licenses.filter((_, i) => i !== index));
    }
  }

  function handleContinue() {
    const validLicenses = licenses.filter(l => l.state && l.licenseNumber);

    // Fire-and-forget: save licenses in background, don't block navigation
    if (validLicenses.length > 0 && user) {
      (async () => {
        try {
          for (const license of validLicenses) {
            // Use real state requirements if available, otherwise default to 50
            const totalCredits = license.stateReqs?.total_credits_required ?? 50;

            const { data: licenseData, error: licenseError } = await supabase
              .from('licenses')
              .insert({
                user_id: user.id,
                state: license.state,
                license_number: license.licenseNumber,
                degree_type: profile?.degree_type,
                expiry_date: license.expiryDate || null,
                total_credits_required: totalCredits,
              })
              .select()
              .single();

            if (!licenseError && licenseData) {
              // Build requirements from state data or use defaults
              const catReqs = license.stateReqs?.category_requirements;
              let requirementsToInsert: { license_id: string; category: string; credits_required: number }[];

              if (catReqs && catReqs.length > 0) {
                // Use real state category requirements
                const specificCredits = catReqs.reduce((sum, r) => sum + r.credits, 0);
                const generalCredits = Math.max(0, totalCredits - specificCredits);

                requirementsToInsert = [];
                // Always add a general category for the remaining credits
                if (generalCredits > 0) {
                  requirementsToInsert.push({
                    license_id: licenseData.id,
                    category: 'general',
                    credits_required: generalCredits,
                  });
                }
                // Add each state-specific category
                for (const req of catReqs) {
                  requirementsToInsert.push({
                    license_id: licenseData.id,
                    category: req.category,
                    credits_required: req.credits,
                  });
                }
              } else {
                // Fallback defaults
                requirementsToInsert = [
                  { license_id: licenseData.id, category: 'general', credits_required: 35 },
                  { license_id: licenseData.id, category: 'controlled_substances', credits_required: 10 },
                  { license_id: licenseData.id, category: 'risk_management', credits_required: 5 },
                ];
              }

              await supabase.from('license_requirements').insert(requirementsToInsert);
            }
          }
        } catch (err) {
          console.warn('[Onboarding] License save error:', err);
        }
      })();
    }

    // Navigate immediately
    router.push('/(onboarding)/add-dea');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Progress */}
        <View style={styles.progress}>
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        {/* Header */}
        <Animated.View style={headerAnim}>
          <Text style={styles.title}>Add your licenses</Text>
        </Animated.View>
        <Animated.View style={subtitleAnim}>
          <Text style={styles.subtitle}>
            Enter your state medical licenses. You can add more later.
          </Text>
        </Animated.View>

        {/* License Forms */}
        <Animated.View style={formAnim}>
          {licenses.map((license, index) => (
            <Card key={index} style={styles.licenseCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>License {index + 1}</Text>
                {licenses.length > 1 && (
                  <TouchableOpacity onPress={() => removeLicense(index)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Input
                label="State"
                value={license.state}
                onChangeText={(value) => updateLicense(index, 'state', value.toUpperCase())}
                placeholder="CA"
                maxLength={2}
                autoCapitalize="characters"
                containerStyle={styles.input}
              />

              {/* Show pre-populated CME requirements when state is recognized */}
              {license.loadingReqs && (
                <Text style={styles.reqsLoading}>Looking up CME requirements...</Text>
              )}
              {license.stateReqs && !license.loadingReqs && (
                <View style={styles.reqsBadge}>
                  <Text style={styles.reqsBadgeText}>
                    {license.stateReqs.total_credits_required} credits required
                    {license.stateReqs.category_requirements.length > 0 && (
                      ` (incl. ${license.stateReqs.category_requirements.map(r => `${r.credits}hr ${r.category.replace(/_/g, ' ')}`).join(', ')})`
                    )}
                  </Text>
                  <Text style={styles.reqsCycleText}>
                    {license.stateReqs.renewal_cycle_years}-year renewal cycle
                  </Text>
                </View>
              )}

              <Input
                label="License Number"
                value={license.licenseNumber}
                onChangeText={(value) => updateLicense(index, 'licenseNumber', value)}
                placeholder="MD-123456"
                containerStyle={styles.input}
              />

              <Input
                label="Expiry Date (Optional)"
                value={license.expiryDate}
                onChangeText={(value) => updateLicense(index, 'expiryDate', value)}
                placeholder="2026-12-31"
                containerStyle={styles.input}
              />
            </Card>
          ))}
        </Animated.View>

        {/* Add Another */}
        <Animated.View style={addBtnAnim}>
          <TouchableOpacity onPress={addLicense} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Another License</Text>
          </TouchableOpacity>
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
          onPress={() => router.push('/(onboarding)/add-dea')}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip for now</Text>
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
  licenseCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
  },
  removeText: {
    color: colors.risk,
    fontSize: typography.bodySmall.fontSize,
  },
  input: {
    marginBottom: spacing.md,
  },
  reqsLoading: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
    fontStyle: 'italic',
  },
  reqsBadge: {
    backgroundColor: colors.accent + '15',
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  reqsBadgeText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.accent,
    fontWeight: '600',
  },
  reqsCycleText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.sand[400],
    borderRadius: 12,
    marginTop: spacing.sm,
  },
  addButtonText: {
    color: colors.accent,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
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
