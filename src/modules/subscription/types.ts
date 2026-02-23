/**
 * CME Agent Subscription Module Types
 * Defines all types for subscription management
 */

export type SubscriptionTier = 'free' | 'pro' | 'corporate';
export type SubscriptionStatus = 'active' | 'trialing' | 'cancelled' | 'expired' | 'past_due';
export type SubscriptionPlatform = 'stripe' | 'revenucat' | 'none';

/**
 * Subscription interface matching the Supabase table structure
 */
export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  platform: SubscriptionPlatform | null;
  platform_product_id: string | null;
  platform_subscription_id: string | null;
  billing_period: string | null;
  price_cents: number | null;
  currency: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  agency_id: string | null;
}

/**
 * Feature access levels
 */
export type FeatureKey =
  | 'multiple_doctors'
  | 'unlimited_state_licenses'
  | 'advanced_analytics'
  | 'custom_branding'
  | 'api_access'
  | 'team_management';

/**
 * Tier configuration with features and limits
 */
export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  description: string;
  priceMonthly: number;
  currency: string;
  features: FeatureKey[];
  limits: {
    maxDoctors: number;
    maxStates: number;
  };
  isMostPopular?: boolean;
}

/**
 * All tier configurations
 */
export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started with CME Agent',
    priceMonthly: 0,
    currency: 'USD',
    features: [],
    limits: {
      maxDoctors: 1,
      maxStates: 1,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For individual practitioners',
    priceMonthly: 29,
    currency: 'USD',
    features: ['unlimited_state_licenses', 'advanced_analytics'],
    limits: {
      maxDoctors: 1,
      maxStates: Infinity,
    },
    isMostPopular: true,
  },
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    description: 'For health systems & agencies',
    priceMonthly: 0, // Custom pricing
    currency: 'USD',
    features: [
      'multiple_doctors',
      'unlimited_state_licenses',
      'advanced_analytics',
      'custom_branding',
      'api_access',
      'team_management',
    ],
    limits: {
      maxDoctors: Infinity,
      maxStates: Infinity,
    },
  },
};

/**
 * Feature descriptions for UI display
 */
export const FEATURE_DESCRIPTIONS: Record<FeatureKey, { title: string; description: string }> = {
  multiple_doctors: {
    title: 'Multiple Doctors',
    description: 'Add unlimited doctors to your account',
  },
  unlimited_state_licenses: {
    title: 'Unlimited State Licenses',
    description: 'Manage licenses across all states',
  },
  advanced_analytics: {
    title: 'Advanced Analytics',
    description: 'Track CME credits and compliance across your team',
  },
  custom_branding: {
    title: 'Custom Branding',
    description: 'White-label the app with your organization branding',
  },
  api_access: {
    title: 'API Access',
    description: 'Integrate with your existing systems',
  },
  team_management: {
    title: 'Team Management',
    description: 'Manage roles and permissions for team members',
  },
};

/**
 * Context for subscription state
 */
export interface SubscriptionContextType {
  subscription: Subscription | null;
  tier: SubscriptionTier;
  isLoading: boolean;
  error: Error | null;
  isFreeTier: boolean;
  isProTier: boolean;
  isCorporateTier: boolean;
  canAddDoctor: (currentCount: number) => boolean;
  canAddState: (currentCount: number) => boolean;
  checkFeatureAccess: (feature: FeatureKey) => boolean;
  refresh: () => Promise<void>;
}
