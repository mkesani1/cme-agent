import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/hooks/useAuth';
import { supabase } from '../../../src/lib/supabase';
import { colors, spacing, typography, degreeTypes } from '../../../src/lib/theme';

const DEGREE_OPTIONS = Object.entries(degreeTypes).map(([key, label]) => ({
  key,
  label,
}));

const SPECIALTY_OPTIONS = [
  'Internal Medicine',
  'Family Medicine',
  'Pediatrics',
  'Emergency Medicine',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Psychiatry',
  'Oncology',
  'Anesthesiology',
  'Radiology',
  'Surgery',
  'OB/GYN',
  'Orthopedics',
  'Other',
];

export default function EditProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [degreeType, setDegreeType] = useState(profile?.degree_type || '');
  const [specialty, setSpecialty] = useState(profile?.specialty || '');
  const [npiNumber, setNpiNumber] = useState(profile?.npi_number || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDegreeModal, setShowDegreeModal] = useState(false);
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDegreeType(profile.degree_type || '');
      setSpecialty(profile.specialty || '');
      setNpiNumber(profile.npi_number || '');
    }
  }, [profile]);

  async function handleSave() {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          degree_type: degreeType || null,
          specialty: specialty || null,
          npi_number: npiNumber || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile?.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {fullName
                    ?.split(' ')
                    .map((n) => n.charAt(0))
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || '?'}
                </Text>
              </View>
              <TouchableOpacity style={styles.changePhotoButton}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Degree Type</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowDegreeModal(true)}
                >
                  <Text style={degreeType ? styles.selectText : styles.selectPlaceholder}>
                    {degreeType ? degreeTypes[degreeType as keyof typeof degreeTypes] : 'Select degree type'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Specialty</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowSpecialtyModal(true)}
                >
                  <Text style={specialty ? styles.selectText : styles.selectPlaceholder}>
                    {specialty || 'Select specialty'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>NPI Number</Text>
                <TextInput
                  style={styles.input}
                  value={npiNumber}
                  onChangeText={setNpiNumber}
                  placeholder="Enter your NPI number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <Text style={styles.hint}>
                  Your 10-digit National Provider Identifier
                </Text>
              </View>
            </View>

            {/* Email (Read-only) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ACCOUNT</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.input, styles.inputDisabled]}>
                  <Text style={styles.disabledText}>{profile?.email || 'Not set'}</Text>
                </View>
                <Text style={styles.hint}>Contact support to change your email</Text>
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Degree Modal */}
        {showDegreeModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Degree Type</Text>
                <TouchableOpacity onPress={() => setShowDegreeModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalContent}>
                {DEGREE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.modalOption,
                      degreeType === option.key && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      setDegreeType(option.key);
                      setShowDegreeModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        degreeType === option.key && styles.modalOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {degreeType === option.key && (
                      <Ionicons name="checkmark" size={20} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Specialty Modal */}
        {showSpecialtyModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Specialty</Text>
                <TouchableOpacity onPress={() => setShowSpecialtyModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalContent}>
                {SPECIALTY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.modalOption,
                      specialty === option && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      setSpecialty(option);
                      setShowSpecialtyModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        specialty === option && styles.modalOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {specialty === option && (
                      <Ionicons name="checkmark" size={20} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changePhotoButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  changePhotoText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  inputDisabled: {
    backgroundColor: colors.backgroundElevated,
  },
  disabledText: {
    ...typography.body,
    color: colors.textMuted,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  selectText: {
    ...typography.body,
    color: colors.text,
  },
  selectPlaceholder: {
    ...typography.body,
    color: colors.textMuted,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalContent: {
    padding: spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  modalOptionSelected: {
    backgroundColor: colors.backgroundElevated,
  },
  modalOptionText: {
    ...typography.body,
    color: colors.text,
  },
  modalOptionTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
