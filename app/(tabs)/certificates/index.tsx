import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/hooks/useAuth';
import { Card, Button, CategoryTag } from '../../../src/components/ui';
import { colors, spacing, typography, CMECategory } from '../../../src/lib/theme';
import { DEMO_MODE, demoCertificates } from '../../../src/lib/demoData';

interface Certificate {
  id: string;
  course_name: string;
  provider: string | null;
  credit_hours: number;
  category: CMECategory | null;
  completion_date: string;
  verified: boolean;
  certificate_url: string | null;
}

export default function CertificatesScreen() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  async function loadCertificates() {
    // Demo mode: Use mock data when no authenticated user
    if (!user && DEMO_MODE) {
      const demoCertsFormatted = demoCertificates.map(c => ({
        id: c.id,
        course_name: c.course_name,
        provider: c.provider,
        credit_hours: c.credits,
        category: c.category as CMECategory,
        completion_date: c.completion_date,
        verified: c.status === 'verified',
        certificate_url: null,
      }));
      setCertificates(demoCertsFormatted);
      setLoading(false);
      return;
    }

    // No user and not in demo mode
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const { data, error: certsError } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user!.id)
        .order('completion_date', { ascending: false });

      if (certsError) throw certsError;

      if (data) {
        setCertificates(data as Certificate[]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load certificates';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadCertificates();
    setRefreshing(false);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Group certificates by month
  const groupedCertificates = certificates.reduce((groups, cert) => {
    const date = new Date(cert.completion_date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(cert);
    return groups;
  }, {} as Record<string, Certificate[]>);

  const totalCredits = certificates.reduce((sum, cert) => sum + cert.credit_hours, 0);

  if (loading && certificates.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading certificates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Certificates</Text>
            <Text style={styles.subtitle}>
              {certificates.length} certificates • {totalCredits} total credits
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/certificates/upload')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Error State */}
        {error && (
          <Card style={[styles.errorCard]}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Failed to load certificates</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadCertificates}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/certificates/upload')}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionText}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionText}>Sync</Text>
          </TouchableOpacity>
        </View>

        {/* Certificates List */}
        {certificates.length === 0 && !loading ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyTitle}>No certificates yet</Text>
            <Text style={styles.emptyText}>
              Upload your CME certificates to track your credits
            </Text>
            <Button
              title="Upload Certificate"
              onPress={() => router.push('/(tabs)/certificates/upload')}
              size="sm"
            />
          </Card>
        ) : (
          Object.entries(groupedCertificates).map(([monthYear, certs]) => (
            <View key={monthYear} style={styles.monthGroup}>
              <Text style={styles.monthTitle}>{monthYear}</Text>
              {certs.map((cert) => (
                <Card key={cert.id} style={styles.certCard}>
                  <View style={styles.certHeader}>
                    <View style={styles.certInfo}>
                      <Text style={styles.certName}>{cert.course_name}</Text>
                      <Text style={styles.certProvider}>
                        {cert.provider || 'Unknown provider'}
                      </Text>
                    </View>
                    <View style={styles.certCredits}>
                      <Text style={styles.creditsNumber}>{cert.credit_hours}</Text>
                      <Text style={styles.creditsLabel}>hrs</Text>
                    </View>
                  </View>

                  <View style={styles.certFooter}>
                    <View style={styles.certMeta}>
                      {cert.category && (
                        <CategoryTag category={cert.category} size="sm" />
                      )}
                      {cert.verified && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedText}>✓ Verified</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.certDate}>
                      {formatDate(cert.completion_date)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          ))
        )}

        {/* Connected Providers */}
        <View style={styles.providersSection}>
          <Text style={styles.sectionTitle}>Connected Providers</Text>
          <Card style={styles.providerCard}>
            <View style={styles.providerRow}>
              <Text style={styles.providerIcon}>🏥</Text>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>AMA Ed Hub</Text>
                <Text style={styles.providerStatus}>Not connected</Text>
              </View>
              <TouchableOpacity style={styles.connectButton}>
                <Text style={styles.connectText}>Connect</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <View style={styles.providerRow}>
              <Text style={styles.providerIcon}>🏥</Text>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>AAFP CME</Text>
                <Text style={styles.providerStatus}>Not connected</Text>
              </View>
              <TouchableOpacity style={styles.connectButton}>
                <Text style={styles.connectText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
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
    padding: spacing.lg,
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
  errorCard: {
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.risk,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.risk,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: typography.bodySmall.fontSize,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: typography.caption.fontSize,
    color: colors.text,
    fontWeight: '500',
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  monthGroup: {
    marginBottom: spacing.lg,
  },
  monthTitle: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  certCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  certInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  certName: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  certProvider: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  certCredits: {
    alignItems: 'center',
    backgroundColor: colors.accent + '15',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  creditsNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  creditsLabel: {
    fontSize: 9,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  certFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  verifiedBadge: {
    backgroundColor: colors.successLight + '30',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  verifiedText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '600',
  },
  certDate: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  providersSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  providerCard: {
    padding: 0,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  providerIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.text,
  },
  providerStatus: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  connectButton: {
    backgroundColor: colors.accent + '15',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
  },
  connectText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 52,
  },
});
