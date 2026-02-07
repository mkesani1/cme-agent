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
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing, typography, CMECategory, cmeCategories } from '../../src/lib/theme';
import { DEMO_MODE, demoProfile, getDemoLicensesFormatted } from '../../src/lib/demoData';
import { useFadeInUp } from '../../src/lib/animations';

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

// Subtle bubble/bokeh overlay for luxury feel
function BubbleOverlay({ variant = 'gold' }: { variant?: 'gold' | 'navy' }) {
  const bubbles = [
    { cx: '15%', cy: '20%', r: 40, opacity: 0.08 },
    { cx: '85%', cy: '15%', r: 60, opacity: 0.06 },
    { cx: '75%', cy: '70%', r: 35, opacity: 0.07 },
    { cx: '25%', cy: '80%', r: 50, opacity: 0.05 },
    { cx: '50%', cy: '40%', r: 25, opacity: 0.04 },
    { cx: '90%', cy: '50%', r: 45, opacity: 0.06 },
    { cx: '10%', cy: '60%', r: 30, opacity: 0.05 },
    { cx: '60%', cy: '85%', r: 55, opacity: 0.04 },
    { cx: '40%', cy: '10%', r: 35, opacity: 0.06 },
    { cx: '70%', cy: '30%', r: 20, opacity: 0.05 },
  ];

  const fillColor = variant === 'gold' ? 'rgba(255, 255, 255, 1)' : 'rgba(166, 139, 91, 1)';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {bubbles.map((bubble, index) => (
          <Circle
            key={index}
            cx={bubble.cx}
            cy={bubble.cy}
            r={bubble.r}
            fill={fillColor}
            opacity={bubble.opacity}
          />
        ))}
      </Svg>
    </View>
  );
}

// Circular progress component
function CircularProgress({ progress, size = 70 }: { progress: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="bar-chart-outline" size={24} color="rgba(255,255,255,0.8)" />
      </View>
    </View>
  );
}

