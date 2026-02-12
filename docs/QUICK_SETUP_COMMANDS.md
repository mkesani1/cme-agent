# CME Agent - Analytics Setup Quick Commands

## Prerequisites
- Sentry account (https://sentry.io)
- PostHog account (https://posthog.com) OR Aptabase account (https://aptabase.com)
- React Native/Expo project initialized

## 1. Error Monitoring - Sentry

### Option A: Automatic Setup (Recommended)
```bash
# From your project root
npx expo install @sentry/react-native

# Run Sentry wizard (auto-configures everything)
npm exec @sentry/wizard@latest -i reactNative
```

### Option B: Manual Setup
```bash
npx expo install @sentry/react-native
```

Then manually add to `app.json`, `metro.config.js`, and `app.tsx` (see ANALYTICS_SETUP.md for details).

### Environment Variables
```bash
# .env (never commit SENTRY_AUTH_TOKEN to git)
SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID
```

### Test Sentry
```bash
# In your app code:
import * as Sentry from '@sentry/react-native';
Sentry.captureException(new Error('Test error'));
```

---

## 2. Analytics - PostHog Setup

### Install SDK
```bash
npx expo install posthog-react-native
```

### Initialize in App
```typescript
// app.tsx
import PostHog from 'posthog-react-native';

useEffect(() => {
  PostHog.setup('phc_YOUR_API_KEY', {
    host: 'https://us.posthog.com',
  });
}, []);
```

### Environment Variables
```bash
# .env
POSTHOG_API_KEY=phc_YOUR_KEY_HERE
POSTHOG_HOST=https://us.posthog.com
```

### Test PostHog
```typescript
import { usePostHog } from 'posthog-react-native';

const posthog = usePostHog();
posthog.capture('test_event', { test: true });
```

---

## 3. Analytics - Aptabase Setup (Privacy Alternative)

### Install SDK
```bash
npx expo install aptabase-react-native
```

### Initialize in App
```typescript
// app.tsx
import Aptabase from 'aptabase-react-native';

useEffect(() => {
  Aptabase.init('YOUR_APP_KEY');
}, []);
```

### Test Aptabase
```typescript
Aptabase.trackEvent('test_event', { test: true });
```

---

## 4. Vercel Deployment - Environment Variables

### Set Sentry Secret
```bash
# Using Expo EAS
eas secret create --name SENTRY_AUTH_TOKEN --value <your_token>
```

### Set Analytics Keys in Vercel
```bash
# Via Vercel CLI
vercel env add POSTHOG_API_KEY phc_YOUR_KEY
vercel env add SENTRY_DSN https://...

# Or via Vercel Dashboard:
# Settings > Environment Variables
```

---

## 5. Full Integration Example

### Complete app.tsx
```typescript
import { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import PostHog from 'posthog-react-native';
import { usePostHog } from 'posthog-react-native';

// Initialize Sentry early
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 0.1,
});

export default function App() {
  useEffect(() => {
    // Initialize PostHog
    PostHog.setup(process.env.POSTHOG_API_KEY, {
      host: process.env.POSTHOG_HOST || 'https://us.posthog.com',
    });
  }, []);

  return (
    // Your app components
  );
}

// Wrap navigation or root component
export default Sentry.wrap(App);
```

---

## 6. Tracking Core Events

### User Signup
```typescript
const posthog = usePostHog();

posthog.capture('user_signup', {
  specialty: 'cardiology',
  user_role: 'physician',
});
```

### Course Started
```typescript
posthog.capture('course_started', {
  course_id: 'course_123',
  course_title: 'Latest Guidelines',
  credit_hours: 2,
});
```

### Course Completed
```typescript
posthog.capture('course_completed', {
  course_id: 'course_123',
  score: 95,
  passed: true,
  credit_hours_earned: 2,
});
```

### Error Tracking
```typescript
try {
  // your code
} catch (error) {
  Sentry.captureException(error);
  posthog.capture('app_error', { 
    error: error.message,
    screen: 'course_detail',
  });
}
```

---

## 7. Checklist

- [ ] Create Sentry account and project
- [ ] Get Sentry DSN
- [ ] Create PostHog account and project
- [ ] Get PostHog API key
- [ ] Install Sentry SDK: `npx expo install @sentry/react-native`
- [ ] Run Sentry wizard or configure manually
- [ ] Install PostHog SDK: `npx expo install posthog-react-native`
- [ ] Add environment variables to `.env`
- [ ] Initialize Sentry in app.tsx
- [ ] Initialize PostHog in app.tsx
- [ ] Test both in development
- [ ] Implement core events (signup, course_started, etc.)
- [ ] Deploy to Expo EAS with secrets
- [ ] Verify events in dashboards
- [ ] Set up alerts and dashboards

---

## 8. Troubleshooting

### Sentry Events Not Appearing
```bash
# Verify DSN is correct
echo $SENTRY_DSN

# Check Sentry network requests
# Enable debugging in Sentry.init()
Sentry.init({
  dsn: ...,
  debug: true,
})
```

### PostHog Events Not Appearing
```typescript
// Verify initialization
PostHog.setup(apiKey, { 
  host: 'https://us.posthog.com',
  captureApplicationLifecycle: true,
});

// Flush events (if app closes quickly)
await PostHog.flush();
```

### Environment Variables Not Loading
```bash
# Verify .env file location
ls -la .env

# Check Vercel/EAS integration
eas env list
```

---

## 9. Documentation Links

- Sentry Setup: https://docs.sentry.io/platforms/react-native/manual-setup/expo/
- PostHog SDK: https://github.com/PostHog/posthog-react-native
- Aptabase SDK: https://github.com/aptabase/aptabase-react-native
- Expo Secrets: https://docs.expo.dev/build/secrets/
- Vercel Env Variables: https://vercel.com/docs/projects/environment-variables

---

**Need more details?** See `ANALYTICS_SETUP.md` for comprehensive guide.
