/**
 * useAuth hook tests
 *
 * These tests verify the auth flow behaves correctly, especially:
 * - Race condition: loading must be true during sign-in transition
 * - Session propagation: onAuthStateChange updates state correctly
 * - Profile loading: handles missing/existing profiles
 * - Sign-out: clears all state
 * - Error handling: timeouts, network errors
 */

// --- Supabase mock setup ---
let authChangeCallback: ((event: string, session: any) => void) | null = null;
const mockUnsubscribe = jest.fn();
const mockGetSession = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockUpdateUser = jest.fn();
const mockProfileSelect = jest.fn();
const mockProfileInsert = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: any[]) => mockGetSession(...args),
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      signOut: (...args: any[]) => mockSignOut(...args),
      resetPasswordForEmail: (...args: any[]) => mockResetPasswordForEmail(...args),
      updateUser: (...args: any[]) => mockUpdateUser(...args),
      onAuthStateChange: (callback: any) => {
        authChangeCallback = callback;
        return {
          data: {
            subscription: { unsubscribe: mockUnsubscribe },
          },
        };
      },
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => mockProfileSelect(),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: () => mockProfileInsert(),
            }),
          }),
          update: () => ({
            eq: () => ({ error: null }),
          }),
        };
      }
      return {};
    },
  },
}));

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthProvider } from '../useAuth';

// Helper: create a fake session
function fakeSession(userId = 'user-123') {
  return {
    user: {
      id: userId,
      email: 'test@example.com',
      user_metadata: { full_name: 'Dr. Test' },
    },
    access_token: 'fake-token',
    refresh_token: 'fake-refresh',
  };
}

// Helper: create a fake profile
function fakeProfile(userId = 'user-123') {
  return {
    id: userId,
    full_name: 'Dr. Test',
    degree_type: 'MD',
    specialty: 'Internal Medicine',
    role: null,
    agency_id: null,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  };
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  authChangeCallback = null;

  // Default: no session on init
  mockGetSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });
  mockSignOut.mockResolvedValue({ error: null });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useAuthProvider', () => {
  // ===== INITIALIZATION =====

  test('starts with loading=true', () => {
    const { result } = renderHook(() => useAuthProvider());
    expect(result.current.loading).toBe(true);
  });

  test('sets loading=false when no session exists', async () => {
    const { result } = renderHook(() => useAuthProvider());

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
  });

  test('loads existing session + profile on init', async () => {
    const session = fakeSession();
    const profile = fakeProfile();

    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });
    mockProfileSelect.mockResolvedValue({
      data: profile,
      error: null,
    });

    const { result } = renderHook(() => useAuthProvider());

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.session).toEqual(session);
    expect(result.current.user).toEqual(session.user);
    expect(result.current.profile).toEqual(profile);
  });

  // ===== SIGN-IN RACE CONDITION (the bug we fixed) =====

  test('CRITICAL: sets loading=true on SIGNED_IN event before profile loads', async () => {
    const { result } = renderHook(() => useAuthProvider());

    // Wait for init to complete (no session)
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate slow profile load
    mockProfileSelect.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        data: fakeProfile(),
        error: null,
      }), 1500))
    );

    // Simulate SIGNED_IN event (this is what happens after signInWithPassword)
    const session = fakeSession();
    await act(async () => {
      authChangeCallback?.('SIGNED_IN', session);
    });

    // CRITICAL CHECK: loading must be true IMMEDIATELY after SIGNED_IN
    // This is the race condition fix — without it, index.tsx sees
    // loading=false + session=null and redirects back to login
    expect(result.current.loading).toBe(true);
    expect(result.current.session).toEqual(session);
  });

  test('CRITICAL: loading becomes false AFTER profile loads (not before)', async () => {
    const { result } = renderHook(() => useAuthProvider());

    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Profile loads quickly
    mockProfileSelect.mockResolvedValue({
      data: fakeProfile(),
      error: null,
    });

    const session = fakeSession();
    await act(async () => {
      authChangeCallback?.('SIGNED_IN', session);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    // By the time loading is false, profile should be loaded
    expect(result.current.profile).toEqual(fakeProfile());
  });

  // ===== SAFETY TIMEOUT =====

  test('safety timeout forces loading=false after 5s', async () => {
    // Make getSession hang forever
    mockGetSession.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useAuthProvider());
    expect(result.current.loading).toBe(true);

    // Advance past safety timeout
    await act(async () => {
      jest.advanceTimersByTime(5100);
    });

    expect(result.current.loading).toBe(false);
  });

  // ===== SIGN-OUT =====

  test('sign-out clears session, user, and profile', async () => {
    const session = fakeSession();
    const profile = fakeProfile();

    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });
    mockProfileSelect.mockResolvedValue({
      data: profile,
      error: null,
    });

    const { result } = renderHook(() => useAuthProvider());

    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    await waitFor(() => {
      expect(result.current.session).not.toBeNull();
    });

    // Sign out
    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(mockSignOut).toHaveBeenCalled();
  });

  // ===== SIGN-IN FUNCTION =====

  test('signIn calls supabase.auth.signInWithPassword', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuthProvider());

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    let signInResult: any;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'password123');
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(signInResult.error).toBeNull();
  });

  test('signIn returns error on bad credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: new Error('Invalid login credentials'),
    });

    const { result } = renderHook(() => useAuthProvider());

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    let signInResult: any;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'wrong');
    });

    expect(signInResult.error).toBeTruthy();
    expect(signInResult.error.message).toContain('Invalid login credentials');
  });

  // ===== PROFILE MISSING (FALLBACK CREATION) =====

  test('creates fallback profile when profile missing on init', async () => {
    const session = fakeSession();

    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });
    // Profile doesn't exist
    mockProfileSelect.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'not found' },
    });
    // Insert creates it
    mockProfileInsert.mockResolvedValue({
      data: { id: 'user-123', full_name: 'Dr. Test', degree_type: null },
      error: null,
    });

    const { result } = renderHook(() => useAuthProvider());

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Profile insert should have been called
    expect(mockProfileInsert).toHaveBeenCalled();
  });

  // ===== CLEANUP =====

  test('unsubscribes from auth listener on unmount', () => {
    const { unmount } = renderHook(() => useAuthProvider());
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  // ===== SIGNED_OUT EVENT =====

  test('clears state on SIGNED_OUT auth event', async () => {
    const session = fakeSession();
    const profile = fakeProfile();

    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });
    mockProfileSelect.mockResolvedValue({
      data: profile,
      error: null,
    });

    const { result } = renderHook(() => useAuthProvider());

    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    await waitFor(() => {
      expect(result.current.session).not.toBeNull();
    });

    // Simulate SIGNED_OUT event
    await act(async () => {
      authChangeCallback?.('SIGNED_OUT', null);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.session).toBeNull();
    });
    expect(result.current.profile).toBeNull();
  });
});
