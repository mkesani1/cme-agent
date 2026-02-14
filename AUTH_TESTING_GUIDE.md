# CME Agent Authentication System - Testing Guide

## Quick Start

### Running the App

```bash
# Start the Expo development server
npm start

# For iOS
npm run ios

# For Android
npm run android

# For Web
npm run web
```

## Test Scenarios

### Scenario 1: Demo Mode (Default)

**Current State:** `DEMO_MODE = true` in `src/lib/demoData.ts`

**Expected Behavior:**
- App launches directly to main app (tabs)
- No login screen shown
- User: "Geetha Chandrasekhar" (demo profile)
- All demo data loaded (licenses, courses, certificates)

**Steps:**
1. Start app with `npm start`
2. Should see main app immediately
3. Verify profile shows "Geetha Chandrasekhar"
4. Check profile screen displays sign out button

---

### Scenario 2: Sign Up Flow

**Setup:**
1. Set `DEMO_MODE = false` in `src/lib/demoData.ts`
2. Start app

**Expected Flow:**
```
App Launch → Loading → Login Screen
```

**Steps:**

1. **On Login Screen:**
   - Tap "Sign Up" link
   - Navigate to Sign Up Screen

2. **On Sign Up Screen:**
   - Enter Full Name: "Dr. Test User"
   - Enter Email: "test.user+{timestamp}@example.com" (unique each time)
   - Enter Password: "TestPassword123" (8+ chars)
   - Enter Confirm Password: "TestPassword123"
   - **Important:** Must check "I agree to the Terms of Service and Privacy Policy"
   - Tap "Create Account"

3. **Expected Behavior:**
   - Button shows loading state
   - After success, shows confirmation message
   - Auto-redirects to Email Verification Screen after 1.5 seconds

4. **On Email Verification Screen:**
   - Shows email address: "test.user+...@example.com"
   - Displays verification pending instructions
   - Button to "Resend Verification Email"
   - Link to "Back to Sign In"

5. **Email Verification:**
   - Check email inbox for verification email from Supabase
   - Click "Confirm your email" link in email
   - Should be redirected back to app
   - Verification screen shows success with checkmark
   - Auto-redirects to main app after 2 seconds

6. **Verify Success:**
   - Logged in to app
   - Can access main tabs
   - Profile screen shows user data

---

### Scenario 3: Login Flow

**Setup:**
1. Created account in Scenario 2
2. Set `DEMO_MODE = false`
3. App is on Login Screen

**Steps:**

1. **On Login Screen:**
   - Enter Email: (email from signup)
   - Enter Password: (password from signup)
   - Tap "Sign In"

2. **Expected Behavior:**
   - Button shows loading state
   - Session created
   - Checks for profile completion
   - Redirects to app or onboarding

3. **Verify Success:**
   - User profile visible on dashboard
   - Email matches login email
   - All user data synced

---

### Scenario 4: Forgot Password Flow

**Setup:**
1. Have an existing account (from Scenario 2)
2. On Login Screen

**Steps:**

1. **On Login Screen:**
   - Tap "Forgot password?" link
   - Navigate to Forgot Password Screen

2. **On Forgot Password Screen:**
   - Enter Email: (email from existing account)
   - Tap "Send Reset Link"

3. **Expected Behavior:**
   - Button shows loading state
   - After success, shows confirmation message
   - Message says "Check your email" for password reset link

4. **Email Reset:**
   - Check email inbox for password reset email
   - Click "Reset Password" link
   - Navigate to Reset Password Screen

5. **On Reset Password Screen:**
   - Should show loading while verifying token
   - After verification, shows password form
   - Enter New Password: "NewPassword123"
   - Enter Confirm Password: "NewPassword123"
   - Tap "Update Password"

6. **Expected Behavior:**
   - Button shows loading state
   - After success, shows success message
   - Displays "Password Updated!" confirmation
   - Button to "Sign In"

