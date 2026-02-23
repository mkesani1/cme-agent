import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { colors, spacing, typography } from '../../../src/lib/theme';
import { useAuth } from '../../../src/hooks/useAuth';
import { supabase } from '../../../src/lib/supabase';

interface ExportOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  format: string;
  onPress: () => void;
  isLoading?: boolean;
}

function ExportOption({
  icon,
  title,
  description,
  format,
  onPress,
  isLoading,
}: ExportOptionProps) {
  return (
    <TouchableOpacity
      style={styles.exportOption}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={colors.accent} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <View style={styles.formatBadge}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <Text style={styles.formatText}>{format}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ExportDataScreen() {
  const { profile } = useAuth();
  const [isExportingLicenses, setIsExportingLicenses] = useState(false);
  const [isExportingCertificates, setIsExportingCertificates] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);

  const handleExportLicenses = async () => {
    setIsExportingLicenses(true);
    try {
      if (!profile?.id) {
        Alert.alert('Error', 'User profile not loaded');
        return;
      }

      // Fetch licenses from Supabase
      const { data: licenses, error } = await supabase
        .from('licenses')
        .select('*, license_requirements(*)')
        .eq('user_id', profile.id);

      if (error) throw error;

      // Calculate credits for each license
      const licensesData = (licenses || []).map(license => {
        const totalRequired = license.license_requirements?.reduce((sum, req) => sum + (req.credits_required || 0), 0) || 0;
        return {
          state: license.state,
          licenseNumber: license.license_number,
          expirationDate: license.expiry_date,
          creditsRequired: totalRequired,
          creditsCompleted: license.total_credits_required || 0,
        };
      });

      const exportData = {
        exportDate: new Date().toISOString(),
        user: profile.full_name,
        licenses: licensesData,
      };

      const filename = `cme_licenses_${Date.now()}.json`;
      const path = (FileSystem.documentDirectory || '') + filename;
      await FileSystem.writeAsStringAsync(path, JSON.stringify(exportData, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      } else {
        Alert.alert('Success', `Data exported to ${filename}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export license data');
    } finally {
      setIsExportingLicenses(false);
    }
  };

  const handleExportCertificates = async () => {
    setIsExportingCertificates(true);
    try {
      if (!profile?.id) {
        Alert.alert('Error', 'User profile not loaded');
        return;
      }

      // Fetch certificates from Supabase
      const { data: certificates, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', profile.id)
        .order('completion_date', { ascending: false });

      if (error) throw error;

      const certificatesData = (certificates || []).map(cert => ({
        courseName: cert.course_name,
        provider: cert.provider,
        completionDate: cert.completion_date,
        credits: cert.credit_hours,
        creditType: cert.category,
        verified: cert.verified,
      }));

      const exportData = {
        exportDate: new Date().toISOString(),
        user: profile.full_name,
        certificates: certificatesData,
      };

      const filename = `cme_certificates_${Date.now()}.json`;
      const path = (FileSystem.documentDirectory || '') + filename;
      await FileSystem.writeAsStringAsync(path, JSON.stringify(exportData, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      } else {
        Alert.alert('Success', `Data exported to ${filename}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export certificate data');
    } finally {
      setIsExportingCertificates(false);
    }
  };

  const handleExportAll = async () => {
    setIsExportingAll(true);
    try {
      if (!profile?.id) {
        Alert.alert('Error', 'User profile not loaded');
        return;
      }

      // Fetch licenses
      const { data: licenses } = await supabase
        .from('licenses')
        .select('*, license_requirements(*)')
        .eq('user_id', profile.id);

      // Fetch certificates
      const { data: certificates } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', profile.id)
        .order('completion_date', { ascending: false });

      // Fetch credit allocations for overview
      const { data: allocations } = await supabase
        .from('credit_allocations')
        .select('*');

      // Format licenses data
      const licensesData = (licenses || []).map(license => {
        const totalRequired = license.license_requirements?.reduce((sum, req) => sum + (req.credits_required || 0), 0) || 0;
        return {
          state: license.state,
          licenseNumber: license.license_number,
          expirationDate: license.expiry_date,
          creditsRequired: totalRequired,
          creditsCompleted: license.total_credits_required || 0,
        };
      });

      // Format certificates data
      const certificatesData = (certificates || []).map(cert => ({
        courseName: cert.course_name,
        provider: cert.provider,
        completionDate: cert.completion_date,
        credits: cert.credit_hours,
        creditType: cert.category,
        verified: cert.verified,
      }));

      // Format allocations summary
      const allocationsData = (allocations || []).map(alloc => ({
        certificateId: alloc.certificate_id,
        licenseId: alloc.license_id,
        creditsApplied: alloc.credits_applied,
        allocationDate: alloc.created_at,
      }));

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          name: profile.full_name,
          degreeType: profile.degree_type,
        },
        licenses: licensesData,
        certificates: certificatesData,
        creditAllocations: allocationsData,
      };

      const filename = `cme_agent_export_${Date.now()}.json`;
      const path = (FileSystem.documentDirectory || '') + filename;
      await FileSystem.writeAsStringAsync(path, JSON.stringify(exportData, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      } else {
        Alert.alert('Success', `Data exported to ${filename}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleGeneratePDF = () => {
    Alert.alert(
      'Coming Soon',
      'PDF report generation will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Export Data',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Export Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPORT DATA</Text>
            <View style={styles.card}>
              <ExportOption
                icon="document-text"
                title="Export Licenses"
                description="Download all your license information"
                format="JSON"
                onPress={handleExportLicenses}
                isLoading={isExportingLicenses}
              />
              <View style={styles.divider} />
              <ExportOption
                icon="ribbon"
                title="Export Certificates"
                description="Download all your CME certificates"
                format="JSON"
                onPress={handleExportCertificates}
                isLoading={isExportingCertificates}
              />
              <View style={styles.divider} />
              <ExportOption
                icon="cloud-download"
                title="Export All Data"
                description="Complete backup of all your data"
                format="JSON"
                onPress={handleExportAll}
                isLoading={isExportingAll}
              />
            </View>
          </View>

          {/* Reports */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>REPORTS</Text>
            <View style={styles.card}>
              <ExportOption
                icon="document"
                title="Generate CME Report"
                description="Create a PDF summary for your employer or board"
                format="PDF"
                onPress={handleGeneratePDF}
              />
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Your data belongs to you</Text>
              <Text style={styles.infoText}>
                You can export and download all your data at any time. Files are
                created locally and are not stored on our servers.
              </Text>
            </View>
          </View>

          {/* Data Retention */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() =>
                Alert.alert(
                  'Delete Account',
                  'This will permanently delete your account and all associated data. This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete Account',
                      style: 'destructive',
                      onPress: () =>
                        Alert.alert(
                          'Contact Support',
                          'Please contact support@cmeagent.com to request account deletion.'
                        ),
                    },
                  ]
                )
              }
            >
              <Ionicons name="trash-outline" size={20} color={colors.risk} />
              <Text style={styles.dangerButtonText}>Request Account Deletion</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  formatBadge: {
    backgroundColor: colors.backgroundElevated,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    minWidth: 48,
    alignItems: 'center',
  },
  formatText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 68,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.risk,
  },
});
