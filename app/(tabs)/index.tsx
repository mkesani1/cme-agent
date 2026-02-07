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
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { Card, ProgressBar, CategoryTag, SmartSuggestions, AISuggestion } from '../../src/components/ui';
import { colors, spacing, typography, CMECategory } from '../../src/lib/theme';
import { DEMO_MODE, demoProfile, getDemoLicensesFormatted } from '../../src/lib/demoData';
import { useFadeInUp, usePulseGlow } from '../../src/lib/animations';

interface LicenseWithProgress {
  id: string;
  state: string;
  licenseNumber: string;
  expiryDate: string | null;
  totalRequired: number | null;
  creditsEarned: number;
  requirements: {
    id: string;
    category: CMECategory;
    required: number;
    earned: number;
  }[];
}

// AI-powered course suggestions based on user's requirements
const mockAISuggestions: AISuggestion[] = [
  {
    id: 'ai-1',
    title: 'Advanced Pain Management & Opioid Prescribing',
    provider: 'Stanford Medicine',
    hours: 12,
    categories: ['Pain Mgmt', 'Ctrl Subst'],
    efficiencyScore: 92,
    insight: 'Completes 2 requirements in one course - your best efficiency match',
  },
  {
    id: 'ai-2',
    title: 'Medical Ethics in Modern Practice',
    provider: 'Harvard Medical',
    hours: 6,
    categories: ['Ethics', 'Risk Mgmt'],
    efficiencyScore: 88,
    insight: 'Covers your incomplete Ethics requirement with 2 hours to spare',
  },
  {
    id: 'ai-3',
    title: 'Clinical Risk Assessment Strategies',
    provider: 'Mayo Clinic',
    hours: 5,
    categories: ['Risk Mgmt'],
    efficiencyScore: 85,
    insight: 'Exactly matches your remaining Risk Management credits needed',
  },
];