// Category pill component
function CategoryPill({
  label,
  earned,
  required,
  isComplete
}: {
  label: string;
  earned: number;
  required: number;
  isComplete: boolean;
}) {
  const isWarning = earned === 0 && required > 0;

  return (
    <View style={[
      styles.categoryPill,
      isComplete && styles.categoryPillComplete,
      isWarning && styles.categoryPillWarning,
    ]}>
      {isComplete && (
        <Ionicons name="checkmark" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
      )}
      <Text style={[
        styles.categoryPillText,
        isComplete && styles.categoryPillTextComplete,
        isWarning && styles.categoryPillTextWarning,
      ]}>
        {label} {earned}/{required}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { user, profile } = useAuth();
  const [licenses, setLicenses] = useState<LicenseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headerAnim = useFadeInUp(0);
  const cardAnim = useFadeInUp(100);
  const actionsAnim = useFadeInUp(200);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
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
          id, state, license_number, expiry_date, total_credits_required,
          license_requirements (id, category, credits_required)
        `)
        .eq('user_id', user!.id);

      if (licensesError) throw licensesError;

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

  const displayProfile = (!user && DEMO_MODE) ? demoProfile : profile;

  function formatExpiry(dateStr: string | null) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function formatShortDate(dateStr: string | null) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  // Find incomplete requirement for recommended action
  function getIncompleteRequirement() {
    for (const license of licenses) {
      for (const req of license.requirements) {
        if (req.earned < req.required) {
          const needed = req.required - req.earned;
          const catInfo = cmeCategories[req.category];
          return { category: catInfo?.label || req.category, needed };
        }
      }
    }
    return null;
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

  // Separate primary (incomplete) and completed licenses
  const primaryLicense = licenses.find(l => {
    const total = l.totalRequired ?? 0;
    return l.creditsEarned < total;
  }) || licenses[0];

  const completedLicenses = licenses.filter(l => {
    const total = l.totalRequired ?? 0;
    return l.creditsEarned >= total && l.id !== primaryLicense?.id;
  });

  const incompleteReq = getIncompleteRequirement();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnim]}>
          <Text style={styles.greetingSmall}>{getGreeting()}</Text>
          <Text style={styles.doctorName}>Dr. {displayProfile?.full_name?.split(' ').pop() || 'Chandrasekhar'}</Text>
          <Text style={styles.specialty}>{displayProfile?.degree_type || 'MD'} · Internal Medicine</Text>
        </Animated.View>

        {/* Primary License - Hero Card with Gold Gradient */}
        {primaryLicense && (
          <Animated.View style={cardAnim}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push(`/(tabs)/licenses/${primaryLicense.id}`)}
            >
              <LinearGradient
                colors={['#C4A574', '#A68B5B', '#8B7349', '#705C3A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                <BubbleOverlay variant="gold" />
                <View style={styles.heroContent}>
                  <View style={styles.heroLeft}>
                    <Text style={styles.heroState}>{primaryLicense.state.toUpperCase()}</Text>
                    <View style={styles.heroPercentage}>
                      <Text style={styles.heroPercentNum}>
                        {Math.round((primaryLicense.creditsEarned / (primaryLicense.totalRequired || 1)) * 100)}
                      </Text>
                      <Text style={styles.heroPercentSign}>%</Text>
                    </View>
                    <Text style={styles.heroCredits}>
                      {primaryLicense.creditsEarned} of {primaryLicense.totalRequired} credits · {(primaryLicense.totalRequired || 0) - primaryLicense.creditsEarned} to go
                    </Text>

                    {/* Category Pills */}
                    <View style={styles.heroPills}>
                      {primaryLicense.requirements.map((req) => {
                        const catInfo = cmeCategories[req.category];
                        return (
                          <CategoryPill
                            key={req.id}
                            label={catInfo?.label || req.category}
                            earned={req.earned}
                            required={req.required}
                            isComplete={req.earned >= req.required}
                          />
                        );
                      })}
                    </View>

                    <View style={styles.heroExpiry}>
                      <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.heroExpiryText}>Expires {formatExpiry(primaryLicense.expiryDate)}</Text>
                    </View>
                  </View>

                  <View style={styles.heroRight}>
                    <View style={styles.circularProgressContainer}>
                      <CircularProgress
                        progress={(primaryLicense.creditsEarned / (primaryLicense.totalRequired || 1)) * 100}
                      />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Completed Licenses - Compact Row */}
        {completedLicenses.map((license) => (
          <TouchableOpacity
            key={license.id}
            style={styles.completedRow}
            onPress={() => router.push(`/(tabs)/licenses/${license.id}`)}
            activeOpacity={0.7}
          >
            <BubbleOverlay variant="navy" />
            <View style={styles.completedLeft}>
              <View style={styles.completedCheck}>
                <Ionicons name="checkmark" size={20} color={colors.success} />
              </View>
              <View>
                <Text style={styles.completedState}>{license.state}</Text>
                <Text style={styles.completedStatus}>
                  Complete · {license.creditsEarned}/{license.totalRequired}
                </Text>
              </View>
            </View>
            <View style={styles.completedRight}>
              <Text style={styles.completedDate}>{formatShortDate(license.expiryDate)}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick Actions */}
        <Animated.View style={[styles.quickActions, actionsAnim]}>
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/courses')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="laptop-outline" size={22} color={colors.text} />
              </View>
              <Text style={styles.actionText}>Find Courses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/certificates/upload')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="arrow-up-outline" size={22} color={colors.text} />
              </View>
              <Text style={styles.actionText}>Upload Cert</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/agent')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="sparkles-outline" size={22} color={colors.text} />
              </View>
              <Text style={styles.actionText}>AI Assistant</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Recommended Action */}
        {incompleteReq && (
          <View style={styles.recommendedCard}>
            <BubbleOverlay variant="navy" />
            <View style={styles.recommendedIcon}>
              <Ionicons name="sparkles" size={22} color={colors.accent} />
            </View>
            <View style={styles.recommendedContent}>
              <Text style={styles.recommendedTitle}>Recommended Action</Text>
              <Text style={styles.recommendedText}>
                You need <Text style={styles.recommendedHighlight}>{incompleteReq.needed} {incompleteReq.category}</Text> credits. I found 3 accredited courses under 2 hours each.
              </Text>
              <TouchableOpacity
                style={styles.recommendedButton}
                onPress={() => router.push('/(tabs)/courses')}
              >
                <Text style={styles.recommendedButtonText}>View Courses</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greetingSmall: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: colors.textMuted,
  },
  heroCard: {
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
  },
  heroRight: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  circularProgressContainer: {
    marginTop: 0,
  },
  heroState: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroPercentage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroPercentNum: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 60,
  },
  heroPercentSign: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  heroCredits: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.md,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  categoryPillComplete: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'transparent',
  },
  categoryPillWarning: {
    backgroundColor: 'rgba(184, 92, 92, 0.3)',
    borderColor: 'transparent',
  },
  categoryPillText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  categoryPillTextComplete: {
    color: '#FFFFFF',
  },
  categoryPillTextWarning: {
    color: '#FFFFFF',
  },
  heroExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroExpiryText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  completedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  completedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  completedCheck: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(93, 138, 102, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedState: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  completedStatus: {
    fontSize: 13,
    color: colors.success,
  },
  completedRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  completedDate: {
    fontSize: 13,
    color: colors.textMuted,
  },
  quickActions: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  recommendedCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  recommendedIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(166, 139, 91, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  recommendedContent: {
    flex: 1,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  recommendedText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  recommendedHighlight: {
    color: colors.accent,
    fontWeight: '600',
  },
  recommendedButton: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  recommendedButtonText: {
    color: colors.navy[900],
    fontWeight: '600',
    fontSize: 14,
  },
});
