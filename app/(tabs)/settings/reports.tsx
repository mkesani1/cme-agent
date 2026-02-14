import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../src/lib/theme';

interface ReportCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  onPress: () => void;
}

function ReportCard({
  icon,
  iconColor,
  iconBg,
  title,
  description,
  onPress,
}: ReportCardProps) {
  return (
    <TouchableOpacity style={styles.reportCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.reportIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.reportContent}>
        <Text style={styles.reportTitle}>{title}</Text>
        <Text style={styles.reportDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function ReportsScreen() {
  const handleGenerateReport = (reportType: string) => {
    Alert.alert(
      'Generate Report',
      `The ${reportType} report will be generated and available for download.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            // In production, generate actual report
            Alert.alert(
              'Coming Soon',
              'Report generation will be available in a future update.'
            );
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Reports',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Active Licenses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>67%</Text>
              <Text style={styles.statLabel}>Overall Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Certificates</Text>
            </View>
          </View>

          {/* Available Reports */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AVAILABLE REPORTS</Text>
            <View style={styles.card}>
              <ReportCard
                icon="document-text"
                iconColor="#3B82F6"
                iconBg="rgba(59, 130, 246, 0.1)"
                title="CME Progress Summary"
                description="Overview of your CME credits across all licenses"
                onPress={() => handleGenerateReport('CME Progress Summary')}
              />
              <View style={styles.divider} />
              <ReportCard
                icon="calendar"
                iconColor="#22C55E"
                iconBg="rgba(34, 197, 94, 0.1)"
                title="Renewal Timeline"
                description="Upcoming deadlines and renewal requirements"
                onPress={() => handleGenerateReport('Renewal Timeline')}
              />
              <View style={styles.divider} />
              <ReportCard
                icon="ribbon"
                iconColor="#A855F7"
                iconBg="rgba(168, 85, 247, 0.1)"
                title="Certificate Inventory"
                description="List of all completed courses and certificates"
                onPress={() => handleGenerateReport('Certificate Inventory')}
              />
              <View style={styles.divider} />
              <ReportCard
                icon="analytics"
                iconColor={colors.accent}
                iconBg="rgba(196, 165, 116, 0.1)"
                title="Annual CME Report"
                description="Comprehensive yearly summary for credentialing"
                onPress={() => handleGenerateReport('Annual CME Report')}
              />
            </View>
          </View>

          {/* State-Specific Reports */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>STATE-SPECIFIC REPORTS</Text>
            <View style={styles.card}>
              <ReportCard
                icon="flag"
                iconColor="#EF4444"
                iconBg="rgba(239, 68, 68, 0.1)"
                title="Texas Medical Board Report"
                description="Formatted for TX license renewal"
                onPress={() => handleGenerateReport('Texas Medical Board')}
              />
              <View style={styles.divider} />
              <ReportCard
                icon="flag"
                iconColor="#F59E0B"
                iconBg="rgba(245, 158, 11, 0.1)"
                title="California Medical Board Report"
                description="Formatted for CA license renewal"
                onPress={() => handleGenerateReport('California Medical Board')}
              />
            </View>
          </View>

          {/* Scheduled Reports */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AUTOMATED REPORTS</Text>
            <View style={styles.automatedCard}>
              <View style={styles.automatedHeader}>
                <View style={styles.automatedIconContainer}>
                  <Ionicons name="timer-outline" size={20} color={colors.accent} />
                </View>
                <View style={styles.automatedContent}>
                  <Text style={styles.automatedTitle}>Monthly Summary</Text>
                  <Text style={styles.automatedDescription}>
                    Receive a monthly email with your CME progress
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.setupButton}
                onPress={() =>
                  Alert.alert(
                    'Coming Soon',
                    'Automated reports will be available in a future update.'
                  )
                }
              >
                <Text style={styles.setupButtonText}>Set Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={colors.textMuted} />
            <Text style={styles.infoText}>
              Reports are generated as PDF files that can be shared with your
              employer, medical board, or credentialing organization.
            </Text>
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
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.accent,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
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
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  reportIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  reportDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 68,
  },
  automatedCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  automatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  automatedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  automatedContent: {
    flex: 1,
  },
  automatedTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  automatedDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  setupButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  setupButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
