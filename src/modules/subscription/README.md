# CME Agent Subscription Module

A complete, pluggable subscription management system for the CME Agent Expo/React Native app. This module handles tier management, feature gating, and pricing display without being deployed yet.

## Overview

The subscription module provides:

- **3 Pricing Tiers**: Free, Pro ($29/mo), Corporate (custom)
- **Feature Gating**: Restrict features to specific tiers
- **Beautiful UI Components**: Pricing screen, upgrade modal, gating UI
- **Context-Based State**: Global subscription state via React Context
- **Type Safety**: Full TypeScript support
- **Payment Ready**: Stubs for RevenueCat/Stripe integration

## Database

The Supabase `subscriptions` table already exists with all required columns:

```sql
- id (UUID, primary key)
- user_id (UUID, foreign key to profiles)
- tier ('free' | 'pro' | 'corporate')
- status ('active' | 'trialing' | 'cancelled' | 'expired' | 'past_due')
- platform ('stripe' | 'revenucat' | null)
- platform_product_id (string)
- platform_subscription_id (string)
- billing_period (string)
- price_cents (integer)
- currency (string)
- trial_started_at (timestamp)
- trial_ends_at (timestamp)
- current_period_start (timestamp)
- current_period_end (timestamp)
- canceled_at (timestamp)
- agency_id (UUID, for Corporate subscriptions)
- created_at (timestamp)
- updated_at (timestamp)
```

No migrations needed — table is ready to use.

## Pricing Tiers

### Free
- **Price**: $0/month
- **Max Doctors**: 1
- **Max State Licenses**: 1
- **Features**: None (base features only)

### Pro
- **Price**: $29/month
- **Max Doctors**: 1
- **Max State Licenses**: Unlimited
- **Features**:
  - Unlimited state licenses
  - Advanced analytics
- **Most Popular**: Yes (highlighted in pricing screen)

### Corporate
- **Price**: Custom (contact sales)
- **Max Doctors**: Unlimited
- **Max State Licenses**: Unlimited
- **Features**:
  - Multiple doctors
  - Unlimited state licenses
  - Advanced analytics
  - Custom branding
  - API access
  - Team management

## Integration Guide

### 1. Add SubscriptionProvider to App Root

In your `_layout.tsx` or app root, wrap the entire app:

```tsx
import { SubscriptionProvider } from '@/src/modules/subscription';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <RootStack />
      </SubscriptionProvider>
    </AuthProvider>
  );
}
```

### 2. Use Subscription Hook in Components

Access subscription state anywhere in the app:

```tsx
import { useSubscriptionContext } from '@/src/modules/subscription';

export function MyComponent() {
  const { tier, isProTier, canAddState, checkFeatureAccess } = useSubscriptionContext();

  // Check tier
  if (isProTier) {
    return <Text>You have Pro access!</Text>;
  }

  // Check limits
  if (!canAddState(licenseCount)) {
    return <Text>Upgrade to add more states</Text>;
  }

  // Check features
  if (checkFeatureAccess('advanced_analytics')) {
    return <AnalyticsComponent />;
  }

  return null;
}
```

### 3. Gate Features with SubscriptionGate

Wrap features that require a specific tier:

```tsx
import { SubscriptionGate } from '@/src/modules/subscription';

export function AnalyticsScreen() {
  return (
    <SubscriptionGate
      requiredTier="pro"
      feature="advanced_analytics"
      onUpgradePress={() => navigation.navigate('Pricing')}
    >
      <AnalyticsContent />
    </SubscriptionGate>
  );
}
```

The gate automatically shows a beautiful upgrade prompt if the user doesn't have access.

### 4. Add Pricing Screen to Router

Create a pricing route in your app:

```tsx
// app/(app)/pricing.tsx
import { PricingScreen } from '@/src/modules/subscription';
import { useNavigation } from '@react-navigation/native';

export default function PricingRoute() {
  const navigation = useNavigation();

  const handleUpgrade = (tier: SubscriptionTier) => {
    // TODO: Integrate RevenueCat or Stripe here
    console.log('Upgrade to:', tier);
  };

  const handleContactSales = () => {
    // Open email or web view to contact sales
  };

  return (
    <PricingScreen
      onUpgradePress={handleUpgrade}
      onContactSalesPress={handleContactSales}
    />
  );
}
```

### 5. Show Upgrade Modal

Use the modal when user tries to access a premium feature:

```tsx
import { UpgradeModal } from '@/src/modules/subscription';
import { useState } from 'react';

export function PremiumFeature() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { tier } = useSubscriptionContext();

  const handleAccessPremium = () => {
    if (tier === 'free') {
      setShowUpgradeModal(true);
    } else {
      // Proceed with premium feature
    }
  };

  return (
    <>
      <Button onPress={handleAccessPremium} title="Use Feature" />

      <UpgradeModal
        visible={showUpgradeModal}
        requiredTier="pro"
        feature="advanced_analytics"
        onUpgradePress={() => {
          // TODO: Integrate payment
          setShowUpgradeModal(false);
        }}
        onDismiss={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
```

## Tier Enforcement Logic

The subscription system enforces limits at multiple levels:

### Hook Level
```tsx
const { canAddDoctor, canAddState } = useSubscriptionContext();

if (!canAddState(currentStateCount)) {
  // Show upgrade prompt
}
```

### Component Level
```tsx
<SubscriptionGate requiredTier="pro">
  <PremiumContent />
</SubscriptionGate>
```

### Backend Level (to implement)
- On state license creation, check user's tier limits
- On doctor profile creation, verify tier allows multiple doctors
- Reject API calls that exceed tier limits with clear error messages

