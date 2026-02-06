import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Database } from '../types/database';

const supabaseUrl = 'https://drwpnasiqgzqdubmlwxj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd3BuYXNpcWd6cWR1Ym1sd3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzE5MzAsImV4cCI6MjA4NTgwNzkzMH0.26RVUHuFDcYfMBLTsodSP9jUE01qYRn9bfQ-nfqtt7Y';

// Enable detectSessionInUrl for web to handle password reset links
const isWeb = Platform.OS === 'web';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb, // Enable on web for password reset/magic links
  },
});
