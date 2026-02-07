import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../../lib/theme';
import { useFadeInUp, usePulseGlow } from '../../lib/animations';
import { Card } from './Card';

interface AISuggestion {
  id: string;
  title: string;
  provider: string;
  hours: number;
  categories: string[];
  efficiencyScore: number;
  insight: string;
  providerLogo?: string;
}

interface SmartSuggestionsProps {
  suggestions: AISuggestion[];
  onSuggestionPress?: (suggestion: AISuggestion) => void;
}

function EfficiencyBadge({ score }: { score: number }) {
  const glowOpacity = usePulseGlow();

  return (
    <View style={styles.efficiencyBadge}>
      <Animated.View
        style={[
          styles.efficiencyGlow,
          { opacity: glowOpacity },
        ]}
      />
      <Text style={styles.efficiencyScore}>{score}%</Text>
      <Text style={styles.efficiencyLabel}>Match</Text>
    </View>
  );
}

function SuggestionCard({
  suggestion,
  index,
  onPress,
}: {
  suggestion: AISuggestion;
  index: number;
  onPress?: () => void;
}) {
  const animStyle = useFadeInUp(200 + index * 100);

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.suggestionCard}
      >
        <View style={styles.suggestionHeader}>
          <View style={styles.providerInfo}>
            <View style={styles.providerLogo}>
              <Ionicons name="school" size={20} color={colors.accent} />
            </View>
            <View style={styles.providerText}>
              <Text style={styles.suggestionTitle} numberOfLines={2}>
                {suggestion.title}
              </Text>
              <Text style={styles.providerName}>{suggestion.provider}</Text>
            </View>
          </View>
          <EfficiencyBadge score={suggestion.efficiencyScore} />
        </View>

        <View style={styles.suggestionMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{suggestion.hours} hours</Text>
          </View>
          <View style={styles.categoryTags}>
            {suggestion.categories.slice(0, 2).map((cat, i) => (
              <View key={i} style={styles.miniTag}>
                <Text style={styles.miniTagText}>{cat}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.insightContainer}>
          <Ionicons name="sparkles" size={14} color={colors.accent} />
          <Text style={styles.insightText}>{suggestion.insight}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function SmartSuggestions({
  suggestions,
  onSuggestionPress,
}: SmartSuggestionsProps) {
  const headerAnim = useFadeInUp(0);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerAnim]}>
        <View style={styles.headerIcon}>
          <Ionicons name="bulb" size={20} color={colors.accent} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Smart Suggestions</Text>
          <Text style={styles.headerSubtitle}>AI-powered recommendations for you</Text>
        </View>
      </Animated.View>

      <View style={styles.suggestionsList}>
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            index={index}
            onPress={() => onSuggestionPress?.(suggestion)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  suggestionsList: {
    gap: spacing.md,
  },
  suggestionCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  providerInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.sm,
    marginRight: spacing.sm,
  },
  providerLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerText: {
    flex: 1,
  },
  suggestionTitle: {
    ...typography.label,
    color: colors.text,
    marginBottom: 2,
  },
  providerName: {
    ...typography.caption,
    color: colors.textMuted,
  },
  efficiencyBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  efficiencyGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.glow,
  },
  efficiencyScore: {
    ...typography.h3,
    color: colors.accent,
  },
  efficiencyLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  suggestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  categoryTags: {
    flexDirection: 'row',
    gap: 6,
  },
  miniTag: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniTagText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  insightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(166, 139, 91, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  insightText: {
    ...typography.caption,
    color: colors.accent,
    flex: 1,
  },
});

export type { AISuggestion };
