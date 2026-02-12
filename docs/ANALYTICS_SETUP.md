# CME Agent - Analytics & Error Monitoring Setup Guide

## Overview

This guide provides recommendations for implementing error monitoring and analytics in the CME Agent React Native/Expo app. The recommendations prioritize ease of integration, free tier generosity, and strong React Native/Expo support.

---

## 1. ERROR MONITORING SOLUTION: SENTRY

### Why Sentry?

Sentry is the recommended error monitoring solution for CME Agent based on:

- **Best Expo Integration**: Native Expo support with minimal setup via Sentry CLI
- **Generous Free Tier**: 5,000 events/month (sufficient for early-stage apps)
- **Wide Adoption**: 562K+ weekly npm downloads for React Native SDK
- **Rich Features**: Session replay, breadcrumbs, source map support, performance monitoring
- **Mobile-Optimized**: Handles native crashes, ANR detection, and mobile-specific errors

### Alternatives Comparison

| Tool | Setup | Free Tier | Expo Support | Best For |
|------|-------|-----------|--------------|----------|
| **Sentry** | CLI wizard (easiest) | 5K events/mo | Excellent | Best overall choice |
| Bugsnag | CLI-based | Similar | Good | Advanced mobile features |
| Raygun | Manual | Limited | Fair | RUM-focused teams |

### Installation & Setup

#### Step 1: Create Sentry Account & Project

```bash
# Sign up at https://sentry.io and create a new Expo project
# You'll receive a DSN (Data Source Name) like: https://xxx@xxx.ingest.sentry.io/xxx
```

#### Step 2: Install Dependencies

```bash
npx expo install @sentry/react-native @react-native-camera-roll/camera-roll
```

#### Step 3: Use Sentry Wizard (Recommended)

```bash
npm exec @sentry/wizard@latest -i reactNative
```

This wizard will:
- Automatically patch your project configuration
- Set up Metro bundler configuration
- Configure Expo app.json settings
- Handle source map uploads

#### Step 4: Manual Configuration (if wizard doesn't work)

**Add to `app.json`:**

```json
{
  "plugins": [
    [
      "@sentry/react-native/expo",
      {
        "organization": "your-org",
        "project": "your-project",
        "authToken": "your-auth-token"
      }
    ]
  ]
}
```

**Add to `metro.config.js`:**

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const sentryMetroExports = require('@sentry/react-native/metro');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  ...sentryMetroExports.withSentryMetroExports(config.transformer),
};

module.exports = config;
```

#### Step 5: Initialize Sentry in Your App

**Create `lib/sentry.ts`:**

```typescript
import * as Sentry from '@sentry/react-native';
import { SENTRY_DSN } from '@env';

export const initSentry = () => {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    enableNativeFrameMetrics: true,
    integrations: [
      new Sentry.Native.AndroidActivityLifecycleIntegration(),
      new Sentry.Native.ReleaseHealthIntegration(),
    ],
    // Capture breadcrumbs for user actions
    maxBreadcrumbs: 100,
  });
};
```

**Update `app.tsx` or `index.tsx`:**

```typescript
import { initSentry } from './lib/sentry';

// Call this as early as possible
initSentry();

export default function App() {
  return (
    // Your app content
  );
}
```

#### Step 6: Set Environment Variables

**Create `.env` file:**

```
SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID
SENTRY_AUTH_TOKEN=your_auth_token_here
```

**Add to `.env.local` for local development:**

```
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### Capturing Errors Manually

```typescript
import * as Sentry from '@sentry/react-native';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'course-completion',
      user_role: 'physician',
    },
  });
}

// Custom messages
Sentry.captureMessage('CME credit award failed', 'error');
```

### Free Tier Limits

- **5,000 events/month** (includes errors, transactions, and replays)
- Source map uploads included
- Basic session replay limited
- Dashboard with error grouping
- Alert notifications

---

## 2. ANALYTICS SOLUTION: POSTHOG (RECOMMENDED PRIMARY) + APTABASE (PRIVACY-FOCUSED ALTERNATIVE)

### Why PostHog?

**Primary Recommendation: PostHog**

PostHog is the best overall choice because it combines:

