import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/hooks/useAuth';
import { Button, Card, Input } from '../../../src/components/ui';
import { colors, spacing, typography, borderRadius } from '../../../src/lib/theme';
import type { DEARegistration } from '../../../src/types/database';

interface DEAForm {
  deaNumber: string;
  expiryDate: string;
  linkedStates: string[];
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function AddDEAScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userStates, setUserStates] = useState<string[]>([]);
  const [form, setForm] = useState<DEAForm>({
    deaNumber: '',
    expiryDate: '',
    linkedStates: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [existingDea, setExistingDea] = useState<DEARegistration | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Get user's license states
      const { data: licenses } = await supabase
        .from('licenses')
        .select('state')
        .eq('user_id', user!.id);

      if (licenses) {
        const states = [...new Set(licenses.map(l => l.state))];
        setUserStates(states.sort());
      }

      // Check if DEA registration exists
      const { data: deaData } = await supabase
        .from('dea_registrations')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (deaData) {
        setExistingDea(deaData);
        setForm({
          deaNumber: deaData.dea_number,
          expiryDate: deaData.expiry_date || '',
          linkedStates: deaData.linked_states || [],
        });
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.deaNumber.trim()) {
      newErrors.deaNumber = 'DEA number is required';
    } else if (!/^[A-Z]{2}\d{7}$/.test(form.deaNumber)) {
      newErrors.deaNumber = 'Format: 2 letters + 7 digits (e.g., AB1234567)';
    }

    if (form.expiryDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.expiryDate)) {
      newErrors.expiryDate = 'Format: YYYY-MM-DD';
    }

    if (form.linkedStates.length === 0) {
      newErrors.linkedStates = 'Select at least one state';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function updateLinkedStates(state: string) {
    setForm(prev => ({
      ...prev,
      linkedStates: prev.linkedStates.includes(state)
        ? prev.linkedStates.filter(s => s !== state)
        : [...prev.linkedStates, state],
    }));
  }

  async function handleSave() {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (isEditing && existingDea) {
        // Update existing DEA registration
        const { error } = await supabase
          .from('dea_registrations')
          .update({
            dea_number: form.deaNumber.toUpperCase(),
            expiry_date: form.expiryDate || null,
            linked_states: form.linkedStates.sort(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDea.id);

        if (error) throw error;
        Alert.alert('Success', 'DEA registration updated');
      } else {
        // Create new DEA registration
        const { error } = await supabase
          .from('dea_registrations')
          .insert({
            user_id: user!.id,
            dea_number: form.deaNumber.toUpperCase(),
            expiry_date: form.expiryDate || null,
            linked_states: form.linkedStates.sort(),
          });

        if (error) throw error;
        Alert.alert('Success', 'DEA registration added');
      }

      // Navigate back to licenses list
      router.push('/(tabs)/licenses');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save DEA registration';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>
          {isEditing ? 'Edit DEA Registration' : 'Add DEA Registration'}
        </Text>
        <Text style={styles.subtitle}>
          {isEditing
            ? 'Update your DEA number and linked states'
            : 'Register your DEA number and select which states it covers'}
        </Text>

        <Card style={styles.formCard}>
          {/* DEA Number Input */}
          <Input
            label="DEA Number"
            value={form.deaNumber}
            onChangeText={(value) => {
              const formatted = value.toUpperCase();
              setForm(prev => ({ ...prev, deaNumber: formatted }));
              if (errors.deaNumber) {
                setErrors(prev => ({ ...prev, deaNumber: '' }));
              }
            }}
            placeholder="AB1234567"
            maxLength={9}
            autoCapitalize="characters"
            containerStyle={styles.input}
            error={errors.deaNumber}
          />

          {/* Expiry Date Input */}
          <Input
            label="Expiry Date (Optional)"
            value={form.expiryDate}
            onChangeText={(value) => {
              setForm(prev => ({ ...prev, expiryDate: value }));
              if (errors.expiryDate) {
                setErrors(prev => ({ ...prev, expiryDate: '' }));
              }
            }}
            placeholder="YYYY-MM-DD"
            containerStyle={styles.input}
            error={errors.expiryDate}
          />

          {/* Linked States */}
          <View style={styles.statesSection}>
            <Text style={styles.label}>
              Linked States {form.linkedStates.length > 0 && `(${form.linkedStates.length})`}
            </Text>
            <Text style={styles.statesHint}>
              {userStates.length > 0
                ? 'Select the states your DEA covers'
                : 'Add a license first to link states'}
            </Text>

            {errors.linkedStates && (
              <Text style={styles.error}>{errors.linkedStates}</Text>
            )}

            {userStates.length > 0 ? (
              <View style={styles.statesGrid}>
                {userStates.map((state) => (
                  <TouchableOpacity
                    key={state}
                    style={[
                      styles.stateCheckbox,
                      form.linkedStates.includes(state) && styles.stateCheckboxSelected,
                    ]}
                    onPress={() => updateLinkedStates(state)}
                  >
                    <View
                      style={[
                        styles.checkmark,
                        form.linkedStates.includes(state) && styles.checkmarkActive,
                      ]}
                    >
                      {form.linkedStates.includes(state) && (
                        <Text style={styles.checkmarkText}>✓</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stateLabel,
                        form.linkedStates.includes(state) && styles.stateLabelActive,
                      ]}
                    >
                      {state}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Card style={styles.emptyStatesCard}>
                <Text style={styles.emptyStatesText}>
                  You haven't added any state licenses yet. Add a license to link states to your DEA registration.
                </Text>
              </Card>
            )}
          </View>
        </Card>

        {/* Help Text */}
        <Text style={styles.helpText}>
          DEA format: 2 letters followed by 7 digits
        </Text>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={submitting ? 'Saving...' : isEditing ? 'Update' : 'Save'}
          onPress={handleSave}
          disabled={submitting}
          loading={submitting}
          size="lg"
        />
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Cancel</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    color: colors.accent,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
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
    marginBottom: spacing.lg,
  },
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  statesSection: {
    marginTop: spacing.md,
  },
  label: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text,
    marginBottom: spacing.sm,
  } as any,
  statesHint: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  error: {
    fontSize: typography.caption.fontSize,
    color: colors.risk,
    marginBottom: spacing.md,
  },
  statesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stateCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flex: 0,
    width: '48%',
  },
  stateCheckboxSelected: {
    backgroundColor: colors.accent + '15',
    borderColor: colors.accent,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkmarkActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stateLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  stateLabelActive: {
    color: colors.accent,
  },
  emptyStatesCard: {
    padding: spacing.md,
    backgroundColor: colors.sand[100],
  },
  emptyStatesText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  helpText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
});