7. **Login with New Password:**
   - Tap "Sign In" button
   - Back on Login Screen
   - Enter email and NEW password
   - Should login successfully

---

### Scenario 5: Terms Checkbox Validation

**Setup:**
1. On Sign Up Screen
2. All fields filled except checkbox unchecked

**Steps:**

1. **Leave Terms Unchecked:**
   - Fill all other fields
   - Do NOT check "I agree to..." checkbox
   - Tap "Create Account"

2. **Expected Behavior:**
   - Error appears: "You must accept the terms and conditions to continue"
   - No API call made
   - Form remains on screen

3. **Check Terms:**
   - Tap checkbox to check it
   - Error disappears
   - Tap "Create Account" again
   - Should proceed with signup

---

### Scenario 6: Password Validation

**Setup:**
1. On Sign Up Screen

**Steps:**

1. **Test Password Length:**
   - Password: "short" (5 chars)
   - Confirm: "short"
   - Tap "Create Account"
   - Error: "Password must be at least 8 characters"

2. **Test Password Mismatch:**
   - Password: "TestPassword123"
   - Confirm: "DifferentPassword"
   - Tap "Create Account"
   - Error: "Passwords do not match"

3. **Test Valid Password:**
   - Password: "TestPassword123" (8+ chars)
   - Confirm: "TestPassword123"
   - Should pass validation

---

### Scenario 7: Email Format Validation

**Setup:**
1. On Sign Up or Login Screen

**Steps:**

1. **Invalid Email:**
   - Enter: "notanemail"
   - Should fail Supabase validation
   - Error returned from server

2. **Valid Email Formats:**
   - user@example.com ✓
   - user+tag@example.com ✓
   - user.name@example.co.uk ✓

---

### Scenario 8: Logout Flow

**Setup:**
1. Logged in (demo mode or real auth)
2. On any screen with bottom tab navigation

**Steps:**

1. **Navigate to Profile:**
   - Tap "Profile" tab (usually last tab)
   - See profile information
   - See profile gradient card with user data

2. **Sign Out:**
   - Scroll down to "Sign Out" button
   - Tap red "Sign Out" button
   - Alert appears: "Are you sure you want to sign out?"

3. **Confirm:**
   - Tap "Sign Out" in alert
   - Loading state (spinner shown)
   - Session cleared
   - Redirected to Login Screen

4. **Verify Logout:**
   - Cannot access main app tabs
   - Must login again to access

---

### Scenario 9: Session Persistence

**Setup:**
1. Logged in to app
2. On main app screen

**Steps:**

1. **Restart App:**
   - Stop app (`Ctrl+C`)
   - Don't clear cache/storage
   - Restart app: `npm start`

2. **Expected Behavior:**
   - Loading spinner shown briefly
   - Session restored from storage
   - User stays logged in
   - Directly enters main app

3. **Verify:**
   - Profile shows same user
   - All data intact

---

### Scenario 10: Demo Mode Fallback

**Setup:**
1. Set `DEMO_MODE = true` in `src/lib/demoData.ts`

**Steps:**

1. **Launch App:**
   - Start with `npm start`
   - Should skip login entirely

2. **Expected Behavior:**
   - Loading state briefly
   - Direct redirect to main app
   - Demo user profile loaded
   - Demo licenses displayed

3. **Verify Demo Data:**
   - Profile name: "Geetha Chandrasekhar"
   - Licenses: Texas, California, New York
   - Courses: Various CME courses loaded

---

## Validation Checklist

### Sign Up
- [ ] Form validates all fields required
- [ ] Password minimum 8 characters enforced
- [ ] Passwords must match
- [ ] Terms checkbox required
- [ ] Email format validated
- [ ] Unique email enforced (Supabase)
- [ ] Verification email sent
- [ ] Email verification link works
- [ ] Auto-redirect to app after email verify

### Login
- [ ] Email/password fields required
- [ ] Correct credentials login successfully
- [ ] Wrong password shows error
- [ ] Invalid email shows error
- [ ] Session created on success
- [ ] User profile synced from database