- **Comprehensive Features**: Analytics + session replay + feature flags + A/B testing in one platform
- **Generous Free Tier**: 1M events/month + 5K session replays/month
- **React Native SDK**: Full Expo support with minimal setup
- **Open Source**: Can self-host if needed for compliance
- **Great for CME Apps**: Autocapture events, user funnels, retention analysis
- **Pricing**: $0.00045/event after free tier (very affordable)

**Alternative: Aptabase (Privacy-First)**

If privacy compliance is critical:

- **100% Privacy-First**: No personal data collection, GDPR/CCPA compliant
- **Anonymous Analytics**: Cannot track individual users (trade-off)
- **Open Source**: Full transparency and self-hosting option
- **Free Tier**: Generous usage limits
- **Best For**: Apps handling sensitive health data or strict privacy requirements

### Installation & Setup

#### PostHog Setup

##### Step 1: Create PostHog Account

```bash
# Sign up at https://posthog.com
# Create a new React Native project
# Get your API key from project settings
```

##### Step 2: Install PostHog SDK

```bash
npx expo install posthog-react-native
```

##### Step 3: Initialize PostHog

**Create `lib/posthog.ts`:**

```typescript
import { usePostHog } from 'posthog-react-native';
import PostHog from 'posthog-react-native';

export const initPostHog = async () => {
  await PostHog.setup('YOUR_POSTHOG_API_KEY', {
    host: 'https://us.posthog.com', // or EU
    captureDeviceId: true,
    captureApplicationLifecycle: true,
    recordingSessionReplayMinDuration: 0, // Milliseconds
  });
};
```

**Update `app.tsx`:**

```typescript
import { initPostHog } from './lib/posthog';

// In useEffect or component mount
useEffect(() => {
  initPostHog();
}, []);

export default function App() {
  return (
    // Your app content
  );
}
```

##### Step 4: Set Environment Variables

**`.env`:**

```
POSTHOG_API_KEY=phc_YOUR_API_KEY_HERE
POSTHOG_HOST=https://us.posthog.com
```

#### Aptabase Setup (Privacy Alternative)

##### Step 1: Install Aptabase SDK

```bash
npx expo install aptabase-react-native
```

##### Step 2: Initialize Aptabase

**Create `lib/aptabase.ts`:**

```typescript
import Aptabase from 'aptabase-react-native';

export const initAptabase = () => {
  Aptabase.init('YOUR_APP_KEY');
};
```

**Update `app.tsx`:**

```typescript
import { initAptabase } from './lib/aptabase';

useEffect(() => {
  initAptabase();
}, []);
```

---

## 3. RECOMMENDED EVENTS TO TRACK FOR CME AGENT

### User Engagement Events

Track user activity and platform usage:

```typescript
import { usePostHog } from 'posthog-react-native';

const posthog = usePostHog();

// User signs up or logs in
posthog.capture('user_signup', {
  credential_type: 'email', // or 'oauth'
  user_role: 'physician', // or 'nurse', 'other_hcp'
  specialty: 'cardiology',
  experience_years: 10,
});

// User logs in
posthog.capture('user_login', {
  credential_type: 'email',
  login_method: 'password', // or 'biometric'
});

// User views course/activity
posthog.capture('course_viewed', {
  course_id: 'course_123',
  course_title: 'Latest Cardiology Guidelines',
  course_category: 'cardiology',
  credit_hours: 2,
  activity_type: 'live_activity', // or 'on_demand'
});

// User starts course module
posthog.capture('course_started', {
  course_id: 'course_123',
  module_id: 'mod_001',
  module_number: 1,
  total_modules: 5,
});

// User completes course
posthog.capture('course_completed', {
  course_id: 'course_123',
  module_id: 'mod_005',
  completion_time_minutes: 120,
  score: 95,
  passed: true,
  credit_hours_earned: 2,
});
```

### Feature Usage Events

Track specific feature adoption:

