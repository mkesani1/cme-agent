import { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, CategoryTag, GapsSummaryCard, RecommendationCard } from '../../../src/components/ui';
import { colors, spacing, typography, CMECategory, cmeCategories } from '../../../src/lib/theme';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/hooks/useAuth';
import { DEMO_MODE, demoCourses } from '../../../src/lib/demoData';
import { useRecommendations, CourseRecommendation } from '../../../src/hooks/useRecommendations';

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
  const [activeTab, setActiveTab] = useState<'smart' | 'all'>('smart');

  // AI Recommendations
  const {
    gapsSummary,
    recommendations,
    loading: loadingRecommendations,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useRecommendations();

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

  const isLoading = activeTab === 'smart' ? loadingRecommendations : loadingCourses;

  if (isLoading && recommendations.length === 0 && allCourses.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>
            {activeTab === 'smart' ? 'Finding optimal courses for you...' : 'Loading courses...'}
          </Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* Header */}
        <Text style={styles.title}>Find Courses</Text>
        <Text style={styles.subtitle}>
          {activeTab === 'smart'
            ? 'AI-optimized courses that cover multiple state requirements'
            : 'Browse all available CME courses'}
        </Text>

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
            style={[styles.toggleButton, activeTab === 'all' && styles.toggleButtonActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.toggleText, activeTab === 'all' && styles.toggleTextActive]}>
              All Courses
            </Text>
          </TouchableOpacity>
        </View>

        {/* Smart Match Tab */}
        {activeTab === 'smart' && (
          <>
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

        {/* All Courses Tab */}
        {activeTab === 'all' && (
          <>
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
});
