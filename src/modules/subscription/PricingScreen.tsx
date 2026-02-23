/**
 * CME Agent Pricing Screen Component
 * Beautiful pricing tier display with feature comparison
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscriptionContext } from './SubscriptionContext';
import { SubscriptionTier, TIER_CONFIGS, FEATURE_DESCRIPTIONS } from './types';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing, typography, borderRadius } from '@/src/lib/theme';

const { width } = Dimensions.get('window');

interface PricingScreenProps {
  /**
   * Callback when upgrade is pressed
   */
  onUpgradePress?: (tier: SubscriptionTier) => void;

  /**
   * Callback when contact sales is pressed
   */
  onContactSalesPress?: () => void;

  /**
   * Show loading state
   */
  isProcessing?: boolean;
}

/**
 * Complete pricing screen with tier cards and feature comparison
 */
export function PricingScreen({
  onUpgradePress,
  onContactSalesPress,
  isProcessing = false,
}: PricingScreenProps) {
  const { tier: currentTier } = useSubscriptionContext();
  const [scaleAnims] = useState({
    free: new Animated.Value(1),
    pro: new Animated.Value(1),
    corporate: new Animated.Value(1),
  });

  const handlePressIn = (tier: SubscriptionTier) => {
    Animated.spring(scaleAnims[tier], {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (tier: SubscriptionTier) => {
    Animated.spring(scaleAnims[tier], {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const renderTierCard = (tier: SubscriptionTier) => {
    const config = TIER_CONFIGS[tier];
    const isCurrent = currentTier === tier;
    const isMostPopular = config.isMostPopular;

    return (
      <Animated.View
        key={tier}
        style={[
          styles.cardContainer,
          { transform: [{ scale: scaleAnims[tier] }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.card,
            isCurrent && styles.cardCurrent,
            isMostPopular && !isCurrent && styles.cardPopular,
          ]}
          onPressIn={() => handlePressIn(tier)}
          onPressOut={() => handlePressOut(tier)}
          activeOpacity={1}
          disabled={isProcessing}
        >
          {/* Popular badge */}
          {isMostPopular && !isCurrent && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
            </View>
          )}

          {/* Current badge */}
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
            </View>
          )}

          {/* Card border gradient for current plan */}
          {isCurrent && <LinearGradient
            colors={['#C4A574', '#A68B5B', '#8B7349']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          />}

          {/* Content */}
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.tierName}>{config.name}</Text>
              <Text style={styles.tierDescription}>{config.description}</Text>
            </View>

            {/* Pricing */}
            <View style={styles.pricing}>
              {config.priceMonthly > 0 ? (
                <>
                  <Text style={styles.price}>${config.priceMonthly}</Text>
                  <Text style={styles.billingPeriod}>/month</Text>
                </>
              ) : (
                <Text style={styles.priceCustom}>Custom Pricing</Text>
              )}
            </View>

            {/* Features */}
            <View style={styles.features}>
              {tier === 'free' ? (
                <View style={styles.featureItem}>
                  <Text style={styles.featureName}>✓ Get Started</Text>
                  <Text style={styles.featureDetail}>Perfect for trying CME Agent</Text>
                </View>
              ) : (
                config.features.map((feature) => (
                  <View key={feature} style={styles.featureItem}>
                    <Text style={styles.featureCheckmark}>✓</Text>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureName}>
                        {FEATURE_DESCRIPTIONS[feature].title}
                      </Text>
                      <Text style={styles.featureDetail}>
                        {FEATURE_DESCRIPTIONS[feature].description}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Limits */}
            <View style={styles.limits}>
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Doctors:</Text>
                <Text style={styles.limitValue}>
                  {config.limits.maxDoctors === Infinity ? '∞' : config.limits.maxDoctors}
                </Text>
              </View>
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>State Licenses:</Text>
                <Text style={styles.limitValue}>
                  {config.limits.maxStates === Infinity ? '∞' : config.limits.maxStates}
                </Text>
              </View>
            </View>

            {/* Action button */}
            {isCurrent ? (
              <View style={styles.currentButton}>
                <Text style={styles.currentButtonText}>Your Current Plan</Text>
              </View>
            ) : (
              <Button
                title={tier === 'corporate' ? 'Contact Sales' : `Upgrade to ${config.name}`}
                onPress={() => {
                  if (tier === 'corporate' && onContactSalesPress) {
                    onContactSalesPress();
                  } else if (onUpgradePress) {
                    onUpgradePress(tier);
                  }
                }}
                variant={isMostPopular ? 'primary' : 'outline'}
                size="lg"
                disabled={isProcessing}
                loading={isProcessing}
                style={styles.actionButton}
              />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Simple, Transparent Pricing</Text>
        <Text style={styles.headerSubtitle}>
          Choose the perfect plan for your CME journey
        </Text>
      </View>

      {/* Tier cards */}
      <View style={styles.tiersContainer}>
        {(['free', 'pro', 'corporate'] as const).map(renderTierCard)}
      </View>

      {/* Comparison table */}
      <View style={styles.comparisonSection}>
        <Text style={styles.comparisonTitle}>Feature Comparison</Text>
        <View style={styles.comparisonTable}>
          <ComparisonRow
            feature="Multiple Doctors"
            free="1"
            pro="1"
            corporate="∞"
          />
          <ComparisonRow
            feature="State Licenses"
            free="1"
            pro="∞"
            corporate="∞"
          />
          <ComparisonRow
            feature="Advanced Analytics"
            free="—"
            pro="✓"
            corporate="✓"
          />
          <ComparisonRow
            feature="Custom Branding"
            free="—"
            pro="—"
            corporate="✓"
          />
          <ComparisonRow
            feature="API Access"
            free="—"
            pro="—"
            corporate="✓"
          />
          <ComparisonRow
            feature="Team Management"
            free="—"
            pro="—"
            corporate="✓"
          />
        </View>
      </View>

      {/* FAQ */}
      <View style={styles.faqSection}>
        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

        <FAQItem
          question="Can I change plans anytime?"
          answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle."
        />

        <FAQItem
          question="Is there a free trial?"
          answer="Yes, all paid plans come with a 7-day free trial. No credit card required to start."
        />

        <FAQItem
          question="What payment methods do you accept?"
          answer="We accept all major credit cards, PayPal, and bank transfers for Corporate plans."
        />

        <FAQItem
          question="Do you offer refunds?"
          answer="We offer a 30-day money-back guarantee if you're not completely satisfied."
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          All plans include access to core CME tracking and compliance features
        </Text>
      </View>
    </ScrollView>
  );
}

/**
 * Comparison table row component
 */
function ComparisonRow({
  feature,
  free,
  pro,
  corporate,
}: {
  feature: string;
  free: string;
  pro: string;
  corporate: string;
}) {
  return (
    <View style={styles.comparisonRow}>
      <Text style={styles.comparisonFeature}>{feature}</Text>
      <Text style={styles.comparisonCell}>{free}</Text>
      <Text style={styles.comparisonCell}>{pro}</Text>
      <Text style={styles.comparisonCell}>{corporate}</Text>
    </View>
  );
}

/**
 * FAQ item component
 */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = React.useState(false);
  const animValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animValue, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const heightInterpolation = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Text style={styles.faqToggle}>{expanded ? '−' : '+'}</Text>
      </View>
      {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  tiersContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  cardContainer: {
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  cardCurrent: {
    borderColor: colors.sand[500],
    borderWidth: 2,
  },
  cardPopular: {
    borderColor: colors.sand[400],
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    left: 12,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomLeftRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.sm,
    zIndex: 10,
  },
  popularBadgeText: {
    ...typography.label,
    color: colors.background,
    fontWeight: '700',
    fontSize: 11,
  },
  currentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    zIndex: 10,
  },
  currentBadgeText: {
    ...typography.label,
    color: colors.background,
    fontWeight: '700',
    fontSize: 11,
  },
  cardContent: {
    padding: spacing.lg,
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  tierName: {
    ...typography.h2,
    color: colors.sand[500],
    marginBottom: spacing.xs,
  },
  tierDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  pricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  price: {
    ...typography.h1,
    color: colors.sand[500],
  },
  billingPeriod: {
    ...typography.body,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  priceCustom: {
    ...typography.h2,
    color: colors.sand[500],
  },
  features: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureCheckmark: {
    ...typography.h3,
    color: colors.success,
    width: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  featureDetail: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  limits: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  limitValue: {
    ...typography.body,
    color: colors.sand[500],
    fontWeight: '600',
  },
  actionButton: {
    width: '100%',
  },
  currentButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentButtonText: {
    ...typography.label,
    color: colors.textMuted,
  },
  comparisonSection: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  comparisonTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  comparisonTable: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  comparisonFeature: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  comparisonCell: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  faqSection: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  faqTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  faqItem: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  faqQuestion: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  faqToggle: {
    ...typography.h2,
    color: colors.sand[500],
    marginLeft: spacing.md,
  },
  faqAnswer: {
    ...typography.bodySmall,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
