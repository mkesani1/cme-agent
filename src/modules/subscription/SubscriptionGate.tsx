/**
 * CME Agent Subscription Gate Component
 * Conditionally renders children based on subscription tier
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscriptionContext } from './SubscriptionContext';
import { SubscriptionTier, TIER_CONFIGS, FeatureKey } from './types';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing, typography, borderRadius } from '@/src/lib/theme';

interface SubscriptionGateProps {
  /**
   * Required tier to access children
   */
  requiredTier: SubscriptionTier;

  /**
   * Optional feature to gate on
   */
  feature?: FeatureKey;

  /**
   * Children to render if access granted
   */
  children: React.ReactNode;

  /**
   * Optional callback when upgrade is pressed
   */
  onUpgradePress?: () => void;
}

/**
 * Gate that shows upgrade prompt if user doesn't have required tier
 */
export function SubscriptionGate({
  requiredTier,
  feature,
  children,
  onUpgradePress,
}: SubscriptionGateProps) {
  const { tier, isFreeTier, isProTier, isCorporateTier } = useSubscriptionContext();

  /**
   * Check if user has access
   */
  const hasAccess = (): boolean => {
    const tierOrder: SubscriptionTier[] = ['free', 'pro', 'corporate'];
    const currentIndex = tierOrder.indexOf(tier);
    const requiredIndex = tierOrder.indexOf(requiredTier);
    return currentIndex >= requiredIndex;
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  /**
   * Determine tier name for messaging
   */
  const getTierName = (): string => {
    return TIER_CONFIGS[requiredTier].name;
  };

  /**
   * Determine feature name for messaging
   */
  const getFeatureName = (): string => {
    if (feature) {
      return feature.replace(/_/g, ' ');
    }
    return 'this feature';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#C4A574', '#A68B5B', '#8B7349']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.title}>Premium Feature</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.description}>
            You need {getTierName()} to use {getFeatureName()}
          </Text>

          {/* Tier benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>What you'll get with {getTierName()}:</Text>
            <View style={styles.benefitsList}>
              {TIER_CONFIGS[requiredTier].features.slice(0, 3).map((feature, idx) => (
                <View key={idx} style={styles.benefitItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>{feature.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            {TIER_CONFIGS[requiredTier].priceMonthly > 0 ? (
              <Text style={styles.price}>
                ${TIER_CONFIGS[requiredTier].priceMonthly}
                <Text style={styles.priceUnit}>/mo</Text>
              </Text>
            ) : (
              <Text style={styles.price}>Custom Pricing</Text>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={`Upgrade to ${getTierName()}`}
            onPress={onUpgradePress || (() => {})}
            variant="primary"
            size="lg"
            style={styles.upgradeButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    opacity: 0.1,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.sand[500],
    overflow: 'hidden',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.sand[500],
  },
  content: {
    padding: spacing.lg,
  },
  description: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  benefitsContainer: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  benefitsTitle: {
    ...typography.label,
    color: colors.sand[500],
    marginBottom: spacing.md,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  benefitBullet: {
    ...typography.body,
    color: colors.sand[500],
    lineHeight: 22,
  },
  benefitText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    textTransform: 'capitalize',
  },
  pricingContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  price: {
    ...typography.h2,
    color: colors.sand[500],
  },
  priceUnit: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  actions: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  upgradeButton: {
    width: '100%',
  },
});
