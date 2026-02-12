import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../lib/theme';
import { Card } from './Card';

interface GapsSummary {
  total_deficit_hours: number;
  licenses_with_gaps: number;
  most_urgent: {
    state: string;
    days_until_expiry: number;
    deficit: number;
  } | null;
}

interface GapsSummaryCardProps {
  summary: GapsSummary | null;
  loading?: boolean;
}

export function GapsSummaryCard({ summary, loading }: GapsSummaryCardProps) {
  if (loading) {
    return (
      <Card style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing your requirements...</Text>
        </View>
      </Card>
    );
  }

  if (!summary || summary.total_deficit_hours === 0) {
    return (
      <Card style={[styles.container, styles.completeContainer]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>All Requirements Complete!</Text>
            <Text style={styles.subtitle}>You're up to date on all CME credits</Text>
          </View>
        </View>
      </Card>
    );
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 30) return colors.risk;
    if (days <= 90) return colors.warning;
    return colors.accent;
  };

  const getUrgencyLabel = (days: number) => {
    if (days <= 30) return 'Critical';
    if (days <= 90) return 'Soon';
    return 'Upcoming';
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="analytics" size={24} color={colors.accent} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Your CME Gaps</Text>
          <Text style={styles.subtitle}>AI-analyzed deficits across your licenses</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{summary.total_deficit_hours}</Text>
          <Text style={styles.statLabel}>Hours Needed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{summary.licenses_with_gaps}</Text>
          <Text style={styles.statLabel}>Licenses with Gaps</Text>
        </View>
      </View>

      {summary.most_urgent && (
        <View style={[
          styles.urgentSection,
          { borderLeftColor: getUrgencyColor(summary.most_urgent.days_until_expiry) }
        ]}>
          <View style={styles.urgentHeader}>
            <View style={[
              styles.urgentBadge,
              { backgroundColor: getUrgencyColor(summary.most_urgent.days_until_expiry) + '20' }
            ]}>
              <Text style={[
                styles.urgentBadgeText,
                { color: getUrgencyColor(summary.most_urgent.days_until_expiry) }
              ]}>
                {getUrgencyLabel(summary.most_urgent.days_until_expiry)}
              </Text>
            </View>
            <Text style={styles.urgentState}>{summary.most_urgent.state}</Text>
          </View>
          <Text style={styles.urgentDetail}>
            {summary.most_urgent.deficit} credits needed in {summary.most_urgent.days_until_expiry} days
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  completeContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(166, 139, 91, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  urgentSection: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderLeftWidth: 3,
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  urgentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  urgentState: {
    ...typography.label,
    color: colors.text,
  },
  urgentDetail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default GapsSummaryCard;
