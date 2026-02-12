import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

// Sentry Configuration
// TODO: Replace with your actual Sentry DSN from https://sentry.io
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

// Initialize Sentry for error tracking
export function initMonitoring() {
  if (!SENTRY_DSN) {
    console.warn('[Monitoring] Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    // Set environment based on __DEV__ or deployment
    environment: __DEV__ ? 'development' : 'production',
    // Enable native crash reporting
    enableNative: Platform.OS !== 'web',
    // Capture 10% of transactions for performance monitoring (adjust as needed)
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    // Don't send events in development unless explicitly enabled
    enabled: !__DEV__ || !!process.env.EXPO_PUBLIC_SENTRY_DEBUG,
    // Attach stack traces to all messages
    attachStacktrace: true,
    // Debug mode for development
    debug: __DEV__,
  });

  console.log('[Monitoring] Sentry initialized');
}

// Capture exceptions with context
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

// Capture messages for logging important events
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

// Set user context for better error tracking
export function setUser(user: { id: string; email?: string; name?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.setUser(null);
  }
}

// Add breadcrumb for tracking user actions leading to errors
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

// ============================================
// Analytics Events (using Sentry for now)
// TODO: Add PostHog or Aptabase for full analytics
// ============================================

// Track screen views
export function trackScreenView(screenName: string) {
  addBreadcrumb(`Viewed ${screenName}`, 'navigation');
}

// Track user actions
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  addBreadcrumb(eventName, 'user_action', properties);

  // Log to console in development
  if (__DEV__) {
    console.log(`[Analytics] ${eventName}`, properties);
  }
}

// CME-specific events
export const CMEEvents = {
  // Onboarding
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',

  // License management
  LICENSE_ADDED: 'license_added',
  LICENSE_VIEWED: 'license_viewed',
  LICENSE_DELETED: 'license_deleted',

  // Certificates
  CERTIFICATE_UPLOADED: 'certificate_uploaded',
  CERTIFICATE_SCANNED: 'certificate_scanned',
  CERTIFICATE_VERIFIED: 'certificate_verified',

  // Courses
  COURSE_VIEWED: 'course_viewed',
  COURSE_STARTED: 'course_started',
  COURSE_COMPLETED: 'course_completed',

  // AI Assistant
  AI_CHAT_STARTED: 'ai_chat_started',
  AI_CHAT_MESSAGE: 'ai_chat_message',

  // Subscription
  SUBSCRIPTION_VIEWED: 'subscription_viewed',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
};
