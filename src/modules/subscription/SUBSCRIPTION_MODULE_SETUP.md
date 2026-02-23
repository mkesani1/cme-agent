# CME Agent Subscription Module - Setup & Integration Guide

## Quick Start

The subscription module is now complete and ready to be plugged into your app. Here's exactly how to wire it in.

## Files Created

All files are located in `/src/modules/subscription/`:

```
src/modules/subscription/
├── types.ts                 (3.8 KB) - Type definitions and tier configs
├── useSubscription.ts       (3.7 KB) - React hook for subscription state
├── SubscriptionContext.tsx  (1.2 KB) - Context provider
├── SubscriptionGate.tsx     (6.0 KB) - Feature gating component
├── PricingScreen.tsx        (17 KB)  - Full pricing UI
├── UpgradeModal.tsx         (9.2 KB) - Upgrade modal
├── index.ts                 (781 B)  - Barrel exports
└── README.md                (12 KB)  - Detailed documentation
```

**Total: ~54 KB of production-quality TypeScript/React Native code**

## Step 1: Add SubscriptionProvider to App Root

Open your app root layout (typically `app/_layout.tsx` or `src/app.tsx`):

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

That's it! The subscription context is now available throughout your app.

## Step 2: Use Subscription State in Components

In any component, access subscription data:

```tsx
import { useSubscriptionContext } from '@/src/modules/subscription';

export function MyComponent() {
  const {
    tier,           // 'free' | 'pro' | 'corporate'
    isProTier,      // boolean
    isFreeTier,     // boolean
    isCorporateTier,// boolean
    canAddState,    // (count: number) => boolean
    canAddDoctor,   // (count: number) => boolean
    checkFeatureAccess, // (feature: FeatureKey) => boolean
    refresh,        // () => Promise<void>
    subscription,   // Subscription | null
    isLoading,      // boolean
    error,          // Error | null
  } = useSubscriptionContext();

  if (isLoading) return <LoadingSpinner />;

  if (isProTier) {
    return <ProFeatureComponent />;
  }

  return <FreeFeatureComponent />;
}
```

## Step 3: Gate Features Behind Tiers

Wrap any feature that requires a specific tier:

```tsx
import { SubscriptionGate } from '@/src/modules/subscription';

export function AnalyticsScreen() {
  return (
    <SubscriptionGate
      requiredTier="pro"
      feature="advanced_analytics"
      onUpgradePress={() => navigation.navigate('Pricing')}
    >
      {/* This only renders if user has Pro tier */}
      <AnalyticsContent />
    </SubscriptionGate>
  );
}
```

If the user doesn't have the required tier, they see a beautiful upgrade prompt card with:
- Current tier requirements
- Feature benefits
- Pricing
- Upgrade button

## Step 4: Add Pricing Screen

Create a new route for pricing (or use in a modal):

```tsx
// app/(app)/pricing.tsx
import { PricingScreen, SubscriptionTier } from '@/src/modules/subscription';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

export default function PricingRoute() {
  const navigation = useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    setIsProcessing(true);
    try {
      // TODO: Integrate RevenueCat or Stripe here
      // Example:
      // const { success } = await purchaseSubscription(tier);
      // if (success) {
      //   await refreshSubscription();
      //   navigation.goBack();
      // }
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContactSales = () => {
    // Open email client or web link to contact sales
    // Example: Linking.openURL('mailto:sales@cmeagent.com?subject=Corporate Inquiry');
  };

  return (
    <PricingScreen
      onUpgradePress={handleUpgrade}
      onContactSalesPress={handleContactSales}
      isProcessing={isProcessing}
    />
  );
}
```

## Step 5: Use Upgrade Modal (Optional)

For a modal that appears when user tries to access premium feature:

```tsx
import { UpgradeModal } from '@/src/modules/subscription';
import { useState } from 'react';
import { useSubscriptionContext } from '@/src/modules/subscription';

export function PremiumFeature() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { tier } = useSubscriptionContext();

  const handleAccessPremium = () => {
    if (tier === 'free') {
      setShowUpgradeModal(true);
    } else {
      // Proceed with premium feature
      doPremiumThing();
    }
  };

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      // TODO: Integrate payment here
      // await purchaseSubscription('pro');
      setShowUpgradeModal(false);
      // Refresh subscription context
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button onPress={handleAccessPremium} title="Use Premium Feature" />

      <UpgradeModal
        visible={showUpgradeModal}
        requiredTier="pro"
        feature="advanced_analytics"
        onUpgradePress={handleUpgrade}
        onDismiss={() => setShowUpgradeModal(false)}
        isProcessing={isProcessing}
      />
    </>
  );
}
```

## Understanding the Tier System

### Free Tier
- **Price**: $0
- **Max Doctors**: 1
- **Max States**: 1
- **Features**: None (base features only)

### Pro Tier
- **Price**: $29/month
- **Max Doctors**: 1
- **Max States**: Unlimited
- **Features**:
  - Unlimited state licenses
  - Advanced analytics
- **Highlighted**: "Most Popular" badge

### Corporate Tier
- **Price**: Custom (contact sales)
- **Max Doctors**: Unlimited
- **Max States**: Unlimited
- **Features**:
  - Everything in Pro, plus:
  - Multiple doctors
  - Custom branding
  - API access
  - Team management

## Checking Limits

Use these functions to enforce tier limits:

```tsx
const { canAddDoctor, canAddState } = useSubscriptionContext();

// Check if user can add a new doctor
if (!canAddDoctor(currentDoctorCount)) {
  showUpgradePrompt('pro');
}

// Check if user can add a new state license
if (!canAddState(currentStateCount)) {
  showUpgradePrompt('pro');
}
```

