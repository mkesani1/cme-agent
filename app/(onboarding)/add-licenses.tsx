import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { Button, Card, Input } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/lib/theme';

interface LicenseForm {
  state: string;
  licenseNumber: string;
  expiryDate: string;
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
    { state: '', licenseNumber: '', expiryDate: '' }
  ]);
  const [loading, setLoading] = useState(false);

  function addLicense() {
    setLicenses([...licenses, { state: '', licenseNumber: '', expiryDate: '' }]);
  }

  function updateLicense(index: number, field: keyof LicenseForm, value: string) {
    const updated = [...licenses];
    updated[index][field] = value;
    setLicenses(updated);
  }

  function removeLicense(index: number) {
    if (licenses.length > 1) {
      setLicenses(licenses.filter((_, i) => i !== index));
    }
  }

  async function handleContinue() {
    const validLicenses = licenses.filter(l => l.state && l.licenseNumber);
    if (validLicenses.length === 0) {
      // Skip if no licenses entered
      router.push('/(onboarding)/add-dea');
      return;
    }

    setLoading(true);

    // Insert licenses
    for (const license of validLicenses) {
      const { data: licenseData, error: licenseError } = await supabase
        .from('licenses')
        .insert({
          user_id: user!.id,
          state: license.state,
          license_number: license.licenseNumber,
          degree_type: profile?.degree_type,
          expiry_date: license.expiryDate || null,
          total_credits_required: 50, // Default, will be customized per state
        })
        .select()
        .single();

      if (!licenseError && licenseData) {
        // Add default requirements based on state
        // This is simplified - in production, would have state-specific rules
        await supabase.from('license_requirements').insert([
          { license_id: licenseData.id, category: 'general', credits_required: 35 },
          { license_id: licenseData.id, category: 'controlled_substances', credits_required: 10 },
          { license_id: licenseData.id, category: 'risk_management', credits_required: 5 },
        ]);
      }
    }

    setLoading(false);
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
        <Text style={styles.title}>Add your licenses</Text>
        <Text style={styles.subtitle}>
          Enter your state medical licenses. You can add more later.
        </Text>

        {/* License Forms */}
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

        {/* Add Another */}
        <TouchableOpacity onPress={addLicense} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Another License</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          size="lg"
        />
        <TouchableOpacity
          onPress={() => router.push('/(onboarding)/add-dea')}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
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