## Payment Integration (TODO)

The module is ready for payment integration. When you're ready to enable payments:

### RevenueCat Integration
```tsx
// In your upgrade handler:
import Purchases from 'react-native-purchases';

const handleUpgrade = async (tier: SubscriptionTier) => {
  try {
    const offerings = await Purchases.getOfferings();
    const package_ = offerings.current?.getPackage(`pro_monthly`); // or similar
    const { customerInfo } = await Purchases.purchasePackage(package_);

    // Update subscription in Supabase
    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      tier: 'pro',
      platform: 'revenueat',
      platform_product_id: package_.identifier,
      platform_subscription_id: customerInfo.activeSubscriptions[0],
      status: 'active',
      // ... other fields
    });
  } catch (err) {
    console.error('Purchase failed:', err);
  }
};
```

### Stripe Integration
```tsx
// In your upgrade handler:
import { initStripe, presentPaymentSheet } from '@stripe/stripe-react-native';

const handleUpgrade = async (tier: SubscriptionTier) => {
  // Call your backend to create payment intent
  const { clientSecret } = await createPaymentIntent(tier);

  const { error } = await presentPaymentSheet();

  if (!error) {
    // Update subscription in Supabase
    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      tier,
      platform: 'stripe',
      status: 'active',
      // ... other fields
    });
  }
};
```

### Custom Platform Integration
```tsx
const handleUpgrade = async (tier: SubscriptionTier) => {
  // Call your own backend API
  const { subscriptionId } = await yourBackend.createSubscription(tier);

  // Update Supabase
  await supabase.from('subscriptions').upsert({
    user_id: user.id,
    tier,
    platform: 'your_platform',
    platform_subscription_id: subscriptionId,
    status: 'active',
  });
};
```

## API Reference

### Types

```tsx
type SubscriptionTier = 'free' | 'pro' | 'corporate';
type SubscriptionStatus = 'active' | 'trialing' | 'cancelled' | 'expired' | 'past_due';
type FeatureKey = 'multiple_doctors' | 'unlimited_state_licenses' | ... // See types.ts

interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  // ... all other Supabase columns
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  tier: SubscriptionTier;
  isLoading: boolean;
  error: Error | null;
  isFreeTier: boolean;
  isProTier: boolean;
  isCorporateTier: boolean;
  canAddDoctor(currentCount: number): boolean;
  canAddState(currentCount: number): boolean;
  checkFeatureAccess(feature: FeatureKey): boolean;
  refresh(): Promise<void>;
}
```

### Hooks

```tsx
// Get subscription state anywhere in app
const subscription = useSubscriptionContext();

// Or use individual useSubscription hook
const { tier, canAddState, checkFeatureAccess, refresh } = useSubscription();
```

### Components

```tsx
// Gate a feature behind a tier
<SubscriptionGate
  requiredTier="pro"
  feature="advanced_analytics"
  onUpgradePress={handleUpgrade}
>
  <AnalyticsScreen />
</SubscriptionGate>

// Show full pricing screen
<PricingScreen
  onUpgradePress={(tier) => handleUpgrade(tier)}
  onContactSalesPress={() => openSalesContact()}
/>

// Show upgrade modal
<UpgradeModal
  visible={showModal}
  requiredTier="pro"
  feature="advanced_analytics"
  onUpgradePress={handleUpgrade}
  onDismiss={() => setShowModal(false)}
/>
```

## Styling & Design

All components use the app's existing design system:

- **Navy** (#0D1321, #1D2A3F, #2A3A52) for dark backgrounds
- **Gold** (#A68B5B, #D4C4B0, #8B7349) for accents
- **Gold Gradient** (linear-gradient(135deg, #C4A574, #A68B5B, #8B7349))
- **Typography**: Inter (via system fonts in React Native)
- **Shadows & Elevation**: Proper shadows for card depth
- **Animations**: Smooth transitions with Animated API

The PricingScreen features:
- Beautiful gradient headers
- Smooth scale animations on card interaction
- Expandable FAQ section
- Feature comparison table
- Current plan highlighting

## Testing

To test the subscription module locally:

1. Wrap your app root with `SubscriptionProvider`
2. Check that `useSubscriptionContext` doesn't throw errors
3. Test gate logic by creating a test user with different tiers
4. Verify pricing screen renders correctly
5. Test upgrade modal animations and interactions

## Architecture

```
subscription/
├── types.ts              # Type definitions, tier configs
├── useSubscription.ts    # Hook for subscription state
├── SubscriptionContext.tsx # Context provider
├── SubscriptionGate.tsx  # Feature gating component
├── PricingScreen.tsx     # Full pricing UI
├── UpgradeModal.tsx      # Modal for upgrades
├── index.ts              # Barrel exports
└── README.md             # This file
```

The module is **self-contained** — no dependencies on other modules except:
- `@/src/lib/supabase` (Supabase client)
- `@/src/hooks/useAuth` (Auth context)
- `@/src/lib/theme` (Design system colors)
- `@/src/components/ui/Button` (Reusable button)

## Future Enhancements

- [ ] Subscription webhook handler for payment platform updates
- [ ] Analytics integration (track upgrade conversions)
- [ ] Trial period management
- [ ] Dunning/failed payment handling
- [ ] Usage-based billing for Enterprise tier
- [ ] Multi-currency support
- [ ] Proration handling for mid-cycle upgrades
- [ ] Subscription pause/resume
- [ ] Annual billing with discounts

## Questions?

The module is designed to be plugged into the app as-is. All payment integration is optional — you can gate features now and add payments later.
