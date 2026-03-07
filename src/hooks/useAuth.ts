import { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  connectionStatus: 'connected' | 'slow' | 'offline';
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT_MS = 10000;
const PROFILE_TIMEOUT_MS = 5000;
const SAFETY_TIMEOUT_MS = 15000;
const PROFILE_RETRY_DELAY_MS = 1000;

const STORAGE_KEYS_TO_CLEAR = ['onboarding_completed', 'demo_mode_dismissed'];

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const payload = {
    scope: 'auth',
    level,
    message,
    ...(context ? { context } : {}),
    timestamp: new Date().toISOString(),
  };

  if (level === 'error') {
    console.error(JSON.stringify(payload));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(payload));
  } else {
    console.log(JSON.stringify(payload));
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<{ timedOut: boolean; result?: T }> {
  const timeoutResult = await Promise.race<
    { timedOut: true } | { timedOut: false; result: T }
  >([
    new Promise<{ timedOut: true }>((resolve) =>
      setTimeout(() => resolve({ timedOut: true }), timeoutMs)
    ),
    promise.then((result) => ({ timedOut: false, result })),
  ]);

  return timeoutResult;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'slow' | 'offline'>('connected');

  useEffect(() => {
    let mounted = true;

    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        log('warn', 'Safety timeout reached; proceeding to avoid app hang', {
          timeoutMs: SAFETY_TIMEOUT_MS,
        });
        setConnectionStatus((prev) => (prev === 'offline' ? 'offline' : 'slow'));
        setLoading(false);
      }
    }, SAFETY_TIMEOUT_MS);

    async function fetchProfileWithRetry(userId: string, fullName?: string | null): Promise<Profile | null> {
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        const profileRequest = supabase.from('profiles').select('*').eq('id', userId).single();
        const profileOutcome = await withTimeout(profileRequest, PROFILE_TIMEOUT_MS);

        if (profileOutcome.timedOut) {
          log('warn', 'Profile fetch timed out', { attempt, timeoutMs: PROFILE_TIMEOUT_MS, userId });
          if (attempt === 1) {
            setConnectionStatus('slow');
            await delay(PROFILE_RETRY_DELAY_MS);
            continue;
          }
          return null;
        }

        const profileResult = profileOutcome.result;
        if (profileResult?.data) {
          setConnectionStatus('connected');
          return profileResult.data as Profile;
        }

        const code = (profileResult as any)?.error?.code;
        if (code === 'PGRST116') {
          log('warn', 'Profile missing; creating fallback', { userId });
          const insertOutcome = await withTimeout(
            supabase
              .from('profiles')
              .insert({ id: userId, full_name: fullName || '' })
              .select()
              .single(),
            PROFILE_TIMEOUT_MS
          );

          if (insertOutcome.timedOut) {
            log('warn', 'Fallback profile creation timed out', { userId, timeoutMs: PROFILE_TIMEOUT_MS });
            setConnectionStatus('slow');
            return null;
          }

          const insertResult = insertOutcome.result as any;
          if (insertResult?.data) {
            setConnectionStatus('connected');
            return insertResult.data as Profile;
          }
        }

        if ((profileResult as any)?.error) {
          log('warn', 'Profile fetch failed', {
            attempt,
            userId,
            error: (profileResult as any).error,
          });
          if (attempt === 1) {
            await delay(PROFILE_RETRY_DELAY_MS);
            continue;
          }
        }
      }

      return null;
    }

    async function initAuth() {
      try {
        const sessionOutcome = await withTimeout(supabase.auth.getSession(), SESSION_TIMEOUT_MS);

        if (!mounted) return;

        if (sessionOutcome.timedOut) {
          log('warn', 'Session fetch timed out; connection appears slow', {
            timeoutMs: SESSION_TIMEOUT_MS,
          });
          setConnectionStatus('slow');
          setLoading(false);
          return;
        }

        const sessionResult = sessionOutcome.result;
        if (!sessionResult?.data?.session?.user) {
          log('info', 'No active session found');
          setConnectionStatus('connected');
          setLoading(false);
          return;
        }

        const sess = sessionResult.data.session;
        setSession(sess);
        setUser(sess.user);

        const loadedProfile = await fetchProfileWithRetry(
          sess.user.id,
          sess.user.user_metadata?.full_name || ''
        );

        if (mounted) {
          setProfile(loadedProfile);
          setLoading(false);
        }
      } catch (err) {
        log('error', 'initAuth failed', { error: err instanceof Error ? err.message : String(err) });
        if (mounted) {
          setConnectionStatus('offline');
          setLoading(false);
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && newSession?.user) {
        setLoading(true);
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        try {
          const loadedProfile = await fetchProfileWithRetry(
            newSession.user.id,
            newSession.user.user_metadata?.full_name || ''
          );

          if (mounted) {
            setProfile(loadedProfile);
          }
        } catch (err) {
          log('warn', 'Profile load during auth state change failed', {
            event,
            error: err instanceof Error ? err.message : String(err),
          });
          if (mounted) {
            setConnectionStatus('slow');
          }
        }
      } else {
        setProfile(null);
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(email: string, password: string, fullName: string) {
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });
    return { error: error as Error | null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return { error: error as Error | null };
  }

  async function signOut() {
    try {
      await AsyncStorage.multiRemove(STORAGE_KEYS_TO_CLEAR);
    } catch (e) {
      log('error', 'AsyncStorage multiRemove failed during signOut', {
        error: e instanceof Error ? e.message : String(e),
        operation: 'multiRemove',
        keys: STORAGE_KEYS_TO_CLEAR,
      });

      for (const key of STORAGE_KEYS_TO_CLEAR) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (removeErr) {
          log('error', 'AsyncStorage removeItem fallback failed', {
            error: removeErr instanceof Error ? removeErr.message : String(removeErr),
            operation: 'removeItem',
            key,
          });
        }
      }
    }

    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }
    return { error: error as Error | null };
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getRedirectUrl()}/reset-password`,
    });
    return { error: error as Error | null };
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    return { error: error as Error | null };
  }

  async function refreshProfile() {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      log('warn', 'Profile refresh failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    session,
    user,
    profile,
    loading,
    connectionStatus,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    refreshProfile,
  };
}

function getRedirectUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return 'https://cme-agent.vercel.app';
}

export { AuthContext };
export type { AuthContextType };
