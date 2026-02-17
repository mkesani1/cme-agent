import { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  useEffect(() => {
    let mounted = true;

    // BULLETPROOF safety net — app will NEVER hang longer than 5s.
    // This timeout is only cleared on unmount, never by callbacks.
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Safety timeout hit after 5s — forcing app to proceed');
        setLoading(false);
      }
    }, 5000);

    async function initAuth() {
      try {
        // Step 1: Get session (max 3s before we give up)
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
        ]);

        if (!mounted) return;

        // If getSession timed out or returned no session, go to login
        if (!sessionResult || !('data' in sessionResult) || !sessionResult.data.session?.user) {
          console.log('[Auth] No session — showing login');
          setLoading(false);
          return;
        }

        const sess = sessionResult.data.session;
        setSession(sess);
        setUser(sess.user);

        // Step 2: Load profile (max 2s before we proceed without it)
        try {
          const profileResult = await Promise.race([
            supabase.from('profiles').select('*').eq('id', sess.user.id).single(),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
          ]);

          if (mounted && profileResult && 'data' in profileResult && profileResult.data) {
            setProfile(profileResult.data as Profile);
          }
        } catch (profileErr) {
          console.warn('[Auth] Profile load failed:', profileErr);
        }

        if (mounted) setLoading(false);
      } catch (err) {
        console.warn('[Auth] initAuth failed:', err);
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen for FUTURE auth changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single();
            if (!error && data && mounted) {
              setProfile(data);
            }
          } catch (err) {
            console.warn('[Auth] Profile load in onAuthStateChange failed:', err);
          }
        } else {
          setProfile(null);
        }

        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(email: string, password: string, fullName: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { error: error as Error | null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
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

  return {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
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
