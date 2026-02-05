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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CategoryTag, Button } from '../../../src/components/ui';
import { colors, spacing, typography, CMECategory, cmeCategories } from '../../../src/lib/theme';

// Mock course data - in production, this would come from an API
const MOCK_COURSES = [
  {
    id: '1',
    name: 'Opioid Prescribing: Safe Practices',
    provider: 'AMA Ed Hub',
    hours: 3,
    category: 'controlled_substances' as CMECategory,
    price: 0,
    url: 'https://edhub.ama-assn.org/',
    description: 'Learn safe opioid prescribing practices and risk mitigation strategies.',
  },
  {
    id: '2',
    name: 'Medical Ethics in the Digital Age',
    provider: 'AAFP',
    hours: 2,
    category: 'ethics' as CMECategory,
    price: 0,
    url: 'https://www.aafp.org/cme/',
    description: 'Explore ethical considerations in telemedicine and digital health.',
  },
  {
    id: '3',
    name: 'Risk Management for Physicians',
    provider: 'MedPro',
    hours: 4,
    category: 'risk_management' as CMECategory,
    price: 49,
    url: 'https://www.medpro.com/',
    description: 'Strategies to reduce malpractice risk and improve patient safety.',
  },
  {
    id: '4',
    name: 'Pain Management Update 2026',
    provider: 'Stanford CME',
    hours: 5,
    category: 'pain_management' as CMECategory,
    price: 99,
    url: 'https://med.stanford.edu/cme/',
    description: 'Latest evidence-based approaches to chronic pain management.',
  },
  {
    id: '5',
    name: 'General Internal Medicine Review',
    provider: 'UpToDate',
    hours: 10,
    category: 'general' as CMECategory,
    price: 0,
    url: 'https://www.uptodate.com/',
    description: 'Comprehensive review of internal medicine topics with CME credits.',
  },
  {
    id: '6',
    name: 'Controlled Substances: DEA Requirements',
    provider: 'DEA Education',
    hours: 2,
    category: 'controlled_substances' as CMECategory,
    price: 0,
    url: 'https://www.deadiversion.usdoj.gov/',
    description: 'Understanding DEA requirements for controlled substance prescribing.',
  },
];

const CATEGORIES: (CMECategory | 'all')[] = ['all', 'general', 'controlled_substances', 'risk_management', 'ethics', 'pain_management'];

export default function CoursesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CMECategory | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading initial course data
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredCourses = MOCK_COURSES.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function openCourse(url: string) {
    Linking.openURL(url);
  }

  if (loading) {
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Find Courses</Text>
        <Text style={styles.subtitle}>
          Discover CME courses that match your requirements
        </Text>

        {/* Search */}
        <View style={styles.searchContainer}>
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
                {cat === 'all' ? 'All' : cmeCategories[cat].label}
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
                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.courseProvider}>{course.provider}</Text>
              </View>
              <View style={styles.courseHours}>
                <Text style={styles.hoursNumber}>{course.hours}</Text>
                <Text style={styles.hoursLabel}>hrs</Text>
              </View>
            </View>

            <Text style={styles.courseDescription}>{course.description}</Text>

            <View style={styles.courseFooter}>
              <CategoryTag category={course.category} size="sm" />
              <View style={styles.courseMeta}>
                <Text style={styles.coursePrice}>
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </Text>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => openCourse(course.url)}
                >
                  <Text style={styles.viewButtonText}>View →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}

        {filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
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
        ) : null}

        {/* AI Recommendation CTA */}
        <TouchableOpacity style={styles.aiCta}>
          <Text style={styles.aiIcon}>🤖</Text>
          <View style={styles.aiText}>
            <Text style={styles.aiTitle}>Get AI Recommendations</Text>
            <Text style={styles.aiSubtitle}>
              Ask the CME Agent for personalized course suggestions
            </Text>
          </View>
        </TouchableOpacity>
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
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
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
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  coursePrice: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.success,
  },
  viewButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  aiCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '10',
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  aiIcon: {
    fontSize: 32,
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
    color: colors.textSecondary,
  },
});
