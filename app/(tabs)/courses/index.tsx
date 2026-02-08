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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, CategoryTag, Button } from '../../../src/components/ui';
import { colors, spacing, typography, CMECategory, cmeCategories } from '../../../src/lib/theme';
import { supabase, db, callEdgeFunction } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/hooks/useAuth';
import { DEMO_MODE, demoCourses } from '../../../src/lib/demoData';

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

interface RecommendedCourse extends Course {
  score?: number;
  reason?: string;
}

const CATEGORIES: (CMECategory | 'all')[] = ['all', 'general', 'controlled_substances', 'risk_management', 'ethics', 'pain_management'];

export default function CoursesScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CMECategory | 'all'>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    // Demo mode: Use mock data when no authenticated user
    if (!user && DEMO_MODE) {
      setCourses(demoCourses.map(c => ({
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
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('credit_hours', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      if (data) setCourses(data as Course[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load courses';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecommendations() {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to get personalized course recommendations.');
      return;
    }

    try {
      setLoadingRecommendations(true);

      // Response has grouped recommendations: { highlyRecommended, recommended, partialMatch }
      interface RecommendationsResponse {
        recommendations: {
          highlyRecommended: RecommendedCourse[];
          recommended: RecommendedCourse[];
          partialMatch: RecommendedCourse[];
        };
        userStates: string[];
        totalLicenses: number;
        message: string;
      }

      const result = await callEdgeFunction<RecommendationsResponse>('getCourseRecommendations');

      // Flatten grouped recommendations into single array, maintaining priority order
      const grouped = result.recommendations || { highlyRecommended: [], recommended: [], partialMatch: [] };
      const flattenedCourses: RecommendedCourse[] = [
        ...grouped.highlyRecommended.map(c => ({ ...c, reason: '⭐ Highly recommended - covers most of your states' })),
        ...grouped.recommended.map(c => ({ ...c, reason: '✓ Recommended for your licenses' })),
        ...grouped.partialMatch.map(c => ({ ...c, reason: 'Partial match - covers some states' })),
      ];

      setRecommendedCourses(flattenedCourses);
      setShowRecommended(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recommendations';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoadingRecommendations(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadCourses();
    if (showRecommended) await loadRecommendations();
    setRefreshing(false);
  }

  const displayCourses = showRecommended ? recommendedCourses : courses;

  const filteredCourses = displayCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function openCourse(url: string | null) {
    if (url) Linking.openURL(url);
  }

  function formatPrice(priceCents: number | null, isFree: boolean | null): string {
    if (isFree) return 'Free';
    if (!priceCents || priceCents === 0) return 'Free';
    return `$${(priceCents / 100).toFixed(0)}`;
  }

  if (loading && courses.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading courses...</Text>
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
          {showRecommended
            ? 'AI-recommended courses optimized for your licenses'
            : 'Discover CME courses that match your requirements'}
        </Text>

        {/* Toggle between All Courses and Recommendations */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, !showRecommended && styles.toggleButtonActive]}
            onPress={() => setShowRecommended(false)}
          >
            <Text style={[styles.toggleText, !showRecommended && styles.toggleTextActive]}>
              All Courses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, showRecommended && styles.toggleButtonActive]}
            onPress={loadRecommendations}
            disabled={loadingRecommendations}
          >
            {loadingRecommendations ? (
              <ActivityIndicator size="small" color={showRecommended ? '#FFFFFF' : colors.accent} />
            ) : (
              <>
                <Ionicons name="sparkles" size={14} color={showRecommended ? '#FFFFFF' : colors.accent} style={{ marginRight: 4 }} />
                <Text style={[styles.toggleText, showRecommended && styles.toggleTextActive]}>
                  For You
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

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

        {/* Error State */}
        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadCourses}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Results count */}
        <Text style={styles.resultsCount}>
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
          {showRecommended && ' (personalized)'}
        </Text>

        {/* Course List */}
        {filteredCourses.map((course) => (
          <Card key={course.id} style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseName}>{course.title}</Text>
                <Text style={styles.courseProvider}>{course.provider}</Text>
                {showRecommended && 'reason' in course && (course as RecommendedCourse).reason && (
                  <View style={styles.reasonContainer}>
                    <Ionicons name="sparkles" size={12} color={colors.accent} />
                    <Text style={styles.reasonText}>{(course as RecommendedCourse).reason}</Text>
                  </View>
                )}
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

        {filteredCourses.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No courses found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No courses available at the moment'}
            </Text>
            {(searchQuery || selectedCategory !== 'all') && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* AI Recommendation CTA (only show when not on recommendations tab) */}
        {!showRecommended && (
          <TouchableOpacity
            style={styles.aiCta}
            onPress={() => router.push('/(tabs)/agent')}
            activeOpacity={0.8}
          >
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={24} color={colors.accent} />
            </View>
            <View style={styles.aiText}>
              <Text style={styles.aiTitle}>Get AI Recommendations</Text>
              <Text style={styles.aiSubtitle}>
                Ask the CME Agent for personalized course suggestions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
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
    marginBottom: spacing.md,
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
  resultsCount: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.md,
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
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reasonText: {
    fontSize: typography.caption.fontSize,
    color: colors.accent,
    marginLeft: 4,
    fontStyle: 'italic',
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
  aiCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  aiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(166, 139, 91, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  aiText: {
    flex: 1,
  },
  aiTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  aiSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: 2,
  },
});