```typescript
// User takes a quiz/assessment
posthog.capture('quiz_started', {
  course_id: 'course_123',
  quiz_id: 'quiz_001',
  question_count: 10,
});

posthog.capture('quiz_completed', {
  course_id: 'course_123',
  quiz_id: 'quiz_001',
  score: 9,
  total_questions: 10,
  passing_score: 7,
  passed: true,
});

// User views CME transcript/history
posthog.capture('transcript_viewed', {
  year: 2024,
  total_credits: 25,
  courses_completed: 8,
});

// User claims/saves CME certificate
posthog.capture('certificate_claimed', {
  course_id: 'course_123',
  credit_type: 'cme',
  credit_hours: 2,
  accreditation_body: 'ACCME', // or other
});

// User shares achievement on social
posthog.capture('achievement_shared', {
  share_type: 'social', // or 'email'
  social_platform: 'linkedin',
  achievement_type: 'course_completion',
  course_id: 'course_123',
});

// User uses search/filter
posthog.capture('courses_searched', {
  query: 'cardiology guidelines',
  filter_category: 'cardiology',
  filter_credit_hours: 2,
  results_count: 24,
});

// User saves course to "My Courses"
posthog.capture('course_saved', {
  course_id: 'course_123',
  collection_type: 'favorites',
});

// User accesses course notes/downloads
posthog.capture('course_resource_accessed', {
  course_id: 'course_123',
  resource_type: 'pdf_slides', // or 'handout', 'video'
  file_size_mb: 12,
});
```

### Conversion & Onboarding Events

Track monetization and user progression:

```typescript
// Onboarding steps
posthog.capture('onboarding_started', {
  step: 1,
  total_steps: 4,
});

posthog.capture('onboarding_step_completed', {
  step: 1,
  step_name: 'profile_setup',
  time_spent_seconds: 180,
});

posthog.capture('onboarding_completed', {
  total_steps: 4,
  time_spent_minutes: 12,
  credential_verified: true,
});

// Subscription/purchase events
posthog.capture('subscription_viewed', {
  plan_type: 'premium', // or 'standard'
  price_usd: 9.99,
  billing_period: 'monthly', // or 'annual'
});

posthog.capture('subscription_started', {
  plan_type: 'premium',
  price_usd: 9.99,
  billing_period: 'monthly',
  promo_code: 'LAUNCH20', // if applicable
  payment_method: 'credit_card',
});

posthog.capture('subscription_upgraded', {
  old_plan: 'free',
  new_plan: 'premium',
  upgrade_reason: 'unlimited_courses',
});

// Payment/billing events
posthog.capture('payment_failed', {
  plan_type: 'premium',
  error_code: 'card_declined',
  retry_count: 1,
});

posthog.capture('payment_succeeded', {
  amount_usd: 9.99,
  currency: 'USD',
  payment_method: 'credit_card',
});

// Feature unlock events
posthog.capture('feature_unlocked', {
  feature_name: 'advanced_filter',
  unlock_method: 'subscription', // or 'achievement'
  plan_type: 'premium',
});
```

### Error & Churn Prevention Events

Track issues and user disengagement:

```typescript
// App errors (note: Sentry also catches these)
posthog.capture('app_error_occurred', {
  error_type: 'course_load_failed',
  error_message: 'Network timeout',
  course_id: 'course_123',
  screen_name: 'course_detail',
});

// User abandonment events
posthog.capture('course_abandoned', {
  course_id: 'course_123',
  progress_percent: 50,
  time_spent_minutes: 45,
  module_stopped_at: 3,
});

posthog.capture('user_inactive', {
  days_inactive: 30,
  last_activity: 'course_viewed',
  total_credits_earned: 10,
});

posthog.capture('subscription_cancelled', {
  plan_type: 'premium',
  subscription_duration_days: 90,
  cancellation_reason: 'insufficient_content', // or other
});
```

### Event Naming Convention

Use consistent naming:
- **Format**: `[noun]_[action]` or `[action]_[noun]`
- **Examples**: `course_started`, `quiz_completed`, `user_signup`
- **Properties**: Use snake_case, be specific, avoid redundancy

---

## 4. ANALYTICS FUNNELS FOR CME AGENT

### Signup → First Course Funnel

