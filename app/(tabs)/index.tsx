import { useEffect, useState, useRef } from 'react';
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
  Easing,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing, typography, CMECategory, cmeCategories } from '../../src/lib/theme';
import { DEMO_MODE, demoProfile, getStateName, demoLicenses } from '../../src/lib/demoData';
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

// Urgency classification for license expiry
type UrgencyLevel = 'critical' | 'thisYear' | 'safe';

function getUrgencyLevel(expiryDate: string | null): UrgencyLevel {
  if (!expiryDate) return 'safe';
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 90) return 'critical';       // Within 3 months → RED
  if (expiry.getFullYear() === now.getFullYear()) return 'thisYear'; // This year → YELLOW
  return 'safe';
}

function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// Sort licenses by expiry date (soonest first)
function sortByExpiry(licenses: LicenseWithProgress[]): LicenseWithProgress[] {
  return [...licenses].sort((a, b) => {
    if (!a.expiryDate && !b.expiryDate) return 0;
    if (!a.expiryDate) return 1;
    if (!b.expiryDate) return -1;
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });
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

// Animated Circular progress component - fills from 0 to target
function CircularProgress({ progress, size = 70 }: { progress: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Animation for progress ring
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate from 0 to target progress
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1200,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // Required for non-transform/opacity animations
    }).start();
  }, [progress]);

  // Convert animated value to strokeDashoffset
  const animatedOffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

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
        {/* Animated Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="bar-chart-outline" size={24} color="rgba(255,255,255,0.8)" />
      </View>
    </View>
  );
}

// Create animated SVG Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Pressable card with haptic feedback and lift animation
function PressableCard({
  children,
  onPress,
  style,
  hapticStyle = 'light'
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  hapticStyle?: 'light' | 'medium' | 'heavy';
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  const hapticMap = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  };

  const handlePressIn = () => {
    // Haptic feedback
    Haptics.impactAsync(hapticMap[hapticStyle]);

    // Scale down and lift
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateAnim, {
        toValue: -4,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    // Spring back
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateAnim, {
        toValue: 0,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View style={[
      style,
      {
        transform: [
          { scale: scaleAnim },
          { translateY: translateAnim },
        ],
      },
    ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Pressable button with haptic feedback and scale
function PressableButton({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
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

// Urgency badge for license cards
function UrgencyBadge({ urgency, daysLeft }: { urgency: UrgencyLevel; daysLeft: number | null }) {
  if (urgency === 'safe' || daysLeft === null) return null;

  if (urgency === 'critical') {
    return (
      <View style={styles.urgencyBadgeCritical}>
        <Ionicons name="alert-circle" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
        <Text style={styles.urgencyBadgeCriticalText}>
          {daysLeft <= 0 ? 'EXPIRED' : `${daysLeft}d left`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.urgencyBadgeYellow}>
      <Ionicons name="time-outline" size={12} color={colors.navy[900]} style={{ marginRight: 3 }} />
      <Text style={styles.urgencyBadgeYellowText}>Due this year</Text>
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
  }, [user]);

  async function loadDashboard() {
    if (!user) {
      if (DEMO_MODE) {
        // Use demo data when no user is authenticated
        const demoFormatted: LicenseWithProgress[] = demoLicenses.map(l => ({
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
        setLicenses(demoFormatted);
      }
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
          state: getStateName(l.state),
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
    // Success haptic when refresh completes
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
    for (const license of sortedLicenses) {
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

  // Sort all licenses by expiry date (soonest first) — Dr. Chandrasekhar's request
  const sortedLicenses = sortByExpiry(licenses);

  // The hero card is always the soonest-expiring license
  const heroLicense = sortedLicenses[0];
  const remainingLicenses = sortedLicenses.slice(1);

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

        {/* Hero License Card — soonest expiring, with gold gradient */}
        {heroLicense && (() => {
          const heroUrgency = getUrgencyLevel(heroLicense.expiryDate);
          const heroDaysLeft = getDaysUntilExpiry(heroLicense.expiryDate);

          return (
            <Animated.View style={cardAnim}>
              <PressableCard
                onPress={() => router.push(`/(tabs)/licenses/${heroLicense.id}`)}
                hapticStyle="medium"
              >
                <View style={[
                  styles.heroCardWrapper,
                  heroUrgency === 'critical' && styles.heroCardCritical,
                  heroUrgency === 'thisYear' && styles.heroCardThisYear,
                ]}>
                  <LinearGradient
                    colors={['#C4A574', '#A68B5B', '#8B7349', '#705C3A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                  >
                    <BubbleOverlay variant="gold" />
                    <View style={styles.heroContent}>
                      <View style={styles.heroLeft}>
                        <View style={styles.heroStateRow}>
                          <Text style={styles.heroState}>{heroLicense.state.toUpperCase()}</Text>
                          <UrgencyBadge urgency={heroUrgency} daysLeft={heroDaysLeft} />
                        </View>
                        <View style={styles.heroPercentage}>
                          <Text style={styles.heroPercentNum}>
                            {Math.round((heroLicense.creditsEarned / (heroLicense.totalRequired || 1)) * 100)}
                          </Text>
                          <Text style={styles.heroPercentSign}>%</Text>
                        </View>
                        <Text style={styles.heroCredits}>
                          {heroLicense.creditsEarned} of {heroLicense.totalRequired} credits · {(heroLicense.totalRequired || 0) - heroLicense.creditsEarned} to go
                        </Text>

                        {/* Category Pills */}
                        <View style={styles.heroPills}>
                          {heroLicense.requirements.map((req) => {
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
                          <Text style={styles.heroExpiryText}>Expires {formatExpiry(heroLicense.expiryDate)}</Text>
                        </View>
                      </View>

                      <View style={styles.heroRight}>
                        <View style={styles.circularProgressContainer}>
                          <CircularProgress
                            progress={(heroLicense.creditsEarned / (heroLicense.totalRequired || 1)) * 100}
                          />
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </PressableCard>
            </Animated.View>
          );
        })()}

        {/* Remaining License Cards — sorted by expiry, with urgency styling */}
        {remainingLicenses.map((license) => {
          const urgency = getUrgencyLevel(license.expiryDate);
          const daysLeft = getDaysUntilExpiry(license.expiryDate);
          const total = license.totalRequired ?? 0;
          const isComplete = license.creditsEarned >= total;
          const progress = total > 0 ? Math.round((license.creditsEarned / total) * 100) : 0;

          return (
            <PressableCard
              key={license.id}
              style={[
                styles.licenseRow,
                urgency === 'critical' && styles.licenseRowCritical,
                urgency === 'thisYear' && styles.licenseRowThisYear,
              ]}
              onPress={() => router.push(`/(tabs)/licenses/${license.id}`)}
              hapticStyle="light"
            >
              <BubbleOverlay variant="navy" />
              <View style={styles.licenseRowTop}>
                <View style={styles.licenseRowLeft}>
                  <View style={[
                    styles.licenseIcon,
                    isComplete && styles.licenseIconComplete,
                    urgency === 'critical' && styles.licenseIconCritical,
                    urgency === 'thisYear' && styles.licenseIconThisYear,
                  ]}>
                    {isComplete ? (
                      <Ionicons name="checkmark" size={20} color={colors.success} />
                    ) : urgency === 'critical' ? (
                      <Ionicons name="alert-circle" size={20} color={colors.risk} />
                    ) : (
                      <Ionicons name="document-text" size={20} color={colors.accent} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.licenseRowState}>{license.state}</Text>
                    <Text style={styles.licenseRowCredits}>
                      {isComplete
                        ? `Complete · ${license.creditsEarned}/${total}`
                        : `${license.creditsEarned}/${total} credits · ${total - license.creditsEarned} to go`
                      }
                    </Text>
                  </View>
                </View>
                <View style={styles.licenseRowRight}>
                  {urgency !== 'safe' ? (
                    <UrgencyBadge urgency={urgency} daysLeft={daysLeft} />
                  ) : (
                    <Text style={styles.licenseRowDate}>{formatShortDate(license.expiryDate)}</Text>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </View>

              {/* Mini progress bar */}
              {!isComplete && (
                <View style={styles.miniProgressContainer}>
                  <View style={styles.miniProgressBg}>
                    <View style={[
                      styles.miniProgressFill,
                      { width: `${Math.min(progress, 100)}%` },
                      urgency === 'critical' && styles.miniProgressCritical,
                      urgency === 'thisYear' && styles.miniProgressYellow,
                    ]} />
                  </View>
                  <Text style={styles.miniProgressText}>{progress}%</Text>
                </View>
              )}
            </PressableCard>
          );
        })}

        {/* Quick Actions */}
        <Animated.View style={[styles.quickActions, actionsAnim]}>
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
          <View style={styles.actionButtons}>
            <PressableButton
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/courses')}
            >
              <View style={styles.actionButtonInner}>
                <View style={styles.actionIconCircle}>
                  <Ionicons name="laptop-outline" size={22} color={colors.text} />
                </View>
                <Text style={styles.actionText}>Find Courses</Text>
              </View>
            </PressableButton>
            <PressableButton
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/certificates/upload')}
            >
              <View style={styles.actionButtonInner}>
                <View style={styles.actionIconCircle}>
                  <Ionicons name="arrow-up-outline" size={22} color={colors.text} />
                </View>
                <Text style={styles.actionText}>Upload Cert</Text>
              </View>
            </PressableButton>
            <PressableButton
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/agent')}
            >
              <View style={styles.actionButtonInner}>
                <View style={styles.actionIconCircle}>
                  <Ionicons name="sparkles-outline" size={22} color={colors.text} />
                </View>
                <Text style={styles.actionText}>AI Assistant</Text>
              </View>
            </PressableButton>
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

  // Hero card — wrapper adds urgency border
  heroCardWrapper: {
    borderRadius: 22,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  heroCardCritical: {
    borderWidth: 2,
    borderColor: colors.risk,
    shadowColor: colors.risk,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  heroCardThisYear: {
    borderWidth: 2,
    borderColor: '#D4A636',
    shadowColor: '#D4A636',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroCard: {
    borderRadius: 20,
    padding: spacing.lg,
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
  heroStateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroState: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
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

  // Urgency badges
  urgencyBadgeCritical: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.risk,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  urgencyBadgeCriticalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  urgencyBadgeYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4A636',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  urgencyBadgeYellowText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.navy[900],
  },

  // License rows — remaining licenses
  licenseRow: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  licenseRowCritical: {
    borderWidth: 2,
    borderColor: colors.risk,
    shadowColor: colors.risk,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  licenseRowThisYear: {
    borderWidth: 2,
    borderColor: '#D4A636',
    shadowColor: '#D4A636',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  licenseRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  licenseRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  licenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(166, 139, 91, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  licenseIconComplete: {
    backgroundColor: 'rgba(93, 138, 102, 0.15)',
  },
  licenseIconCritical: {
    backgroundColor: 'rgba(184, 92, 92, 0.15)',
  },
  licenseIconThisYear: {
    backgroundColor: 'rgba(212, 166, 54, 0.15)',
  },
  licenseRowState: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  licenseRowCredits: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  licenseRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  licenseRowDate: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // Mini progress bar for license rows
  miniProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  miniProgressBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  miniProgressCritical: {
    backgroundColor: colors.risk,
  },
  miniProgressYellow: {
    backgroundColor: '#D4A636',
  },
  miniProgressText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    width: 32,
    textAlign: 'right',
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  actionButtonInner: {
    padding: spacing.md,
    alignItems: 'center',
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
