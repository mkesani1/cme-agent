import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/hooks/useAuth';
import { Card, Button, ProgressBar, CategoryTag } from '../../../src/components/ui';
import { colors, spacing, typography, CMECategory } from '../../../src/lib/theme';
import { DEMO_MODE, getStateName, demoLicenses } from '../../../src/lib/demoData';
import { getUrgencyLevel, getDaysUntilExpiry, UrgencyLevel } from '../../../src/lib/license-utils';

interface License {
  id: string;
  state: string;
  license_number: string | null;
  expiry_date: string | null;
  total_credits_required: number | null;
  degree_type: string | null;
  requirements: {
    id: string;
    category: CMECategory;
    credits_required: number;
  }[];
  credits_earned: number;
}

interface DEARegistration {
  id: string;
  dea_number: string;
  expiry_date: string | null;
  linked_states: string[] | null;
}


// Sort by expiry date (soonest first)
function sortByExpiry(licenses: License[]): License[] {
  return [...licenses].sort((a, b) => {
    if (!a.expiry_date && !b.expiry_date) return 0;
    if (!a.expiry_date) return 1;
    if (!b.expiry_date) return -1;
    return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
  });
}

export default function LicensesScreen() {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [dea, setDea] = useState<DEARegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) {
      if (DEMO_MODE) {
        // Use demo data when no user is authenticated
        const demoFormatted: License[] = demoLicenses.map(l => ({
          id: l.id,
          state: l.state,
          license_number: l.license_number,
          expiry_date: l.expiry_date,
          total_credits_required: l.total_credits_required,
          degree_type: 'MD',
          requirements: l.requirements.map(r => ({
            id: r.id,
            category: r.category as CMECategory,
            credits_required: r.required,
          })),
          credits_earned: l.creditsEarned,
        }));
        setLicenses(demoFormatted);
      }
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Load licenses
      const { data: licensesData, error: licensesError } = await supabase
        .from('licenses')
        .select(`
          id,
          state,
          license_number,
          expiry_date,
          total_credits_required,
          degree_type,
          license_requirements (
            id,
            category,
            credits_required
          )
        `)
        .eq('user_id', user!.id);

      if (licensesError) throw licensesError;

      // Load DEA
      const { data: deaData } = await supabase
        .from('dea_registrations')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      // Calculate credits earned per license
      const { data: allocations, error: allocError } = await supabase
        .from('credit_allocations')
        .select('license_id, credits_applied')
        .in('license_id', licensesData?.map(l => l.id) || []);

      if (allocError) throw allocError;

      const creditMap = new Map<string, number>();
      allocations?.forEach(a => {
        const current = creditMap.get(a.license_id) || 0;
        creditMap.set(a.license_id, current + a.credits_applied);
      });

      if (licensesData) {
        setLicenses(licensesData.map(l => ({
          ...l,
          state: getStateName(l.state),
          requirements: (l.license_requirements || []).map(r => ({
            id: r.id,
            category: r.category as CMECategory,
            credits_required: r.credits_required,
          })),
          credits_earned: creditMap.get(l.id) || 0,
        })));
      }

      if (deaData) {
        setDea(deaData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load licenses';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  async function deleteLicense(id: string) {
    Alert.alert(
      'Delete License',
      'Are you sure you want to delete this license? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('licenses').delete().eq('id', id);
            setLicenses(licenses.filter(l => l.id !== id));
          },
        },
      ]
    );
  }

  if (loading && licenses.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading licenses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Sort by expiry date (soonest first) — Dr. Chandrasekhar's request
  const sortedLicenses = sortByExpiry(licenses);

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
        <View style={styles.header}>
          <Text style={styles.title}>Licenses</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/licenses/add')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Error State */}
        {error && (
          <Card style={[styles.errorCard]}>
            <Ionicons name="alert-circle" size={40} color={colors.risk} style={styles.errorIconStyle} />
            <Text style={styles.errorTitle}>Failed to load licenses</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadData}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* State Licenses — sorted by expiry, with urgency highlighting */}
        <Text style={styles.sectionTitle}>State Medical Licenses</Text>

        {sortedLicenses.length === 0 && !loading ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={40} color={colors.textMuted} style={styles.emptyIconStyle} />
            <Text style={styles.emptyText}>No licenses added yet</Text>
            <Button
              title="Add Your First License"
              onPress={() => router.push('/(tabs)/licenses/add')}
              size="sm"
            />
          </Card>
        ) : (
          sortedLicenses.map((license) => {
            const totalRequired = license.total_credits_required ?? 0;
            const progress = totalRequired > 0
              ? (license.credits_earned / totalRequired) * 100
              : 0;
            const urgency = getUrgencyLevel(license.expiry_date);
            const daysUntil = getDaysUntilExpiry(license.expiry_date);

            return (
              <TouchableOpacity
                key={license.id}
                onPress={() => router.push(`/(tabs)/licenses/${license.id}`)}
                onLongPress={() => deleteLicense(license.id)}
                activeOpacity={0.7}
              >
                <Card style={[
                  styles.licenseCard,
                  urgency === 'critical' && styles.licenseCardCritical,
                  urgency === 'thisYear' && styles.licenseCardThisYear,
                ]}>
                  <View style={styles.licenseHeader}>
                    <View style={styles.stateContainer}>
                      <View style={[
                        styles.stateIconContainer,
                        urgency === 'critical' && styles.stateIconCritical,
                        urgency === 'thisYear' && styles.stateIconThisYear,
                      ]}>
                        {urgency === 'critical' ? (
                          <Ionicons name="alert-circle" size={20} color={colors.risk} />
                        ) : (
                          <Ionicons name="location" size={20} color={colors.accent} />
                        )}
                      </View>
                      <View>
                        <Text style={styles.stateName}>{license.state}</Text>
                        <Text style={styles.licenseNumber}>
                          #{license.license_number || 'No number'}
                        </Text>
                      </View>
                    </View>

                    {urgency === 'critical' ? (
                      <View style={styles.criticalBadge}>
                        <Ionicons name="alert-circle" size={12} color="#FFFFFF" style={{ marginRight: 2 }} />
                        <Text style={styles.criticalBadgeText}>
                          {daysUntil !== null && daysUntil <= 0 ? 'EXPIRED' : `${daysUntil}d left`}
                        </Text>
                      </View>
                    ) : urgency === 'thisYear' ? (
                      <View style={styles.thisYearBadge}>
                        <Ionicons name="time-outline" size={12} color={colors.navy[900]} style={{ marginRight: 2 }} />
                        <Text style={styles.thisYearBadgeText}>Due this year</Text>
                      </View>
                    ) : (
                      <Text style={styles.expiryText}>
                        Exp: {formatDate(license.expiry_date)}
                      </Text>
                    )}
                  </View>

                  <ProgressBar
                    progress={progress}
                    size="md"
                    style={styles.progressBar}
                  />

                  <View style={styles.creditsRow}>
                    <Text style={styles.creditsText}>
                      {license.credits_earned}/{totalRequired} credits
                    </Text>
                    {progress >= 100 ? (
                      <View style={styles.completeBadge}>
                        <Ionicons name="checkmark" size={12} color={colors.success} style={{ marginRight: 2 }} />
                        <Text style={styles.completeText}>Complete</Text>
                      </View>
                    ) : (
                      <Text style={styles.remainingText}>
                        {totalRequired - license.credits_earned} to go
                      </Text>
                    )}
                  </View>

                  <View style={styles.categoriesRow}>
                    {license.requirements.slice(0, 4).map((req) => (
                      <CategoryTag key={req.id} category={req.category} size="sm" />
                    ))}
                    {license.requirements.length > 4 && (
                      <Text style={styles.moreCategories}>
                        +{license.requirements.length - 4}
                      </Text>
                    )}
                  </View>

                  {/* Expiry date footer for urgent licenses */}
                  {urgency !== 'safe' && (
                    <View style={styles.expiryFooter}>
                      <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                      <Text style={styles.expiryFooterText}>
                        Expires {formatDate(license.expiry_date)}
                      </Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        {/* DEA Section */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
          DEA Registration
        </Text>

        {dea ? (
          <Card style={styles.deaCard}>
            <View style={styles.deaHeader}>
              <View style={styles.deaIconContainer}>
                <Ionicons name="medkit" size={20} color={colors.accent} />
              </View>
              <View style={styles.deaInfo}>
                <Text style={styles.deaNumber}>DEA #{dea.dea_number}</Text>
                <Text style={styles.deaExpiry}>
                  Expires: {formatDate(dea.expiry_date)}
                </Text>
              </View>
              <View style={styles.deaStatus}>
                <Text style={styles.deaStatusText}>Active</Text>
              </View>
            </View>

            {dea.linked_states && dea.linked_states.length > 0 && (
              <View style={styles.linkedStates}>
                <Text style={styles.linkedLabel}>Linked to:</Text>
                <Text style={styles.linkedList}>
                  {dea.linked_states.join(', ')}
                </Text>
              </View>
            )}
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="medkit-outline" size={40} color={colors.textMuted} style={styles.emptyIconStyle} />
            <Text style={styles.emptyText}>No DEA registration</Text>
            <Button
              title="Add DEA Registration"
              onPress={() => router.push('/(tabs)/licenses/add-dea')}
              variant="outline"
              size="sm"
            />
          </Card>
        )}

        {/* Help text */}
        <Text style={styles.helpText}>
          Long press on a license to delete it
        </Text>
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
  errorIconStyle: {
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
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
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
  sectionTitle: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIconStyle: {
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  // License cards with urgency styling
  licenseCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  licenseCardCritical: {
    borderWidth: 2,
    borderColor: colors.risk,
    shadowColor: colors.risk,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  licenseCardThisYear: {
    borderWidth: 2,
    borderColor: '#D4A636',
    shadowColor: '#D4A636',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stateIconCritical: {
    backgroundColor: 'rgba(184, 92, 92, 0.15)',
  },
  stateIconThisYear: {
    backgroundColor: 'rgba(212, 166, 54, 0.15)',
  },
  stateName: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text,
  },
  licenseNumber: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },

  // Urgency badges
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.risk,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  criticalBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  thisYearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4A636',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  thisYearBadgeText: {
    color: colors.navy[900],
    fontWeight: '600',
    fontSize: 12,
  },

  expiryText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  progressBar: {
    marginBottom: spacing.sm,
  },
  creditsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  creditsText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
  remainingText: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  moreCategories: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  expiryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  expiryFooterText: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  deaCard: {
    padding: spacing.md,
  },
  deaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  deaInfo: {
    flex: 1,
  },
  deaNumber: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
  },
  deaExpiry: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  deaStatus: {
    backgroundColor: colors.successLight + '30',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  deaStatusText: {
    color: colors.success,
    fontWeight: '600',
    fontSize: 12,
  },
  linkedStates: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  linkedLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  linkedList: {
    fontSize: typography.caption.fontSize,
    color: colors.text,
    fontWeight: '500',
  },
  helpText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