```typescript
// Step 1: Signup viewed
posthog.capture('signup_viewed');

// Step 2: User signs up
posthog.capture('user_signup', { credential_type: 'email' });

// Step 3: Email verified
posthog.capture('email_verified');

// Step 4: Profile completed
posthog.capture('profile_completed', { specialty: 'cardiology' });

// Step 5: Browse courses
posthog.capture('courses_browsed', { category: 'cardiology' });

// Step 6: First course started
posthog.capture('course_started', { course_id: 'course_123' });
```

### Course Completion Funnel

```typescript
// Step 1: Course started
posthog.capture('course_started', { course_id: 'course_123' });

// Step 2: Module 1 completed
posthog.capture('module_completed', { module_number: 1 });

// Step 3: Quiz attempt
posthog.capture('quiz_started', { quiz_id: 'quiz_001' });

// Step 4: Quiz passed
posthog.capture('quiz_completed', { passed: true });

// Step 5: Certificate claimed
posthog.capture('certificate_claimed', { course_id: 'course_123' });
```

### Subscription Conversion Funnel

```typescript
// Step 1: Subscription page viewed
posthog.capture('subscription_page_viewed');

// Step 2: Plan selected
posthog.capture('plan_selected', { plan_type: 'premium' });

// Step 3: Payment page loaded
posthog.capture('payment_page_loaded');

// Step 4: Payment attempted
posthog.capture('payment_started', { amount_usd: 9.99 });

// Step 5: Payment succeeded
posthog.capture('payment_succeeded', { plan_type: 'premium' });

// Step 6: Subscription activated
posthog.capture('subscription_started', { plan_type: 'premium' });
```

---

## 5. POSTHOG VS APTABASE DECISION MATRIX

Choose based on your priorities:

| Criteria | PostHog | Aptabase |
|----------|---------|----------|
| **Feature Completeness** | ⭐⭐⭐⭐⭐ (Analytics, replays, flags) | ⭐⭐⭐ (Analytics only) |
| **Privacy/GDPR** | ⭐⭐⭐⭐ (Good, cloud-hosted) | ⭐⭐⭐⭐⭐ (Best, no personal data) |
| **User-Level Analytics** | ⭐⭐⭐⭐⭐ (Excellent) | ❌ (Anonymous only) |
| **Free Tier** | ⭐⭐⭐⭐ (1M events/mo) | ⭐⭐⭐⭐ (Generous) |
| **Self-Hosting** | ⭐⭐⭐⭐ (Full open source) | ⭐⭐⭐⭐ (Full open source) |
| **Session Replay** | ⭐⭐⭐⭐⭐ | ❌ |
| **Ease of Setup** | ⭐⭐⭐⭐ (Straightforward) | ⭐⭐⭐⭐⭐ (Simpler) |
| **Cost at Scale** | Moderate ($0.00045/event) | Low (flat-rate friendly) |

**Recommendation**:
- **PostHog**: Use if you need user-level analytics, session replay, or advanced feature flags
- **Aptabase**: Use if privacy compliance is critical and you don't need user-level tracking

**Hybrid Approach**: Use PostHog for general analytics + Aptabase in parallel for privacy-compliant backup

---

## 6. IMPLEMENTATION ROADMAP

### Phase 1: Core Setup (Week 1)
- [ ] Set up Sentry for error tracking
- [ ] Initialize Sentry in app
- [ ] Configure environment variables

### Phase 2: Basic Analytics (Week 2)
- [ ] Set up PostHog
- [ ] Implement user engagement events (signup, login, course_viewed)
- [ ] Implement course completion funnel
- [ ] Create basic dashboard in PostHog

### Phase 3: Advanced Tracking (Week 3)
- [ ] Implement feature usage events
- [ ] Add conversion events for payments
- [ ] Create retention/churn analysis
- [ ] Set up custom dashboards

### Phase 4: Optimization (Week 4)
- [ ] Analyze funnels for drop-off
- [ ] Identify performance bottlenecks
- [ ] Set up automated alerts
- [ ] Document findings and insights

---

## 7. TESTING & VALIDATION

### Test Error Tracking

```typescript
// In development, trigger a test error:
posthog.capture('test_event'); // Should appear in PostHog
Sentry.captureException(new Error('Test error')); // Should appear in Sentry
```

