import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../lib/theme';
import { Card } from './Card';

interface CourseRecommendation {
  id: string;
  course: {
    id: string;
    name: string;
    provider: string;
    description: string | null;
    hours: number;
    price: number;
    url: string | null;
    format: string;
  };
  efficiency_score: number;
  states_covered: string[];
  categories_covered: string[];
  total_credits_toward_gaps: number;
  ai_insight: string;
  breakdown: { state: string; category: string; credits: number }[];
}

interface RecommendationCardProps {
  recommendation: CourseRecommendation;
  rank: number;
  onPress?: () => void;
}

function EfficiencyBadge({ score }: { score: number }) {
  const getScoreColor = () => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.accent;
    return colors.warning;
  };

  return (
    <View style={[styles.efficiencyBadge, { backgroundColor: getScoreColor() + '20' }]}>
      <Text style={[styles.efficiencyScore, { color: getScoreColor() }]}>{score}%</Text>
      <Text style={[styles.efficiencyLabel, { color: getScoreColor() }]}>Match</Text>
    </View>
  );
}

function StatePill({ state }: { state: string }) {
  // Convert full state name to abbreviation for display
  const stateAbbrevs: Record<string, string> = {
    'Texas': 'TX', 'California': 'CA', 'New York': 'NY', 'Florida': 'FL',
    'Illinois': 'IL', 'Pennsylvania': 'PA', 'Ohio': 'OH', 'Georgia': 'GA',
  };
  const abbrev = stateAbbrevs[state] || state.slice(0, 2).toUpperCase();

  return (
    <View style={styles.statePill}>
      <Text style={styles.statePillText}>{abbrev}</Text>
    </View>
  );
}

function CategoryPill({ category }: { category: string }) {
  const categoryLabels: Record<string, string> = {
    'general': 'General',
    'ethics': 'Ethics',
    'pain_management': 'Pain Mgmt',
    'controlled_substances': 'Opioids',
    'risk_management': 'Risk Mgmt',
    'cultural_competency': 'Cultural',
    'infectious_disease': 'Infectious',
  };

  return (
    <View style={styles.categoryPill}>
      <Text style={styles.categoryPillText}>{categoryLabels[category] || category}</Text>
    </View>
  );
}

export function RecommendationCard({ recommendation, rank, onPress }: RecommendationCardProps) {
  const { course, efficiency_score, states_covered, categories_covered, ai_insight } = recommendation;

  const handleViewCourse = () => {
    if (course.url) {
      Linking.openURL(course.url);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(0)}`;
  };

  return (
    <Card style={styles.container}>
      {/* Rank badge */}
      {rank <= 3 && (
        <View style={[
          styles.rankBadge,
          rank === 1 && styles.rankBadgeFirst,
          rank === 2 && styles.rankBadgeSecond,
          rank === 3 && styles.rankBadgeThird,
        ]}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseName} numberOfLines={2}>{course.name}</Text>
          <Text style={styles.provider}>{course.provider}</Text>
        </View>
        <EfficiencyBadge score={efficiency_score} />
      </View>

      {/* AI Insight */}
      <View style={styles.insightContainer}>
        <Ionicons name="sparkles" size={14} color={colors.accent} />
        <Text style={styles.insightText}>{ai_insight}</Text>
      </View>

      {/* States & Categories */}
      <View style={styles.tagsSection}>
        <View style={styles.tagGroup}>
          <Text style={styles.tagLabel}>States:</Text>
          <View style={styles.tagRow}>
            {states_covered.map((state, i) => (
              <StatePill key={i} state={state} />
            ))}
          </View>
        </View>
        <View style={styles.tagGroup}>
          <Text style={styles.tagLabel}>Categories:</Text>
          <View style={styles.tagRow}>
            {categories_covered.slice(0, 3).map((cat, i) => (
              <CategoryPill key={i} category={cat} />
            ))}
            {categories_covered.length > 3 && (
              <View style={styles.morePill}>
                <Text style={styles.morePillText}>+{categories_covered.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{course.hours} hours</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={14} color={colors.textMuted} />
            <Text style={[
              styles.metaText,
              course.price === 0 && styles.freeText
            ]}>
              {formatPrice(course.price)}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewButton} onPress={handleViewCourse}>
          <Text style={styles.viewButtonText}>View Course</Text>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginBottom: spacing.md,
    position: 'relative',
    overflow: 'visible',
  },
  rankBadge: {
    position: 'absolute',
    top: -8,
    left: spacing.md,
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    zIndex: 1,
  },
  rankBadgeFirst: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  rankBadgeSecond: {
    backgroundColor: '#C0C0C0',
    borderColor: '#C0C0C0',
  },
  rankBadgeThird: {
    backgroundColor: '#CD7F32',
    borderColor: '#CD7F32',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  courseInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  courseName: {
    ...typography.label,
    color: colors.text,
    marginBottom: 2,
  },
  provider: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  efficiencyBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 50,
  },
  efficiencyScore: {
    fontSize: 18,
    fontWeight: '700',
  },
  efficiencyLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  insightContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 119, 182, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  insightText: {
    ...typography.caption,
    color: colors.accent,
    flex: 1,
    lineHeight: 18,
  },
  tagsSection: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tagLabel: {
    ...typography.caption,
    color: colors.textMuted,
    width: 70,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statePill: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  categoryPill: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryPillText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  morePill: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  morePillText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: spacing.md,
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
  freeText: {
    color: colors.success,
    fontWeight: '600',
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
});

export default RecommendationCard;
