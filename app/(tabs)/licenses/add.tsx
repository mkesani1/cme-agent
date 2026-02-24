import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/hooks/useAuth';
import { Card, Button, Input } from '../../../src/components/ui';
import { colors, spacing, typography } from '../../../src/lib/theme';

// US States list
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
];

const DEGREE_TYPES = ['MD', 'DO', 'PA', 'NP', 'DDS', 'DMD', 'DVM', 'RN', 'LPN'];

interface FormState {
  state: string;
  licenseNumber: string;
  expiryDate: string;
  totalCreditsRequired: string;
  degreeType: string;
}

interface FormErrors {
  state?: string;
  licenseNumber?: string;
  expiryDate?: string;
  totalCreditsRequired?: string;
  degreeType?: string;
}

export default function AddLicenseScreen() {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>({
    state: '',
    licenseNumber: '',
    expiryDate: '',
    totalCreditsRequired: '',
    degreeType: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [degreeModalVisible, setDegreeModalVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      router.back();
    }
  }, [user]);

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!form.state) {
      newErrors.state = 'State is required';
    }

    if (!form.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!form.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const date = new Date(form.expiryDate);
      if (isNaN(date.getTime())) {
        newErrors.expiryDate = 'Invalid date format (use YYYY-MM-DD)';
      }
    }

    if (!form.totalCreditsRequired.trim()) {
      newErrors.totalCreditsRequired = 'Total credits required is required';
    } else if (isNaN(Number(form.totalCreditsRequired)) || Number(form.totalCreditsRequired) < 0) {
      newErrors.totalCreditsRequired = 'Must be a valid positive number';
    }

    if (!form.degreeType) {
      newErrors.degreeType = 'Degree type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validateForm() || !user) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('licenses')
        .insert({
          user_id: user.id,
          state: form.state,
          license_number: form.licenseNumber || null,
          expiry_date: form.expiryDate || null,
          total_credits_required: form.totalCreditsRequired ? Number(form.totalCreditsRequired) : null,
          degree_type: form.degreeType || null,
        });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      Alert.alert('Success', 'License added successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add license';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  function renderStateItem({ item }: { item: string }) {
    return (
      <TouchableOpacity
        style={styles.modalItem}
        onPress={() => {
          setForm({ ...form, state: item });
          setStateModalVisible(false);
        }}
      >
        <Text style={styles.modalItemText}>{item}</Text>
      </TouchableOpacity>
    );
  }

  function renderDegreeItem({ item }: { item: string }) {
    return (
      <TouchableOpacity
        style={styles.modalItem}
        onPress={() => {
          setForm({ ...form, degreeType: item });
          setDegreeModalVisible(false);
        }}
      >
        <Text style={styles.modalItemText}>{item}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add Medical License</Text>
          <Text style={styles.subtitle}>Enter your license details</Text>
        </View>

        <Card style={styles.formCard}>
          {/* State Selector */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>State</Text>
            <TouchableOpacity
              style={[styles.selector, errors.state && styles.selectorError]}
              onPress={() => setStateModalVisible(true)}
            >
              <Text style={[
                styles.selectorText,
                !form.state && styles.selectorPlaceholder,
              ]}>
                {form.state || 'Select a state'}
              </Text>
            </TouchableOpacity>
            {errors.state && <Text style={styles.error}>{errors.state}</Text>}
          </View>

          {/* License Number */}
          <View style={styles.fieldContainer}>
            <Input
              label="License Number"
              placeholder="Enter your license number"
              value={form.licenseNumber}
              onChangeText={(text) => setForm({ ...form, licenseNumber: text })}
              error={errors.licenseNumber}
            />
          </View>

          {/* Expiry Date */}
          <View style={styles.fieldContainer}>
            <Input
              label="Expiry Date (YYYY-MM-DD)"
              placeholder="2025-12-31"
              value={form.expiryDate}
              onChangeText={(text) => {
                // Only allow digits and dashes for YYYY-MM-DD format
                const cleaned = text.replace(/[^0-9-]/g, '');
                // Auto-insert dashes at positions 4 and 7
                let formatted = cleaned;
                if (cleaned.length >= 5 && cleaned[4] !== '-') {
                  formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                }
                if (formatted.length >= 8 && formatted[7] !== '-') {
                  formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
                }
                // Limit to 10 chars (YYYY-MM-DD)
                setForm({ ...form, expiryDate: formatted.slice(0, 10) });
              }}
              keyboardType="numeric"
              error={errors.expiryDate}
            />
          </View>

          {/* Total Credits Required */}
          <View style={styles.fieldContainer}>
            <Input
              label="Total Credits Required"
              placeholder="e.g., 40"
              value={form.totalCreditsRequired}
              onChangeText={(text) => setForm({ ...form, totalCreditsRequired: text })}
              keyboardType="number-pad"
              error={errors.totalCreditsRequired}
            />
          </View>

          {/* Degree Type */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Degree Type</Text>
            <TouchableOpacity
              style={[styles.selector, errors.degreeType && styles.selectorError]}
              onPress={() => setDegreeModalVisible(true)}
            >
              <Text style={[
                styles.selectorText,
                !form.degreeType && styles.selectorPlaceholder,
              ]}>
                {form.degreeType || 'Select degree type'}
              </Text>
            </TouchableOpacity>
            {errors.degreeType && <Text style={styles.error}>{errors.degreeType}</Text>}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              size="md"
              style={styles.button}
            />
            <Button
              title="Save License"
              onPress={handleSave}
              variant="primary"
              size="md"
              disabled={loading}
              loading={loading}
              style={styles.button}
            />
          </View>
        </Card>
      </ScrollView>

      {/* State Modal */}
      <Modal
        visible={stateModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity
                onPress={() => setStateModalVisible(false)}
              >
                <Text style={styles.closeButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={US_STATES}
              renderItem={renderStateItem}
              keyExtractor={(item) => item}
              numColumns={3}
              columnWrapperStyle={styles.gridRow}
              scrollEnabled={true}
            />
          </View>
        </View>
      </Modal>

      {/* Degree Type Modal */}
      <Modal
        visible={degreeModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Degree Type</Text>
              <TouchableOpacity
                onPress={() => setDegreeModalVisible(false)}
              >
                <Text style={styles.closeButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={DEGREE_TYPES}
              renderItem={renderDegreeItem}
              keyExtractor={(item) => item}
              scrollEnabled={true}
            />
          </View>
        </View>
      </Modal>
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
  header: {
    marginBottom: spacing.lg,
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
  },
  formCard: {
    padding: spacing.lg,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  selector: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  selectorError: {
    borderColor: colors.risk,
  },
  selectorText: {
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  selectorPlaceholder: {
    color: colors.textSecondary,
  },
  error: {
    fontSize: typography.caption.fontSize,
    color: colors.risk,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
  },
  closeButton: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.accent,
  },
  modalItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalItemText: {
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
});