### Password Reset
- [ ] Email input required
- [ ] Reset email sent to correct address
- [ ] Reset link in email works
- [ ] Token verification works
- [ ] Password fields required
- [ ] Passwords must match
- [ ] New password minimum 8 characters
- [ ] Old password not reusable
- [ ] Success confirms password updated
- [ ] Can login with new password

### Email Verification
- [ ] Verification email sent
- [ ] Email link token valid
- [ ] Token expires appropriately
- [ ] Resend functionality works
- [ ] Success redirects to app
- [ ] User fully authenticated after verify

### Logout
- [ ] Confirmation alert shown
- [ ] Cancel cancels logout
- [ ] Confirm logs out
- [ ] Session cleared
- [ ] Redirects to login
- [ ] Cannot access app after logout

### Demo Mode
- [ ] DEMO_MODE=true skips auth
- [ ] Demo user data loaded
- [ ] Demo credentials work
- [ ] Can disable for testing

---

## Error Messages Reference

| Error | Cause | Solution |
|-------|-------|----------|
| "Please fill in all fields" | Missing required field | Complete all inputs |
| "Passwords do not match" | Confirm != Password | Retype password carefully |
| "Password must be at least 8 characters" | Password too short | Use 8+ character password |
| "You must accept the terms" | Terms checkbox unchecked | Check the checkbox |
| "Invalid email address" | Bad email format | Use valid email format |
| "User already registered" | Email exists | Use different email or login |
| "Invalid login credentials" | Wrong email/password | Check email and password |
| "Invalid or expired reset link" | Reset link expired | Request new password reset |
| "Failed to verify email" | Bad verification token | Resend verification email |

---

## Troubleshooting

### Sign Up Not Working
1. Check email is unique (not previously registered)
2. Verify email format is valid
3. Check internet connection
4. Check Supabase project is running
5. Check .env variables are set

### Email Not Arriving
1. Check spam/junk folder
2. Wait a few minutes (can be slow)
3. Check email address in confirmation message
4. Use "Resend" button for verification
5. Check Supabase email templates

### Can't Reset Password
1. Verify email exists in system
2. Check email for reset link
3. Link must be used within 24 hours
4. Try requesting new reset link
5. Check redirect URL config in Supabase

### Stuck on Loading
1. Check internet connection
2. Verify Supabase is accessible
3. Check browser console for errors
4. Try clearing app cache
5. Restart app

### Session Not Persisting
1. Check device storage available
2. Verify auth provider wraps app
3. Check onAuthStateChange listener
4. Verify session token in storage
5. Check device time is correct

---

## Performance Notes

### Expected Times
- Sign up form load: < 1 second
- Email send: 1-2 seconds
- Email delivery: 30 seconds - 5 minutes
- Login: 1-2 seconds
- Password reset: 1-2 seconds
- Session check: < 1 second

### Network Testing
- Test on slow 3G connection
- Test with offline mode
- Test with network interruption
- Verify retry logic works
- Check error messages display

---

## Device Testing

### iOS
- iPhone 12/13/14/15
- iPad
- Different iOS versions (13.0+)

### Android
- Android 5.0+
- Various screen sizes
- Different Android versions

### Web
- Chrome, Firefox, Safari
- Desktop and mobile responsive

---

## Continuous Integration

When deploying to production:

1. Run authentication flow end-to-end
2. Verify email sending works
3. Test all error paths
4. Check redirect URLs
5. Validate design consistency
6. Test on target devices
7. Check network behavior
8. Verify DEMO_MODE is false
9. Check .env variables
10. Run security scan

---

## Notes

- Demo mode is enabled by default for easy development
- All real auth requires working Supabase project
- Email verification may take 30+ seconds
- Password reset links expire after 24 hours
- Session tokens auto-refresh before expiration
- Clear app cache if auth state seems stuck
