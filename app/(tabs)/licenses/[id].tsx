import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/hooks/useAuth';
import { Card, ProgressBar, CategoryTag, Button } from '../../../src/components/ui';
import { colors, spacing, typography, CMECategory, cmeCategories } from '../../../src/lib/theme';
import { getStateName, DEMO_MODE, demoLicenses, demoCertificates } from '../../../src/lib/demoData';

interface Requirement {
  id: string;
  category: CMECategory;
  credits_required: number;
  due_date: string | null;
  credits_earned: number;
}

interface LicenseDetail {
  id: string;
  state: string;
  license_number: string | null;
  degree_type: string | null;
  expiry_date: string | null;
  total_credits_required: number | null;
  requirements: Requirement[];
  total_earned: number;
}

interface Certificate {
  id: string;
  course_name: string;
  provider: string | null;
  credit_hours: number;
  category: CMECategory | null;
  completion_date: string;
}

export default function LicenseDetailScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { user } = useAuth();
  const [license, setLicense] = useState<LicenseDetail | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadLicense();
  }, [id, user]);

  async function loadLicense() {
    if (!id) return;

    // Demo mode fallback - use demo data when no user authenticated
    if (!user && DEMO_MODE) {
      const demoLicense = demoLicenses.find(l => l.id === id);
      if (demoLicense) {
        setLicense({
          id: demoLicense.id,
          state: demoLicense.state,
          license_number: demoLicense.license_number,
          degree_type: 'MD',
          expiry_date: demoLicense.expiry_date,
          total_credits_required: demoLicense.total_credits_required,
          requirements: demoLicense.requirements.map(r => ({
            id: r.id,
            category: r.category as CMECategory,
            credits_required: r.required,
            due_date: null,
            credits_earned: r.earned,
          })),
          total_earned: demoLicense.creditsEarned,
        });
        // Get related demo certificates
        setCertificates(demoCertificates.map(c => ({
          id: c.id,
          course_name: c.course_name,
          provider: c.provider,
          credit_hours: c.credits,
          category: c.category as CMECategory,
          completion_date: c.completion_date,
        })));
      } else {
        setError('License not found');
      }
      setLoading(false);
      return;
    }

    // Real data fetch when user is authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Get license details with wildcard relationship syntax for better compatibility
      const { data: licenseData, error: licenseError } = await supabase
        .from('licenses')
        .select(`
          id,
          state,
          license_number,
          degree_type,
          expiry_date,
          total_credits_required,
          license_requirements (*)
        `)
        .eq('id', id)
        .single();

      if (licenseError) throw licenseError;

      if (!licenseData) {
        setError('License not found');
        setLoading(false);
        return;
      }

      // Get allocations for this license
      const { data: allocations, error: allocError } = await supabase
        .from('credit_allocations')
        .select('requirement_id, credits_applied, certificate_id')
        .eq('license_id', id);

      if (allocError) throw allocError;

      // Calculate per-requirement earned credits
      const reqEarnedMap = new Map<string, number>();
      let totalEarned = 0;
      const certIds: string[] = [];

      allocations?.forEach(a => {
        const current = reqEarnedMap.get(a.requirement_id || '') || 0;
        reqEarnedMap.set(a.requirement_id || '', current + a.credits_applied);
        totalEarned += a.credits_applied;
        if (!certIds.includes(a.certificate_id)) {
          certIds.push(a.certificate_id);
        }
      });

      // Get certificates
      if (certIds.length > 0) {
        const { data: certsData, error: certsError } = await supabase
          .from('certificates')
          .select('id, course_name, provider, credit_hours, category, completion_date')
          .in('id', certIds)
          .order('completion_date', { ascending: false });

        if (certsError) throw certsError;

        if (certsData) {
          setCertificates(certsData as Certificate[]);
        }
      }

      setLicense({
        ...licenseData,
        requirements: (licenseData.license_requirements || []).map(r => ({
          id: r.id,
          category: r.category as CMECategory,
          credits_required: r.credits_required,
          due_date: r.due_date,
          credits_earned: reqEarnedMap.get(r.id) || 0,
        })),
        total_earned: totalEarned,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load license details';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getDaysUntil(dateStr: string | null) {
    if (!dateStr) return null;
    return Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading license details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !license) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.risk} style={styles.errorIconStyle} />
          <Text style={styles.errorTitle}>Unable to load</Text>
          <Text style={styles.errorText}>{error || 'License not found'}</Text>
          <View style={styles.errorActions}>
            <Button title="Go Back" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const totalRequired = license.total_credits_required ?? 0;
  const overallProgress = totalRequired > 0
    ? (license.total_earned / totalRequired) * 100
    : 0;
  const daysUntil = getDaysUntil(license.expiry_date);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.stateName}>{getStateName(license.state)} License</Text>
              <Text style={styles.licenseNumber}>
                License #{license.license_number || 'N/A'}
              </Text>
            </View>
            <View style={styles.degreeBadge}>
              <Text style={styles.degreeText}>{license.degree_type}</Text>
            </View>
          </View>

          <View style={styles.expiryRow}>
            <Text style={styles.expiryLabel}>Expires:</Text>
            <Text style={[
              styles.expiryValue,
              daysUntil !== null && daysUntil <= 90 && styles.expiryUrgent
            ]}>
              {formatDate(license.expiry_date)}
              {daysUntil !== null && ` (${daysUntil} days)`}
            </Text>
          </View>

          <View style={styles.overallProgress}>
            <ProgressBar
              progress={overallProgress}
              size="lg"
              showPercentage
            />
            <Text style={styles.creditsLabel}>
              {license.total_earned} of {totalRequired} credits completed
            </Text>
          </View>
        </Card>

        {/* Requirements Section — "16/40 format" per Dr. Chandrasekhar */}
        <Text style={styles.sectionTitle}>
          Category Requirements · {license.expiry_date ? new Date(license.expiry_date).getFullYear() : ''} Renewal
        </Text>

        {license.requirements.map((req) => {
          const progress = req.credits_required > 0
            ? (req.credits_earned / req.credits_required) * 100
            : 0;
          const isComplete = progress >= 100;
          const categoryInfo = cmeCategories[req.category];

          return (
            <Card key={req.id} style={styles.requirementCard}>
              <View style={styles.reqHeader}>
                <CategoryTag category={req.category} />
                {isComplete ? (
                  <View style={styles.completeBadge}>
                    <Ionicons name="checkmark" size={12} color={colors.success} style={{ marginRight: 2 }} />
                    <Text style={styles.completeText}>Complete</Text>
                  </View>
                ) : (
                  <Text style={styles.reqNeeded}>
                    {req.credits_required - req.credits_earned} hrs needed
                  </Text>
                )}
              </View>

              <ProgressBar
                progress={progress}
                size="md"
                color={categoryInfo.color}
                style={styles.reqProgress}
              />

              <View style={styles.reqFooter}>
                <Text style={styles.reqCredits}>
                  {req.credits_earned}/{req.credits_required} completed for {license.expiry_date ? new Date(license.expiry_date).getFullYear() : 'this'} renewal
                </Text>
                {req.due_date && (
                  <Text style={styles.reqDue}>
                    Due: {formatDate(req.due_date)}
                  </Text>
                )}
              </View>
            </Card>
          );
        })}

        {/* Find Courses CTA */}
        <TouchableOpacity
          style={styles.findCoursesButton}
          onPress={() => router.push('/(tabs)/courses')}
        >
          <Text style={styles.findCoursesIcon}>📚</Text>
          <View style={styles.findCoursesText}>
            <Text style={styles.findCoursesTitle}>Find Courses</Text>
            <Text style={styles.findCoursesSubtitle}>
              Discover CME courses that match your requirements
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Applied Certificates */}
        {certificates.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Applied Certificates</Text>
            {certificates.map((cert) => (
              <Card key={cert.id} style={styles.certCard}>
                <View style={styles.certHeader}>
                  <Text style={styles.certName}>{cert.course_name}</Text>
                  <Text style={styles.certHours}>{cert.credit_hours} hrs</Text>
                </View>
                <View style={styles.certFooter}>
                  {cert.category && (
                    <CategoryTag category={cert.category} size="sm" />
                  )}
                  <Text style={styles.certDate}>
                    {formatDate(cert.completion_date)}
                  </Text>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
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
    padding: spacing.lg,
  },
  loadingText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorIconStyle: {
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorActions: {
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backText: {
    color: colors.accent,
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  headerCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stateName: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
  },
  licenseNumber: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  degreeBadge: {
    backgroundColor: colors.accent + '20',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  degreeText: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  expiryRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  expiryLabel: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  expiryValue: {
    fontSize: typography.body.fontSize,
    color: colors.text,
    fontWeight: '500',
  },
  expiryUrgent: {
    color: colors.warning,
  },
  overallProgress: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  creditsLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  requirementCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  completeBadge: {
    backgroundColor: colors.successLight + '30',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  completeText: {
    color: colors.success,
    fontWeight: '600',
    fontSize: 11,
  },
  reqNeeded: {
    fontSize: typography.caption.fontSize,
    color: colors.warning,
    fontWeight: '500',
  },
  reqProgress: {
    marginBottom: spacing.sm,
  },
  reqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reqCredits: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  reqDue: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  findCoursesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '10',
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  findCoursesIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  findCoursesText: {
    flex: 1,
  },
  findCoursesTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  findCoursesSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: colors.accent,
  },
  certCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  certName: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  certHours: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.accent,
    fontWeight: '600',
  },
  certFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certDate: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
});
