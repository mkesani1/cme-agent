# CME Agent Auth - Quick Start Guide

## Development Setup

### 1. Enable Demo Mode (Default)
```typescript
// src/lib/demoData.ts
export const DEMO_MODE = true; // ✓ Already set
```
- App auto-logs in with demo user
- No auth required for testing UI
- Demo user: "Geetha Chandrasekhar"

### 2. Run the App
```bash
npm start           # Start Expo
npm run ios         # Run on iOS simulator
npm run android     # Run on Android emulator
npm run web         # Run on web
```

## Using the Auth System in Your Code

### Access Auth State
```typescript
import { useAuth } from '../src/hooks/useAuth';

export function MyComponent() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text>Hello, {profile?.full_name}</Text>
      <Button onPress={signOut} title="Sign Out" />
    </View>
  );
}
```

### Sign In
```typescript
const { signIn } = useAuth();

async function handleLogin() {
  const { error } = await signIn('user@example.com', 'password123');
  if (error) {
    Alert.alert('Error', error.message);
  } else {
    // Navigate to next screen
  }
}
```

### Sign Up
```typescript
const { signUp } = useAuth();

async function handleSignUp() {
  const { error } = await signUp(
    'user@example.com',
    'password123',
    'John Smith'
  );
  if (error) {
    Alert.alert('Error', error.message);
  } else {
    // Redirect to email verification
  }
}
```

### Reset Password
```typescript
const { resetPassword } = useAuth();

async function handleForgotPassword() {
  const { error } = await resetPassword('user@example.com');
  if (error) {
    Alert.alert('Error', error.message);
  } else {
    // Show success message
  }
}
```

### Update Password
```typescript
const { updatePassword } = useAuth();

async function handlePasswordUpdate() {
  const { error } = await updatePassword('newPassword123');
  if (error) {
    Alert.alert('Error', error.message);
  }
}
```

### Update Profile
```typescript
const { updateProfile } = useAuth();

async function handleProfileUpdate() {
  const { error } = await updateProfile({
    full_name: 'Dr. New Name',
    specialty: 'Cardiology',
  });
  if (error) {
    Alert.alert('Error', error.message);
  }
}
```

## Check Auth Status in Navigation

```typescript
// Protect a route
import { useAuth } from '../src/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function ProtectedScreen() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <YourContent />;
}
```

## Environment Variables

Create `.env.local` (or `.env` for Expo):
```bash
EXPO_PUBLIC_SUPABASE_URL=https://[project].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

These are already configured in `app.json` if using Expo secrets.

## Testing Auth Flows

### Quick Test Checklist
1. ✓ Start app with `npm start`
2. ✓ See main app (demo mode)
3. ✓ Go to profile, tap Sign Out
4. ✓ Confirm logout works
5. ✓ Verify redirected to login

### Disable Demo Mode
```typescript
// src/lib/demoData.ts
export const DEMO_MODE = false; // Now requires real auth
```

Then test:
1. Sign up with new email
2. Check inbox for verification email
3. Click verification link
4. Should redirect to app
5. Logout and login again

## File Locations

```
Auth Screens:        app/(auth)/*.tsx
Auth Hook:           src/hooks/useAuth.ts
Auth Provider:       src/providers/AuthProvider.tsx
Theme/Colors:        src/lib/theme.ts
Supabase Client:     src/lib/supabase.ts
Demo Data:           src/lib/demoData.ts
```

## Common Tasks

### Disable Auth for a Screen
```typescript
const { session } = useAuth();
// Use session to conditionally show content
```

### Check if User is Authenticated
```typescript
const { session } = useAuth();
if (session) {
  // User is logged in
}
```

### Get User Email
```typescript
const { user } = useAuth();
const email = user?.email;
```

### Get User Profile Data
```typescript
const { profile } = useAuth();
const fullName = profile?.full_name;
const degree = profile?.degree_type;
```

### Redirect After Logout
```typescript
const { signOut } = useAuth();

async function logout() {
  await signOut();
  router.replace('/(auth)/login');
}
```

## Styling

All auth screens use the design system from `src/lib/theme.ts`:

```typescript
import { colors, spacing, typography } from '../../src/lib/theme';

// Colors
colors.text         // Light sand text
colors.accent       // Gold accent
colors.background   // Navy background
colors.success      // Green for success
colors.risk         // Red for errors

// Spacing
spacing.sm  // 8px
spacing.md  // 16px
spacing.lg  // 24px
spacing.xl  // 32px

// Typography
typography.h1       // Large headings
typography.body     // Body text
typography.label    // Labels and buttons
```

## Error Handling

Supabase returns error objects:
```typescript
const { error } = await signIn(email, password);

if (error) {
  console.log(error.message); // User-friendly message
  console.log(error.status);  // HTTP status
}
```

Common errors:
- `"Invalid login credentials"` - Wrong email/password
- `"User already registered"` - Email exists
- `"Invalid email address"` - Bad email format
- `"Invalid or expired reset link"` - Password reset expired
- `"Email not confirmed"` - Email verification pending

## Deep Links

For password reset and email verification to work:

### Android
Deep links configured in Supabase automatically

### iOS
Deep links configured in Supabase automatically

### Web
Redirects to `/reset-password` and `/verify-email` routes

## Debugging

### Enable Console Logs
```typescript
const { session, user, loading } = useAuth();

useEffect(() => {
  console.log('Auth state:', { session, user, loading });
}, [session, user, loading]);
```

### Check Storage
```typescript
// On web
localStorage.getItem('sb-auth-token');

// On mobile (handled by Supabase internally)
```

### Verify Network
```bash
# Check Supabase is reachable
curl https://[project].supabase.co/auth/v1/health
```

## Next Steps

1. **Review the documentation:**
   - `AUTH_SYSTEM.md` - Complete reference
   - `AUTH_TESTING_GUIDE.md` - Testing guide

2. **Test the flows:**
   - Sign up with real email
   - Verify email address
   - Login and logout
   - Test password reset

3. **Customize:**
   - Update email templates in Supabase
   - Customize colors if needed
   - Add additional profile fields

4. **Deploy:**
   - Set `DEMO_MODE = false`
   - Verify .env variables
   - Test on real devices
   - Enable email provider

## Support

For issues:
1. Check `AUTH_TESTING_GUIDE.md` troubleshooting
2. Check Supabase dashboard for errors
3. Check browser console for client-side errors
4. Verify network requests in DevTools
5. Check email templates and redirect URLs

## Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useAuth.ts` | Auth state and methods |
| `src/providers/AuthProvider.tsx` | Context provider |
| `app/(auth)/login.tsx` | Login screen |
| `app/(auth)/register.tsx` | Sign up screen |
| `app/(auth)/verify-email.tsx` | Email verification |
| `app/(auth)/forgot-password.tsx` | Password reset request |
| `app/(auth)/reset-password.tsx` | Set new password |
| `app/index.tsx` | Navigation router |
| `app/(tabs)/profile.tsx` | Profile with logout |

---

**That's it!** You're ready to use the authentication system. Start with demo mode enabled, then test the real flows by setting `DEMO_MODE = false`.
