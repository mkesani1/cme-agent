/**
 * CME Agent Subscription Hook
 * Manages subscription state and feature access
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/hooks/useAuth';
import {
  Subscription,
  SubscriptionTier,
  FeatureKey,
  TIER_CONFIGS,
  SubscriptionContextType,
} from './types';

/**
 * Hook to fetch and manage user subscription
 * Returns subscription state and feature access helpers
 */
export function useSubscription(): SubscriptionContextType {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  /**
   * Fetch subscription from Supabase
   */
  const fetchSubscription = useCallback(async () => {
    if (!user) {
      if (mountedRef.current) {
        setSubscription(null);
        setIsLoading(false);
        setError(null);
      }
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (mountedRef.current) {
        if (fetchError) {
          // If subscription doesn't exist (PGRST116), that's expected for new users
          if (fetchError.code === 'PGRST116') {
            setSubscription(null);
            setError(null);
          } else {
            setError(fetchError as Error);
            console.warn('[Subscription] Fetch error:', fetchError);
          }
        } else if (data) {
          setSubscription(data as Subscription);
          setError(null);
        }
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setSubscription(null);
        setIsLoading(false);
        console.warn('[Subscription] Fetch exception:', error);
      }
    }
  }, [user]);

  /**
   * Initialize subscription on mount and when user changes
   */
  useEffect(() => {
    mountedRef.current = true;
    fetchSubscription();

    return () => {
      mountedRef.current = false;
    };
  }, [user, fetchSubscription]);

  /**
   * Get current tier
   */
  const tier: SubscriptionTier = subscription?.tier || 'free';

  /**
   * Tier shortcuts
   */
  const isFreeTier = tier === 'free';
  const isProTier = tier === 'pro';
  const isCorporateTier = tier === 'corporate';

  /**
   * Check if user can add a doctor
   */
  const canAddDoctor = useCallback(
    (currentCount: number): boolean => {
      const tierConfig = TIER_CONFIGS[tier];
      return currentCount < tierConfig.limits.maxDoctors;
    },
    [tier]
  );

  /**
   * Check if user can add a state license
   */
  const canAddState = useCallback(
    (currentCount: number): boolean => {
      const tierConfig = TIER_CONFIGS[tier];
      return currentCount < tierConfig.limits.maxStates;
    },
    [tier]
  );

  /**
   * Check feature access
   */
  const checkFeatureAccess = useCallback(
    (feature: FeatureKey): boolean => {
      const tierConfig = TIER_CONFIGS[tier];
      return tierConfig.features.includes(feature);
    },
    [tier]
  );

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    await fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    tier,
    isLoading,
    error,
    isFreeTier,
    isProTier,
    isCorporateTier,
    canAddDoctor,
    canAddState,
    checkFeatureAccess,
    refresh,
  };
}