## Checking Feature Access

```tsx
const { checkFeatureAccess } = useSubscriptionContext();

if (checkFeatureAccess('advanced_analytics')) {
  // Show analytics dashboard
}

if (checkFeatureAccess('custom_branding')) {
  // Show branding settings
}
```

## Database

The `subscriptions` table already exists in Supabase with all required columns:

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  platform TEXT,
  platform_product_id TEXT,
  platform_subscription_id TEXT,
  billing_period TEXT,
  price_cents INTEGER,
  currency TEXT,
  trial_started_at TIMESTAMP,
  trial_ends_at TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  canceled_at TIMESTAMP,
  agency_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**No migrations needed** — table is ready to use.

## Payment Integration (When Ready)

The module is designed to work with any payment provider. When you're ready to add payments:

### Option 1: RevenueCat (Recommended for Mobile)

```tsx
import Purchases from 'react-native-purchases';

const handleUpgrade = async (tier: SubscriptionTier) => {
  try {
    const offerings = await Purchases.getOfferings();
    const package_ = offerings.current?.getPackage('pro_monthly');
    const { customerInfo } = await Purchases.purchasePackage(package_);

    // Update subscription in Supabase
    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      tier: 'pro',
      status: 'active',
      platform: 'revenucat',
      platform_product_id: package_.identifier,
      platform_subscription_id: customerInfo.activeSubscriptions[0],
    });

    // Refresh context
    await refresh();
  } catch (error) {
    console.error('Purchase failed:', error);
  }
};
```

### Option 2: Stripe

```tsx
import { initStripe, presentPaymentSheet } from '@stripe/stripe-react-native';

const handleUpgrade = async (tier: SubscriptionTier) => {
  // Call your backend to create payment intent
  const { clientSecret } = await fetch('/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ tier }),
  }).then(r => r.json());

  const { error } = await presentPaymentSheet();

  if (!error) {
    // Update subscription
    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      tier,
      status: 'active',
      platform: 'stripe',
    });
  }
};
```

### Option 3: Custom Backend

```tsx
const handleUpgrade = async (tier: SubscriptionTier) => {
  const { subscriptionId } = await yourBackend.createSubscription(tier);

  await supabase.from('subscriptions').upsert({
    user_id: user.id,
    tier,
    status: 'active',
    platform: 'custom',
    platform_subscription_id: subscriptionId,
  });

  await refresh();
};
```

## Server-Side Enforcement

**Important**: Always validate tier limits on the backend as well:

```sql
-- When creating a state license
CREATE OR REPLACE FUNCTION create_state_license()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
  state_count INTEGER;
  max_states INTEGER;
BEGIN
  -- Get user's tier
  SELECT s.tier INTO user_tier
  FROM subscriptions s
  WHERE s.user_id = NEW.user_id
  ORDER BY s.created_at DESC
  LIMIT 1;

  -- Default to free if no subscription
  IF user_tier IS NULL THEN
    user_tier := 'free';
  END IF;

  -- Count existing states
  SELECT COUNT(*) INTO state_count
  FROM state_licenses
  WHERE user_id = NEW.user_id;

  -- Check limit
  CASE user_tier
    WHEN 'free' THEN max_states := 1;
    WHEN 'pro' THEN max_states := 999;
    WHEN 'corporate' THEN max_states := 999;
  END CASE;

  IF state_count >= max_states THEN
    RAISE EXCEPTION 'State license limit reached for tier: %', user_tier;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Styling

All components use the app's existing design system:

- **Navy**: #0D1321, #1D2A3F, #2A3A52
- **Gold/Sand**: #A68B5B, #D4C4B0, #8B7349
- **Gold Gradient**: linear-gradient(135deg, #C4A574, #A68B5B, #8B7349)
- **Typography**: Inter (system fonts in React Native)

Components are fully styled with:
- Beautiful gradients on cards
- Smooth animations with Animated API
- Proper shadows and elevation
- Responsive design
- Dark theme optimized

## Testing

To test locally:

1. Wrap your app with `SubscriptionProvider`
2. Check no errors in console
3. Create a test user
4. Manually set tier to 'pro' in Supabase `subscriptions` table
5. Verify UI shows correct tier
6. Test gating by changing tier back to 'free'
7. Verify upgrade prompt appears

## Troubleshooting

### "useSubscriptionContext must be used within a SubscriptionProvider"

**Solution**: Make sure SubscriptionProvider wraps your app at the root level:

```tsx
<AuthProvider>
  <SubscriptionProvider>  {/* Add this */}
    <RootStack />
  </SubscriptionProvider>
</AuthProvider>
```

### Subscription always shows as 'free'

**Reasons**:
1. No row in `subscriptions` table for user — create one with `tier: 'pro'`
2. User not authenticated — check useAuth returns a user
3. Supabase query failing — check logs, verify RLS policies allow reads

### Payment integration failing

**Checklist**:
1. RevenueCat/Stripe credentials configured
2. Product IDs match in payment platform
3. Supabase update completing after purchase
4. Context refresh called after purchase

## Next Steps

1. ✅ Add SubscriptionProvider to app root
2. ✅ Gate your premium features
3. ✅ Add pricing screen to router
4. 📝 Connect RevenueCat or Stripe (when ready)
5. 📝 Add server-side tier enforcement
6. 📝 Set up webhook handlers for payment updates
7. 📝 Add trial period logic (if needed)
8. 📝 Add dunning flow for failed payments (if needed)

## Questions?

Refer to `/src/modules/subscription/README.md` for complete API reference and examples.

The module is **production-ready** and **fully typed**. You can safely integrate it into your app and add payments later when ready.
