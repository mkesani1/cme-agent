import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CategoryTag, GapsSummaryCard, RecommendationCard } from '../../../src/components/ui';
import { colors, spacing, typography, CMECategory, cmeCategories } from '../../../src/lib/theme';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/hooks/useAuth';
import { DEMO_MODE, demoCourses } from '../../../src/lib/demoData';
import { useRecommendations, CourseRecommendation } from '../../../src/hooks/useRecommendations';
import { useCourseDiscovery, useGapAnalysis } from '../../../src/hooks/useCourseDiscovery';
import { useFadeInUp } from '../../../src/lib/animations';

interface Course {
  id: string;
  title: string;
  provider: string;
  credit_hours: number;
  category: CMECategory | null;
  price_cents: number | null;
  is_free: boolean | null;
  course_url: string | null;
  description: string | null;
  approved_states: string[] | null;
  accme_accredited: boolean | null;
  format: string | null;
}

const CATEGORIES: (CMECategory | 'all')[] = ['all', 'general', 'controlled_substances', 'risk_management', 'ethics', 'pain_management'];

export default function CoursesScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CMECategory | 'all'>('all');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'smart' | 'discover' | 'all'>('smart');

  // Animations
  const headerAnim = useFadeInUp(0);

  // AI Recommendations
  const {
    gapsSummary,
    recommendations,
    loading: loadingRecommendations,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useRecommendations();

  // AI Course Discovery
  const {
    discoveredCourses,
    discoveryState,
    runDiscovery,
    loading: loadingDiscovery,
  } = useCourseDiscovery();

  useEffect(() => {
    loadAllCourses();
  }, []);

  async function loadAllCourses() {
    // Demo mode: Use mock data
    if (!user && DEMO_MODE) {
      setAllCourses(demoCourses.map(c => ({
        id: c.id,
        title: c.name,
        provider: c.provider,
        credit_hours: c.hours,
        category: c.category as CMECategory,
        price_cents: c.price * 100,
        is_free: c.price === 0,
        course_url: c.url,
        description: c.description,
        approved_states: null,
        accme_accredited: true,
        format: 'online',
      })));
      setLoadingCourses(false);
      return;
    }

    try {
      setLoadingCourses(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('credit_hours', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) setAllCourses(data as Course[]);
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([loadAllCourses(), refetchRecommendations()]);
    setRefreshing(false);
  }

  // Filter all courses by search and category
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function formatPrice(priceCents: number | null, isFree: boolean | null): string {
    if (isFree) return 'Free';
    if (!priceCents || priceCents === 0) return 'Free';
    return `$${(priceCents / 100).toFixed(0)}`;
  }

  function openCourse(url: string | null) {
    if (url) Linking.openURL(url);
  }

  // Don't block the entire screen — let each tab handle its own loading state
  // This prevents the recommendations edge function from blocking access to All/Discover tabs

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
        <Animated.View style={headerAnim}>
          <Text style={styles.title}>Find Courses</Text>
          <Text style={styles.subtitle}>
            {activeTab === 'smart'
              ? 'AI-optimized courses that cover multiple state requirements'
              : 'Browse all available CME courses'}
          </Text>
        </Animated.View>

        {/* Tab Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'smart' && styles.toggleButtonActive]}
            onPress={() => setActiveTab('smart')}
          >
            <Ionicons
              name="sparkles"
              size={14}
              color={activeTab === 'smart' ? '#FFFFFF' : colors.accent}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.toggleText, activeTab === 'smart' && styles.toggleTextActive]}>
              Smart Match
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'discover' && styles.toggleButtonActive]}
            onPress={() => setActiveTab('discover')}
          >
            <Ionicons
              name="globe"
              size={14}
              color={activeTab === 'discover' ? '#FFFFFF' : colors.accent}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.toggleText, activeTab === 'discover' && styles.toggleTextActive]}>
              AI Discover
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'all' && styles.toggleButtonActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.toggleText, activeTab === 'all' && styles.toggleTextActive]}>
              All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View>

        {/* Smart Match Tab */}
        {activeTab === 'smart' && (
          <>
            {/* Loading state for smart tab */}
            {loadingRecommendations && recommendations.length === 0 && (
              <View style={styles.tabLoadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Finding optimal courses for you...</Text>
              </View>
            )}

            {/* Gaps Summary */}
            <GapsSummaryCard summary={gapsSummary} loading={loadingRecommendations} />

            {/* AI Recommendations */}
            {recommendations.length > 0 ? (
              <>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="bulb" size={18} color={colors.accent} />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Top Recommendations</Text>
                    <Text style={styles.sectionSubtitle}>
                      Optimized for multi-state efficiency
                    </Text>
                  </View>
                </View>

                {recommendations.map((rec, index) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    rank={index + 1}
                  />
                ))}
              </>
            ) : !loadingRecommendations && (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                <Text style={styles.emptyText}>All caught up!</Text>
                <Text style={styles.emptySubtext}>
                  No additional courses needed right now. Your CME requirements are on track.
                </Text>
              </View>
            )}

            {recommendationsError && (
              <Card style={styles.errorCard}>
                <Text style={styles.errorText}>{recommendationsError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetchRecommendations()}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </Card>
            )}
          </>
        )}

        {/* AI Discover Tab */}
        {activeTab === 'discover' && (
          <>
            {/* AI Discovery Banner */}
            <LinearGradient
              colors={['#1a365d', '#2a4a7a', '#1a365d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.discoverBanner}
            >
              <View style={styles.discoverBannerContent}>
                <View style={styles.discoverIconContainer}>
                  <Ionicons name="globe" size={28} color={colors.accent} />
                </View>
                <View style={styles.discoverTextContainer}>
                  <Text style={styles.discoverTitle}>AI Course Discovery</Text>
                  <Text style={styles.discoverDescription}>
                    Our AI agent searches the web for CME courses tailored to your licenses and specialty
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.discoverButton,
                  discoveryState.isDiscovering && styles.discoverButtonDisabled,
                ]}
                onPress={() => {
                  if (!discoveryState.isDiscovering) {
                    runDiscovery();
                  }
                }}
                disabled={discoveryState.isDiscovering}
              >
                {discoveryState.isDiscovering ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.discoverButtonText}>Searching...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="search" size={18} color="#FFFFFF" />
                    <Text style={styles.discoverButtonText}>Find Courses</Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* Discovery Stats */}
            {discoveryState.lastDiscoveryAt && (
              <View style={styles.discoveryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{discoveryState.coursesFound}</Text>
                  <Text style={styles.statLabel}>Found</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{discoveryState.queriesUsed.length}</Text>
                  <Text style={styles.statLabel}>Searches</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {Math.floor((Date.now() - discoveryState.lastDiscoveryAt.getTime()) / 60000)}m
                  </Text>
                  <Text style={styles.statLabel}>Ago</Text>
                </View>
              </View>
            )}

            {/* Discovered Courses */}
            {loadingDiscovery ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Loading discovered courses...</Text>
              </View>
            ) : discoveredCourses.length > 0 ? (
              <>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="trophy" size={18} color={colors.accent} />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Discovered for You</Text>
                    <Text style={styles.sectionSubtitle}>
                      {discoveredCourses.length} courses from across the web
                    </Text>
                  </View>
                </View>

                {discoveredCourses.slice(0, 10).map((course, index) => (
                  <Card key={course.source_url || index} style={styles.discoveredCard}>
                    <View style={styles.discoveredHeader}>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>#{index + 1}</Text>
                      </View>
                      <View style={styles.discoveredInfo}>
                        <Text style={styles.discoveredTitle}>{course.title}</Text>
                        <Text style={styles.discoveredProvider}>{course.provider}</Text>
                      </View>
                      <View style={styles.scoreContainer}>
                        <Text style={styles.scoreValue}>{course.relevance_score || 0}</Text>
                        <Text style={styles.scoreLabel}>Match</Text>
                      </View>
                    </View>

                    <View style={styles.discoveredMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.metaText}>{course.credits} credits</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="laptop-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.metaText}>{course.format}</Text>
                      </View>
                      {course.price !== undefined && (
                        <View style={styles.metaItem}>
                          <Ionicons name="pricetag-outline" size={14} color={colors.textMuted} />
                          <Text style={styles.metaText}>
                            {course.price === 0 ? 'Free' : `$${course.price}`}
                          </Text>
                        </View>
                      )}
                    </View>

                    {course.states_accepted.length > 0 && (
                      <View style={styles.statesContainer}>
                        <Text style={styles.statesLabel}>Accepted in: </Text>
                        <Text style={styles.statesText}>
                          {course.states_accepted.slice(0, 5).join(', ')}
                          {course.states_accepted.length > 5 && ` +${course.states_accepted.length - 5} more`}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.viewCourseButton}
                      onPress={() => course.source_url && Linking.openURL(course.source_url)}
                    >
                      <Text style={styles.viewCourseText}>View Course</Text>
                      <Ionicons name="open-outline" size={16} color={colors.accent} />
                    </TouchableOpacity>
                  </Card>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="globe-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No courses discovered yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap "Find Courses" to let our AI search for relevant CME courses based on your profile
                </Text>
              </View>
            )}

            {discoveryState.error && (
              <Card style={styles.errorCard}>
                <Text style={styles.errorText}>{discoveryState.error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => runDiscovery()}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </Card>
            )}
          </>
        )}

        {/* All Courses Tab */}
        {activeTab === 'all' && (
          <>
            {/* Loading state for all tab */}
            {loadingCourses && allCourses.length === 0 && (
              <View style={styles.tabLoadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Loading courses...</Text>
              </View>
            )}

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search courses..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContent}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    selectedCategory === cat && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[
                    styles.filterText,
                    selectedCategory === cat && styles.filterTextActive,
                  ]}>
                    {cat === 'all' ? 'All' : cmeCategories[cat]?.label || cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Results count */}
            <Text style={styles.resultsCount}>
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            </Text>

            {/* Course List */}
            {filteredCourses.map((course) => (
              <Card key={course.id} style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{course.title}</Text>
                    <Text style={styles.courseProvider}>{course.provider}</Text>
                  </View>
                  <View style={styles.courseHours}>
                    <Text style={styles.hoursNumber}>{course.credit_hours}</Text>
                    <Text style={styles.hoursLabel}>hrs</Text>
                  </View>
                </View>

                {course.description && (
                  <Text style={styles.courseDescription} numberOfLines={2}>
                    {course.description}
                  </Text>
                )}

                <View style={styles.courseFooter}>
                  <View style={styles.tagsRow}>
                    {course.category && <CategoryTag category={course.category} size="sm" />}
                    {course.accme_accredited && (
                      <View style={styles.accreditedBadge}>
                        <Text style={styles.accreditedText}>ACCME</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.courseMeta}>
                    <Text style={[
                      styles.coursePrice,
                      (course.is_free || !course.price_cents) && styles.coursePriceFree
                    ]}>
                      {formatPrice(course.price_cents, course.is_free)}
                    </Text>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => openCourse(course.course_url)}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}

            {filteredCourses.length === 0 && !loadingCourses && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No courses found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search or filters
                </Text>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

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
  tabLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
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
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
    color: colors.text,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(166, 139, 91, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  filterScroll: {
    marginBottom: spacing.md,
    marginHorizontal: -spacing.lg,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  errorCard: {
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.risk,
  },
  errorText: {
    color: colors.risk,
    marginBottom: spacing.sm,
    textAlign: 'center',
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
  },
  courseCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  courseInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  courseName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  courseProvider: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  courseHours: {
    alignItems: 'center',
    backgroundColor: colors.accent + '15',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  hoursNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
  },
  hoursLabel: {
    fontSize: 10,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  courseDescription: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  accreditedBadge: {
    backgroundColor: colors.success + '20',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  accreditedText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  coursePrice: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  coursePriceFree: {
    color: colors.success,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    gap: 4,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  clearButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    marginTop: spacing.md,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: typography.bodySmall.fontSize,
  },
  // AI Discover styles
  discoverBanner: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  discoverBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  discoverIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(196, 165, 116, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  discoverTextContainer: {
    flex: 1,
  },
  discoverTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  discoverDescription: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  discoverButtonDisabled: {
    opacity: 0.7,
  },
  discoverButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  discoveryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.accent,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  discoveredCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  discoveredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  rankText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  discoveredInfo: {
    flex: 1,
  },
  discoveredTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  discoveredProvider: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(196, 165, 116, 0.15)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  scoreValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.accent,
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  discoveredMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statesLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statesText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  viewCourseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  viewCourseText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
});
