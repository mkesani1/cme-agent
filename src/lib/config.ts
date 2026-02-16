// ─── Centralized Configuration ───
// All Supabase and service URLs in one place.
// The anon key is PUBLIC by design — security comes from RLS policies.

export const SUPABASE_URL = 'https://drwpnasiqgzqdubmlwxj.supabase.co';

export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd3BuYXNpcWd6cWR1Ym1sd3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzE5MzAsImV4cCI6MjA4NTgwNzkzMH0.26RVUHuFDcYfMBLTsodSP9jUE01qYRn9bfQ-nfqtt7Y';

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
