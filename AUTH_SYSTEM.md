# CME Agent Authentication System

## Overview

A complete authentication system for the CME Agent React Native app with signup, login, logout, password reset, and email verification flows. The system integrates with Supabase authentication and maintains session persistence.

## Architecture

### Components

#### 1. Authentication Context (`src/hooks/useAuth.ts`)
- Manages global auth state using React Context API
- Handles session persistence and token refresh
- Provides auth methods:
  - `signUp(email, password, fullName)` - Register new user
  - `signIn(email, password)` - Login with credentials
  - `signOut()` - Logout user
  - `resetPassword(email)` - Trigger password reset email
  - `updatePassword(password)` - Update user password
  - `updateProfile(updates)` - Update user profile
- Listens for auth state changes and syncs with Supabase
- Falls back to DEMO_MODE for unauthenticated browsing

#### 2. Auth Provider (`src/providers/AuthProvider.tsx`)
- Wraps the application root with AuthContext
- Provides auth state to all child components

### Auth Screens

#### 1. Login Screen (`app/(auth)/login.tsx`)
- Email/password login form
- "Forgot Password" link
- "Sign Up" redirect
- Form validation and error handling
- Loading state during authentication

**Features:**
- Email and password inputs
- Forgot password navigation
- Error message display
- Loading indicator during login

#### 2. Sign Up Screen (`app/(auth)/register.tsx`)
- Email/password registration form
- Full name input
- Password confirmation
- Terms and conditions checkbox
- Form validation (passwords match, min 8 characters)
- Email verification redirect after signup

**Features:**
- Full name, email, password inputs
- Password confirmation validation
- Terms acceptance required
- Auto-redirect to email verification
- Success message with confirmation email details

#### 3. Email Verification Screen (`app/(auth)/verify-email.tsx`)
- Displays verification pending state
- Handles email verification tokens from signup emails
- Resend verification email functionality
- Step-by-step instructions for user
- Auto-redirects on successful verification

**Features:**
- Email verification token handling
- Resend email button
- Clear instructions
- Spam folder tip
- Auto-redirect to app on success

#### 4. Forgot Password Screen (`app/(auth)/forgot-password.tsx`)
- Email input for password reset request
- Sends reset email via Supabase
- Success confirmation with email details
- Back to login button

**Features:**
- Email input
- Reset email sending
- Success message
- Back to login navigation

#### 5. Reset Password Screen (`app/(auth)/reset-password.tsx`)
- Handles password reset token verification
- New password and confirmation fields
- Token validation (from email link)
- Retry logic for flaky connections
- Success/error handling

**Features:**
- Token verification
- New password inputs
- Retry logic (3 attempts)
- Loading state during verification
- Success confirmation
- Expired token handling

### Routing Integration

#### Root Layout (`app/_layout.tsx`)
- Wraps entire app with AuthProvider
- Configures Stack navigation structure
- Provides MobileContainer for consistent layout

#### Root Index (`app/index.tsx`)
- Navigation hub for auth state
- Logic flow:
  1. Show loading spinner while checking auth
  2. If DEMO_MODE enabled → redirect to main app
  3. If no session → redirect to login
  4. If user incomplete profile → redirect to onboarding
  5. If fully authenticated → redirect to main app

#### Auth Layout (`app/(auth)/_layout.tsx`)
- Groups all auth screens under (auth) route group
- Screens: login, register, forgot-password, reset-password, verify-email

### Profile Screen Integration (`app/(tabs)/profile.tsx`)
- Displays user profile information
- Sign out button with confirmation alert
- Uses useAuth hook for logout
- Redirects to login after logout

## Session Management

### Session Persistence
- Supabase automatically handles session storage
- Auth state is restored from stored session on app startup
- Auto-refresh tokens before expiration

### Auth State Listener
- `onAuthStateChange` listener monitors Supabase auth state
- Syncs user profile from database when authenticated
- Clears state on logout

### Demo Mode
- Set `DEMO_MODE = true` in `src/lib/demoData.ts` for offline development
- Auto-logs in with demo credentials
- Allows browsing app without authentication
- Can be disabled for production auth testing

## Error Handling

### Validation
- Email format validation
- Password strength requirements (min 8 characters)
- Password confirmation matching
- Terms acceptance requirement
- Field required validation

### User Feedback
- Clear error messages from Supabase
- Network error handling
- Loading states during async operations
- Success confirmations with next steps

## Security Features

### Password Security
- Minimum 8 characters required
- Passwords never logged or displayed in logs
- Uses Supabase secure password endpoints
- Email verification for signup

### Token Management
- Tokens managed entirely by Supabase client SDK
- Auto-refresh handled by SDK
- Session tokens stored securely by platform

### Protected Routes
- Unauthenticated users redirected to login
- Profile/onboarding protected by session check
- Demo mode allows fallback browsing

## Design System Integration

### Colors (from `src/lib/theme.ts`)
- Primary accent: Gold (`#A68B5B`)
- Backgrounds: Navy (`#0D1321`)
- Text: Light sand (`#FAF8F5`)
- Error states: Risk red (`#B85C5C`)
- Success states: Green (`#5D8A66`)

### Typography
- Headers: Bold (700)
- Body: Regular (400)
- Labels: Medium (500)
- Responsive sizing for mobile