### Verify Events in PostHog

1. Go to PostHog dashboard
2. Click "Events" in sidebar
3. Filter by your test events
4. Verify properties are captured correctly

### Verify Errors in Sentry

1. Go to Sentry dashboard
2. Navigate to "Issues" tab
3. Should see test errors appear in real-time

---

## 8. COST ESTIMATION

### Monthly Costs (Conservative Estimate)

For a CME app with 1,000 active users:

| Service | Free Tier | Estimated Cost |
|---------|-----------|-----------------|
| **Sentry** | 5K events/mo | $0 (within free tier) |
| **PostHog** | 1M events/mo | $0 (within free tier) |
| **Total** | - | **$0/month** |

**At 100K+ monthly events**:
- Sentry: ~$50/month (10K additional events)
- PostHog: ~$45/month (100K events at $0.00045/event)
- **Total: ~$95/month**

---

## 9. SECURITY & PRIVACY CONSIDERATIONS

### API Key Management

- **Never commit API keys** to git
- Use `.env` files with `.env.local` for local development
- For Vercel deployment, set environment variables in Vercel dashboard
- Use Sentry auth tokens as EAS secrets (not in .env)

### Data Compliance

- **GDPR**: Both Sentry and PostHog are GDPR-compliant
- **HIPAA**: If handling PHI, consider Aptabase or self-hosted PostHog
- **Cookie Consent**: Inform users about analytics data collection
- **User Deletion**: Implement ability to delete user analytics data

### Event Sanitization

Never capture sensitive information:

```typescript
// ❌ BAD: Capturing sensitive data
posthog.capture('payment_processed', {
  credit_card_number: '4111111111111111', // NEVER DO THIS
  user_ssn: '123-45-6789', // NEVER DO THIS
});

// ✅ GOOD: Capture only necessary, non-sensitive data
posthog.capture('payment_processed', {
  amount_usd: 9.99,
  plan_type: 'premium',
  payment_method: 'card', // Don't include details
});
```

---

## 10. DASHBOARD SETUP QUICK START

### PostHog Dashboard Recommendations

1. **Overview Dashboard**
   - Daily active users
   - Course completion rate
   - Signup to first course funnel
   - Top courses by enrollment

2. **Retention Dashboard**
   - 7-day retention by signup cohort
   - Monthly returning users
   - Churn rate trend

3. **Engagement Dashboard**
   - Event volume by feature
   - User flow from signup → completion
   - Quiz pass rates by specialty

4. **Business Dashboard**
   - Subscription conversion funnel
   - Revenue by plan type
   - Customer acquisition cost (if applicable)

### Sentry Alerts

1. **Critical Alert**: Error rate > 5% in 1 hour
2. **Warning Alert**: New error type appears
3. **Performance Alert**: Course load time > 3 seconds

---

## 11. ADDITIONAL RESOURCES

### Documentation Links

- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
- [Sentry Expo Integration](https://docs.expo.dev/guides/using-sentry/)
- [PostHog React Native SDK](https://github.com/PostHog/posthog-react-native)
- [Aptabase React Native SDK](https://github.com/aptabase/aptabase-react-native)
- [Expo Analytics Guide](https://docs.expo.dev/guides/using-analytics/)

### Helpful Articles

- [React Native Performance Monitoring with Sentry](https://blog.sentry.io/react-native-performance-strategies-tools/)
- [PostHog Analytics in React Native Apps](https://medium.com/@andrew.chester/expo-and-posthog-a-seamless-analytics-solution-for-react-native-apps-e1417a3e4479)
- [Privacy-First Analytics Guide](https://aptabase.com/for-react-native)

---

## 12. NEXT STEPS

1. **Create Sentry account** and set up error monitoring
2. **Choose analytics platform**: PostHog (recommended) or Aptabase (privacy)
3. **Install SDKs** in development branch
4. **Implement core events** from Section 3
5. **Test thoroughly** with test events before production
6. **Deploy to Expo** with proper environment variable configuration
7. **Monitor dashboards** daily during first week
8. **Iterate** based on insights from event data

---

**Last Updated**: February 2026

**Document Version**: 1.0