export default function DashboardScreen() {
  const { user, profile } = useAuth();
  const [licenses, setLicenses] = useState<LicenseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animations
  const headerAnim = useFadeInUp(0);
  const glowOpacity = usePulseGlow();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    // Demo mode: Use mock data when no authenticated user
    if (!user && DEMO_MODE) {
      const demoLicenses = getDemoLicensesFormatted();
      const withProgress: LicenseWithProgress[] = demoLicenses.map(l => ({
        id: l.id,
        state: l.state,
        licenseNumber: l.license_number,
        expiryDate: l.expiry_date,
        totalRequired: l.total_credits_required,
        creditsEarned: l.creditsEarned,
        requirements: l.requirements.map(r => ({
          id: r.id,
          category: r.category as CMECategory,
          required: r.required,
          earned: r.earned,
        })),
      }));
      setLicenses(withProgress);
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

      const { data: licensesData, error: licensesError } = await supabase
        .from('licenses')
        .select(`
          id,
          state,
          license_number,
          expiry_date,
          total_credits_required,
          license_requirements (
            id,
            category,
            credits_required
          )
        `)
        .eq('user_id', user!.id);

      if (licensesError) throw licensesError;

      // Get certificates and allocations to calculate earned credits
      const { data: allocations, error: allocError } = await supabase
        .from('credit_allocations')
        .select('license_id, requirement_id, credits_applied')
        .in('license_id', licensesData?.map(l => l.id) || []);

      if (allocError) throw allocError;

      const allocationMap = new Map<string, number>();
      const reqAllocationMap = new Map<string, number>();

      allocations?.forEach(a => {
        const current = allocationMap.get(a.license_id) || 0;
        allocationMap.set(a.license_id, current + a.credits_applied);

        if (a.requirement_id) {
          const reqCurrent = reqAllocationMap.get(a.requirement_id) || 0;
          reqAllocationMap.set(a.requirement_id, reqCurrent + a.credits_applied);
        }
      });

      if (licensesData) {
        const withProgress: LicenseWithProgress[] = licensesData.map(l => ({
          id: l.id,
          state: l.state,
          licenseNumber: l.license_number || '',
          expiryDate: l.expiry_date,
          totalRequired: l.total_credits_required,
          creditsEarned: allocationMap.get(l.id) || 0,
          requirements: (l.license_requirements || []).map(r => ({
            id: r.id,
            category: r.category as CMECategory,
            required: r.credits_required,
            earned: reqAllocationMap.get(r.id) || 0,
          })),
        }));
        setLicenses(withProgress);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  // Get display profile - use demo data if in demo mode without auth
  const displayProfile = (!user && DEMO_MODE) ? demoProfile : profile;

  function formatDate(dateStr: string | null) {
    if (!dateStr) return 'No expiry set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function getDaysUntil(dateStr: string | null) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  if (loading && licenses.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
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
        {/* Header with Animation */}
        <Animated.View style={[styles.header, headerAnim]}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, Dr. {displayProfile?.full_name?.split(' ').pop()}
            </Text>
            <Text style={styles.subtitle}>
              {displayProfile?.degree_type || 'MD'} • {licenses.length} Active License{licenses.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.agentButton}
            onPress={() => router.push('/(tabs)/agent')}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.agentGlow, { opacity: glowOpacity }]} />
            <Ionicons name="sparkles" size={22} color={colors.navy[900]} />
          </TouchableOpacity>
        </Animated.View>

        {/* Error State */}
        {error && (
          <Card style={[styles.errorCard]}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadDashboard}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* License Cards */}
        {licenses.length === 0 && !loading ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No licenses yet</Text>
            <Text style={styles.emptyText}>
              Add your state medical licenses to start tracking your CME requirements
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/licenses')}
            >
              <Text style={styles.addButtonText}>+ Add License</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          licenses.map((license) => {
            const totalRequired = license.totalRequired ?? 0;
            const progress = totalRequired > 0
              ? (license.creditsEarned / totalRequired) * 100
              : 0;
            const daysUntil = getDaysUntil(license.expiryDate);

            return (
              <TouchableOpacity
                key={license.id}
                onPress={() => router.push(`/(tabs)/licenses/${license.id}`)}
                activeOpacity={0.7}
              >
                <Card style={styles.licenseCard}>
                  <View style={styles.licenseHeader}>
                    <View>
                      <Text style={styles.licenseState}>{license.state} License</Text>
                      <Text style={styles.licenseNumber}>#{license.licenseNumber}</Text>
                    </View>
                    <View style={styles.expiryBadge}>
                      {daysUntil !== null && daysUntil <= 90 ? (
                        <View style={[styles.badge, styles.badgeWarning]}>
                          <Text style={styles.badgeText}>{daysUntil} days</Text>
                        </View>
                      ) : (
                        <Text style={styles.expiryText}>
                          Expires {formatDate(license.expiryDate)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <ProgressBar
                    progress={progress}
                    size="lg"
                    style={styles.progressBar}
                  />
                  <Text style={styles.creditsText}>
                    {license.creditsEarned}/{totalRequired} credits
                  </Text>

                  {/* Category breakdown */}
                  <View style={styles.categories}>
                    {license.requirements.map((req) => (
                      <View key={req.id} style={styles.categoryItem}>
                        <CategoryTag category={req.category} size="sm" />
                        <Text style={styles.categoryProgress}>
                          {req.earned}/{req.required}
                        </Text>
                        {req.earned >= req.required && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                    ))}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/courses')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="book-outline" size={22} color={colors.accent} />
              </View>
              <Text style={styles.actionText}>Find Courses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/certificates/upload')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="cloud-upload-outline" size={22} color={colors.accent} />
              </View>
              <Text style={styles.actionText}>Upload Cert</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/agent')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.accent} />
              </View>
              <Text style={styles.actionText}>Ask Agent</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Smart Suggestions */}
        <SmartSuggestions
          suggestions={mockAISuggestions}
          onSuggestionPress={(suggestion) => {
            router.push('/(tabs)/courses');
          }}
        />
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
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  agentButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  agentGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.glow,
  },
  agentIcon: {
    fontSize: 24,
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
  addButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  licenseCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  licenseState: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
  },
  licenseNumber: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expiryBadge: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeWarning: {
    backgroundColor: colors.warningLight + '30',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },
  expiryText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  progressBar: {
    marginBottom: spacing.xs,
  },
  creditsText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryProgress: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  checkmark: {
    fontSize: 12,
    color: colors.success,
  },
  quickActions: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
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
});
