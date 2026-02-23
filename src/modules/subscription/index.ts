/**
 * CME Agent Subscription Module
 * Complete subscription management system (pluggable)
 *
 * Export everything needed to integrate subscriptions into the app
 */

// Types
export {
  type SubscriptionTier,
  type SubscriptionStatus,
  type SubscriptionPlatform,
  type Subscription,
  type FeatureKey,
  type TierConfig,
  TIER_CONFIGS,
  FEATURE_DESCRIPTIONS,
  type SubscriptionContextType,
} from './types';

// Hook
export { useSubscription } from './useSubscription';

// Context & Provider
export {
  SubscriptionProvider,
  useSubscriptionContext,
  SubscriptionContext,
} from './SubscriptionContext';

// Components
export { SubscriptionGate } from './SubscriptionGate';
export { PricingScreen } from './PricingScreen';
export { UpgradeModal } from './UpgradeModal';
