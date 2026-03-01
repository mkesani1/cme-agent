/**
 * CME Agent Upgrade Modal Component
 * Modal shown when gated feature is accessed
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SubscriptionTier, TIER_CONFIGS, FEATURE_DESCRIPTIONS, FeatureKey } from './types';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing, typography, borderRadius } from '@/src/lib/theme';

const { height } = Dimensions.get('window');

interface UpgradeModalProps {
  /**
   * Whether modal is visible
   */
  visible: boolean;

  /**
   * Tier required to access feature
   */
  requiredTier: SubscriptionTier;

  /**
   * Feature that is gated
   */
  feature?: FeatureKey;

  /**
   * Callback when upgrade is pressed
   */
  onUpgradePress: () => void;

  /**
   * Callback when modal is dismissed
   */
  onDismiss: () => void;

  /**
   * Optional loading state
   */
  isProcessing?: boolean;
}

/**
 * Modal that appears when user tries to access premium feature
 */
export function UpgradeModal({
  visible,
  requiredTier,
  feature,
  onUpgradePress,
  onDismiss,
  isProcessing = false,
}: UpgradeModalProps) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const tierConfig = TIER_CONFIGS[requiredTier];
  const featureName = feature ? FEATURE_DESCRIPTIONS[feature].title : 'This feature';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity style={styles.overlayTouchable} onPress={onDismiss} disabled={isProcessing} />
      </Animated.View>

      {/* Modal content */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Drag indicator */}
        <View style={styles.dragIndicator} />

        {/* Header with gradient */}
        <LinearGradient
          colors={['#00B4D8', '#0077B6', '#0064A6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerIcon}>⭐</Text>
          <Text style={styles.headerTitle}>{tierConfig.name} Feature</Text>
          <Text style={styles.headerSubtitle}>Unlock premium capabilities</Text>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Feature description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>You're trying to access:</Text>
            <View style={styles.featureBox}>
              <Text style={styles.featureTitle}>{featureName}</Text>
              {feature && (
                <Text style={styles.featureDescription}>
                  {FEATURE_DESCRIPTIONS[feature].description}
                </Text>
              )}
            </View>
          </View>

          {/* What you'll get */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>With {tierConfig.name}, you get:</Text>
            <View style={styles.benefitsList}>
              {tierConfig.features.slice(0, 4).map((feat, idx) => (
                <View key={idx} style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>
                    {FEATURE_DESCRIPTIONS[feat].title}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.pricingBox}>
            {tierConfig.priceMonthly > 0 ? (
              <>
                <Text style={styles.priceLabel}>Special Launch Price</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>${tierConfig.priceMonthly}</Text>
                  <Text style={styles.pricePeriod}>/month</Text>
                </View>
                <Text style={styles.priceDetail}>Billed monthly, cancel anytime</Text>
              </>
            ) : (
              <>
                <Text style={styles.priceLabel}>Custom Pricing</Text>
                <Text style={styles.priceCustom}>Contact Sales</Text>
                <Text style={styles.priceDetail}>Volume discounts available</Text>
              </>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={`Upgrade to ${tierConfig.name}`}
            onPress={onUpgradePress}
            variant="primary"
            size="lg"
            disabled={isProcessing}
            loading={isProcessing}
            style={styles.upgradeButton}
          />
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            disabled={isProcessing}
          >
            <Text style={styles.dismissButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  overlayTouchable: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  dragIndicator: {
    width: 48,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: spacing.md,
  },
  header: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  featureBox: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureTitle: {
    ...typography.h3,
    color: colors.sand[500],
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  benefitIcon: {
    ...typography.h3,
    color: colors.success,
  },
  benefitText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  pricingBox: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  priceLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  price: {
    ...typography.h1,
    color: colors.sand[500],
  },
  pricePeriod: {
    ...typography.body,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  priceCustom: {
    ...typography.h2,
    color: colors.sand[500],
    marginVertical: spacing.md,
  },
  priceDetail: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  upgradeButton: {
    width: '100%',
  },
  dismissButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dismissButtonText: {
    ...typography.label,
    color: colors.textMuted,
  },
});
