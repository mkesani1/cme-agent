// ─── Centralized Configuration ───
// All Supabase and service URLs in one place.
// 
// SECURITY: Credentials are loaded from environment variables.
// Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
// in your .env file or Vercel/EAS environment settings.
//
// The anon key is PUBLIC by design — security comes from RLS policies.
// However, it should still be loaded from env vars to:
// 1. Keep it out of version control
// 2. Allow easy rotation without code changes
// 3. Support different environments (dev/staging/prod)

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment.'
  );
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };

export const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1`;

// Edge function endpoints
export const EDGE_FUNCTIONS = {
  cmeChatUrl: `${EDGE_FUNCTION_URL}/cme-chat`,
  recommendCoursesUrl: `${EDGE_FUNCTION_URL}/recommend-courses`,
  recommendCoursesDemoUrl: `${EDGE_FUNCTION_URL}/recommend-courses-demo`,
  getComplianceStatusUrl: `${EDGE_FUNCTION_URL}/get-compliance-status`,
  getCourseRecommendationsUrl: `${EDGE_FUNCTION_URL}/get-course-recommendations`,
  scanCertificateUrl: `${EDGE_FUNCTION_URL}/scan-certificate`,
  subscriptionWebhookUrl: `${EDGE_FUNCTION_URL}/subscription-webhook`,
} as const;
