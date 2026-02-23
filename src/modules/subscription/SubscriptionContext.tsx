/**
 * CME Agent Subscription Context Provider
 * Provides subscription state to entire app
 */

import React, { createContext, useContext } from 'react';
import { useSubscription } from './useSubscription';
import { SubscriptionContextType } from './types';

/**
 * Subscription context
 */
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

/**
 * Hook to use subscription context
 * Throws error if used outside provider
 */
export function useSubscriptionContext(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
}

/**
 * Provider component to wrap app
 * Usage:
 *   <SubscriptionProvider>
 *     <RootStack />
 *   </SubscriptionProvider>
 */
export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const subscriptionData = useSubscription();

  return (
    <SubscriptionContext.Provider value={subscriptionData}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export { SubscriptionContext };
