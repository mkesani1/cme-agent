import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Database, TablesInsert, TablesUpdate } from './database.types';

const supabaseUrl = 'https://drwpnasiqgzqdubmlwxj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd3BuYXNpcWd6cWR1Ym1sd3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzE5MzAsImV4cCI6MjA4NTgwNzkzMH0.26RVUHuFDcYfMBLTsodSP9jUE01qYRn9bfQ-nfqtt7Y';

// Enable detectSessionInUrl for web to handle password reset links
const isWeb = Platform.OS === 'web';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
  },
});

// Edge Function URLs
export const EDGE_FUNCTIONS = {
  getComplianceStatus: `${supabaseUrl}/functions/v1/get-compliance-status`,
  getCourseRecommendations: `${supabaseUrl}/functions/v1/get-course-recommendations`,
  scanCertificate: `${supabaseUrl}/functions/v1/scan-certificate`,
  subscriptionWebhook: `${supabaseUrl}/functions/v1/subscription-webhook`,
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

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};

// Database helpers
export const db = {
  // ===== PROFILES =====
  getProfile: async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },

  updateProfile: async (userId: string, updates: TablesUpdate<'profiles'>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ===== LICENSES =====
  getLicenses: async (userId: string) => {
    const { data, error } = await supabase.from('licenses').select('*').eq('user_id', userId).order('state');
    if (error) throw error;
    return data;
  },

  getLicenseWithRequirements: async (licenseId: string) => {
    const { data, error } = await supabase
      .from('licenses')
      .select(`
        *,
        license_requirements (*)
      `)
      .eq('id', licenseId)
      .single();
    if (error) throw error;
    return data;
  },

  addLicense: async (license: TablesInsert<'licenses'>) => {
    const { data, error } = await supabase.from('licenses').insert(license).select().single();
    if (error) throw error;
    return data;
  },

  updateLicense: async (licenseId: string, updates: TablesUpdate<'licenses'>) => {
    const { data, error } = await supabase
      .from('licenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', licenseId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteLicense: async (licenseId: string) => {
    const { error } = await supabase.from('licenses').delete().eq('id', licenseId);
    if (error) throw error;
  },

  // ===== LICENSE REQUIREMENTS =====
  getLicenseRequirements: async (licenseId: string) => {
    const { data, error } = await supabase
      .from('license_requirements')
      .select('*')
      .eq('license_id', licenseId);
    if (error) throw error;
    return data;
  },

  addLicenseRequirement: async (requirement: TablesInsert<'license_requirements'>) => {
    const { data, error } = await supabase.from('license_requirements').insert(requirement).select().single();
    if (error) throw error;
    return data;
  },

  // ===== CERTIFICATES =====
  getCertificates: async (userId: string) => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('completion_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  addCertificate: async (certificate: TablesInsert<'certificates'>) => {
    const { data, error } = await supabase.from('certificates').insert(certificate).select().single();
    if (error) throw error;
    return data;
  },

  updateCertificate: async (certificateId: string, updates: TablesUpdate<'certificates'>) => {
    const { data, error } = await supabase
      .from('certificates')
      .update(updates)
      .eq('id', certificateId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteCertificate: async (certificateId: string) => {
    const { error } = await supabase.from('certificates').delete().eq('id', certificateId);
    if (error) throw error;
  },

  // ===== CREDIT ALLOCATIONS =====
  getCreditAllocations: async (licenseId: string) => {
    const { data, error } = await supabase
      .from('credit_allocations')
      .select('*')
      .eq('license_id', licenseId);
    if (error) throw error;
    return data;
  },

  getCreditAllocationsByCertificate: async (certificateId: string) => {
    const { data, error } = await supabase
      .from('credit_allocations')
      .select('*')
      .eq('certificate_id', certificateId);
    if (error) throw error;
    return data;
  },

  addCreditAllocation: async (allocation: TablesInsert<'credit_allocations'>) => {
    const { data, error } = await supabase.from('credit_allocations').insert(allocation).select().single();
    if (error) throw error;
    return data;
  },

  deleteCreditAllocation: async (allocationId: string) => {
    const { error } = await supabase.from('credit_allocations').delete().eq('id', allocationId);
    if (error) throw error;
  },

  // ===== DEA REGISTRATIONS =====
  getDeaRegistration: async (userId: string) => {
    const { data, error } = await supabase
      .from('dea_registrations')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  addDeaRegistration: async (dea: TablesInsert<'dea_registrations'>) => {
    const { data, error } = await supabase.from('dea_registrations').insert(dea).select().single();
    if (error) throw error;
    return data;
  },

  updateDeaRegistration: async (deaId: string, updates: TablesUpdate<'dea_registrations'>) => {
    const { data, error } = await supabase
      .from('dea_registrations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', deaId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteDeaRegistration: async (deaId: string) => {
    const { error } = await supabase.from('dea_registrations').delete().eq('id', deaId);
    if (error) throw error;
  },

  // ===== STATE REQUIREMENTS =====
  getStateRequirements: async (states: string[], degreeType: string = 'MD') => {
    const { data, error } = await supabase
      .from('state_requirements')
      .select('*')
      .in('state', states)
      .eq('degree_type', degreeType);
    if (error) throw error;
    return data;
  },

  getAllStateRequirements: async (degreeType: string = 'MD') => {
    const { data, error } = await supabase
      .from('state_requirements')
      .select('*')
      .eq('degree_type', degreeType)
      .order('state');
    if (error) throw error;
    return data;
  },

  // ===== SUBSCRIPTIONS =====
  getSubscription: async (userId: string) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  createSubscription: async (subscription: TablesInsert<'subscriptions'>) => {
    const { data, error } = await supabase.from('subscriptions').insert(subscription).select().single();
    if (error) throw error;
    return data;
  },

  updateSubscription: async (subscriptionId: string, updates: TablesUpdate<'subscriptions'>) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', subscriptionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ===== NOTIFICATIONS =====
  getNotifications: async (userId: string, unreadOnly: boolean = false) => {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) query = query.eq('read', false);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  markNotificationRead: async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
    if (error) throw error;
  },

  markAllNotificationsRead: async (userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw error;
  },

  // ===== EXPERT CONSULTATIONS (Pro tier) =====
  createConsultation: async (consultation: TablesInsert<'expert_consultations'>) => {
    const { data, error } = await supabase.from('expert_consultations').insert(consultation).select().single();
    if (error) throw error;
    return data;
  },

  getConsultations: async (userId: string) => {
    const { data, error } = await supabase
      .from('expert_consultations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // ===== COURSES =====
  searchCourses: async (filters: { category?: string; states?: string[]; freeOnly?: boolean; limit?: number }) => {
    let query = supabase.from('courses').select('*').eq('is_active', true);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.states?.length) query = query.overlaps('approved_states', filters.states);
    if (filters.freeOnly) query = query.eq('is_free', true);
    query = query.limit(filters.limit || 20);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getCourse: async (courseId: string) => {
    const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
    if (error) throw error;
    return data;
  },

  // ===== PUSH TOKENS =====
  registerPushToken: async (token: TablesInsert<'push_tokens'>) => {
    const { data, error } = await supabase.from('push_tokens').upsert(token, { onConflict: 'user_id,token' }).select().single();
    if (error) throw error;
    return data;
  },

  // ===== CHAT MESSAGES =====
  getChatMessages: async (userId: string, limit: number = 50) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  addChatMessage: async (message: TablesInsert<'chat_messages'>) => {
    const { data, error } = await supabase.from('chat_messages').insert(message).select().single();
    if (error) throw error;
    return data;
  },
};

export default supabase;