### Spacing & Radius
- Consistent spacing scale (4px, 8px, 16px, 24px, 32px, 48px)
- Rounded borders (8px, 12px, 16px)
- Card styling with subtle borders

## API Reference

### useAuth Hook

```typescript
interface AuthContextType {
  session: Session | null;           // Current auth session
  user: User | null;                // Supabase user object
  profile: Profile | null;           // User profile from database
  loading: boolean;                  // Loading state
  signUp(email, password, fullName): Promise<{ error }>
  signIn(email, password): Promise<{ error }>
  signOut(): Promise<void>
  resetPassword(email): Promise<{ error }>
  updatePassword(password): Promise<{ error }>
  updateProfile(updates): Promise<{ error }>
}
```

### Usage Example

```typescript
import { useAuth } from '../src/hooks/useAuth';

export function MyComponent() {
  const { user, profile, signOut } = useAuth();

  return (
    <View>
      <Text>Hello, {profile?.full_name}</Text>
      <Button onPress={signOut} title="Sign Out" />
    </View>
  );
}
```

## File Structure

```
cme-agent/
├── app/
│   ├── index.tsx                    # Root navigation router
│   ├── _layout.tsx                  # Root layout with AuthProvider
│   ├── (auth)/                      # Auth screens group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   └── verify-email.tsx
│   ├── (tabs)/
│   │   ├── profile.tsx              # Updated with sign out
│   │   └── ...
│   └── (onboarding)/
│       └── ...
├── src/
│   ├── hooks/
│   │   └── useAuth.ts               # Auth context and hook
│   ├── providers/
│   │   └── AuthProvider.tsx         # Context provider
│   ├── lib/
│   │   ├── theme.ts                 # Design tokens
│   │   ├── supabase.ts              # Supabase client
│   │   └── demoData.ts              # Demo credentials
│   ├── components/
│   │   └── ui/                      # UI components
│   └── types/
│       └── database.ts              # Type definitions
└── package.json
```

## Flow Diagrams

### Authentication Flow
```
Unauthenticated User
        ↓
    index.tsx
        ↓
   Check Auth
        ├─→ No session → Login Screen
        │         ↓
        │   Email/Password
        │         ↓
        │   Verify with Supabase
        │         ↓
        │   Success → Redirect to /
        │
        ├─→ Has session, incomplete profile
        │         ↓
        │   Onboarding Flow
        │
        └─→ Fully authenticated
                ↓
            Main App (Tabs)
```

### Sign Up Flow
```
Sign Up Screen
        ↓
 Enter Details
        ↓
 Validate Form
        ↓
 Call signUp()
        ↓
 Supabase creates user
 and sends verification email
        ↓
 Redirect to verify-email
        ↓
 Display verification pending
        ↓
 User clicks email link
        ↓
 Verify token with Supabase
        ↓
 Create session
        ↓
 Auto-redirect to / (main app)
```

### Password Reset Flow
```
Login Screen
        ↓
 Forgot Password Link
        ↓
 Forgot Password Screen
        ↓
 Enter Email
        ↓
 Send Reset Email (Supabase)
        ↓
 Show Success Message
        ↓
 User clicks email link
        ↓
 Reset Password Screen
        ↓
 Verify token
        ↓
 Enter New Password
        ↓
 Update Password (Supabase)
        ↓
 Show Success
        ↓
 Redirect to Login
```

## Testing

### Manual Testing Checklist
- [ ] Sign up with new email
- [ ] Verify email via confirmation link
- [ ] Login with registered account
- [ ] Logout from profile
- [ ] Forgot password flow
- [ ] Reset password with link
- [ ] Terms checkbox validation
- [ ] Form validation (password requirements)
- [ ] Demo mode fallback
- [ ] Session persistence (close/reopen app)

### Demo Mode
For testing without Supabase:
1. Set `DEMO_MODE = true` in `src/lib/demoData.ts`
2. App auto-logs in with demo credentials
3. Uses mock data for licenses, courses, certificates

## Configuration

### Environment Variables
```
EXPO_PUBLIC_SUPABASE_URL=https://[project].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

### Deep Links (Password Reset)
- Web: Redirects to `/reset-password`
- Mobile: Uses `cme-agent://reset-password`
- Email verification: `cme-agent://verify-email?token_hash=...&type=signup`

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Social sign-in (Google, Apple)
- [ ] Biometric authentication
- [ ] Session timeout handling
- [ ] Account deletion flow
- [ ] Email change verification
- [ ] Password requirements policy
- [ ] Signin attempt limits
- [ ] Account recovery questions

## Troubleshooting

### Common Issues

**"Email already registered"**
- User already has an account with that email
- Suggest forgot password or sign in

**"Invalid or expired reset link"**
- Reset link expired (usually 24 hours)
- Request new password reset email

**"Email verification not working"**
- Check spam folder
- Use "Resend verification email" button
- Ensure email is correct

**"Stuck on verification screen"**
- Check browser/app deep link configuration
- Verify email link format in Supabase settings
- Check redirect URL configuration

## Related Documentation

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Expo Router Navigation](https://docs.expo.dev/routing/introduction/)
- [React Context API](https://react.dev/reference/react/useContext)
- [React Native Safe Area](https://github.com/th3rdwave/react-native-safe-area-context)
