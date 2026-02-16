import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Database } from './database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY, EDGE_FUNCTIONS as EDGE_FN_URLS } from './config';

// Enable detectSessionInUrl for web to handle password reset links
const isWeb = Platform.OS === 'web';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
  },
});

// Re-export edge function URLs for backward compatibility
export const EDGE_FUNCTIONS = {
  getComplianceStatus: EDGE_FN_URLS.getComplianceStatusUrl,
  getCourseRecommendations: EDGE_FN_URLS.getCourseRecommendationsUrl,
  scanCertificate: EDGE_FN_URLS.scanCertificateUrl,
  subscriptionWebhook: EDGE_FN_URLS.subscriptionWebhookUrl,
};

// Helper to call edge functions with auth
export async function callEdgeFunction<T>(
  functionName: keyof typeof EDGE_FUNCTIONS,
  body?: Record<string, unknown>
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(EDGE_FUNCTIONS[functionName], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Edge function call failed');
  }

  return response.json();
}

export default supabase;
