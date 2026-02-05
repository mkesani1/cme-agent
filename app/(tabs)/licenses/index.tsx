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
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/hooks/useAuth';
import { Card, Button, ProgressBar, CategoryTag } from '../../../src/components/ui';
import { colors, spacing, typography, CMECategory } from '../../../src/lib/theme';

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

export default function LicensesScreen() {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [dea, setDea] = useState<DEARegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
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
        .eq('user_id', user!.id)
        .order('state');

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

  function getDaysUntil(dateStr: string | null) {
    if (!dateStr) return null;
    const diff = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return diff;
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
            <Text style={styles.errorIcon}>⚠️</Text>
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

        {/* State Licenses */}
        <Text style={styles.sectionTitle}>State Medical Licenses</Text>

        {licenses.length === 0 && !loading ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No licenses added yet</Text>
            <Button
              title="Add Your First License"
              onPress={() => router.push('/(tabs)/licenses/add')}
              size="sm"
            />
          </Card>
        ) : (
          licenses.map((license) => {
            const totalRequired = license.total_credits_required ?? 0;
            const progress = totalRequired > 0
              ? (license.credits_earned / totalRequired) * 100
              : 0;
            const daysUntil = getDaysUntil(license.expiry_date);
            const isUrgent = daysUntil !== null && daysUntil <= 90;

            return (
              <TouchableOpacity
                key={license.id}
                onPress={() => router.push(`/(tabs)/licenses/${license.id}`)}
                onLongPress={() => deleteLicense(license.id)}
                activeOpacity={0.7}
              >
                <Card style={styles.licenseCard}>
                  <View style={styles.licenseHeader}>
                    <View style={styles.stateContainer}>
                      <Text style={styles.stateFlag}>
                        {license.state === 'CA' ? '🐻' :
                         license.state === 'TX' ? '🤠' :
                         license.state === 'NY' ? '🗽' :
                         license.state === 'FL' ? '🌴' : '🏥'}
                      </Text>
                      <View>
                        <Text style={styles.stateName}>{license.state}</Text>
                        <Text style={styles.licenseNumber}>
                          #{license.license_number || 'No number'}
                        </Text>
                      </View>
                    </View>

                    {isUrgent ? (
                      <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>{daysUntil} days</Text>
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
                    {progress >= 100 && (
                      <View style={styles.completeBadge}>
                        <Text style={styles.completeText}>✓ Complete</Text>
                      </View>
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
              <Text style={styles.deaIcon}>🏥</Text>
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
            <Text style={styles.emptyIcon}>🏥</Text>
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
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.md,
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
  stateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateFlag: {
    fontSize: 32,
    marginRight: spacing.md,
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
  urgentBadge: {
    backgroundColor: colors.warningLight + '30',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  urgentText: {
    color: colors.warning,
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
  deaCard: {
    padding: spacing.md,
  },
  deaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deaIcon: {
    fontSize: 32,
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
