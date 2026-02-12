# CME Agent - Security Audit Report
**Date:** February 12, 2026
**Project:** cme-agent
**Supabase Project ID:** drwpnasiqgzqdubmlwxj

---

## Executive Summary

This comprehensive security audit identified **3 critical issues** and **1 warning** that need immediate remediation. The application has some strong security foundations (RLS enabled, JWT verification), but exposes sensitive credentials in client code and has unpatched dependency vulnerabilities.

**Risk Level:** HIGH - Immediate action required before production deployment

---

## Findings

### 1. CRITICAL: Hardcoded Supabase Anon Key in Source Code

**Severity:** CRITICAL
**File:** `/src/lib/supabase.ts` (Lines 6-7)
**Status:** VULNERABLE

```typescript
const supabaseUrl = 'https://drwpnasiqgzqdubmlwxj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd3BuYXNpcWd6cWR1Ym1sd3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzE5MzAsImV4cCI6MjA4NTgwNzkzMH0.26RVUHuFDcYfMBLTsodSP9jUE01qYRn9bfQ-nfqtt7Y';
```

**Issue:**
- Supabase anon key is publicly visible in the source code
- This key can be extracted from git history, compiled bundles, and network traffic
- Anyone with this key can access the Supabase backend directly
- The key is also visible in the compiled web bundle in `/dist/`

**Recommendations:**
1. Regenerate the anon key immediately in Supabase (Settings → API)
2. Move credentials to environment variables using EXPO_PUBLIC_* prefix (already configured in app.json but not being used)
3. Update `.gitignore` to include `src/lib/supabase.ts` if storing credentials locally, or use CI/CD environment injection
4. Verify git history to remove leaked key from all commits using `git-filter-repo`

**Implementation:**
```typescript
// Use environment variables instead
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://drwpnasiqgzqdubmlwxj.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
```

---

### 2. ~~CRITICAL: NPM Dependency Vulnerabilities~~ ✅ RESOLVED

**Severity:** ~~CRITICAL (2 critical, 5 high, 1 moderate)~~ → **RESOLVED**
**Status:** ✅ FIXED (February 12, 2026)

**Resolution:**
- Removed unused `surge` package from dependencies
- All 8 vulnerabilities eliminated
- `npm audit` now reports 0 vulnerabilities

**Original Vulnerable Packages (now removed):**
| Package | Severity | Status |
|---------|----------|--------|
| form-data | CRITICAL | ✅ Removed with surge |
| axios | HIGH | ✅ Removed with surge |
| qs | HIGH | ✅ Removed with surge |
| tough-cookie | MODERATE | ✅ Removed with surge |

**Verification:**
```bash
$ npm audit
found 0 vulnerabilities
```

---

### 3. CRITICAL: Edge Functions with JWT Verification Disabled

**Severity:** CRITICAL
**Status:** VULNERABLE

**Affected Functions:**
| Function | Verify JWT | Recommendation |
|----------|-----------|-----------------|
| subscription-webhook | ❌ FALSE | Verify purpose; implement webhook signature verification if intentional |
| update-course-data | ❌ FALSE | Likely should be TRUE; investigate intent |

**Protected Functions (Correct):**
| Function | Verify JWT | Status |
|----------|-----------|--------|
| cme-chat | ✅ TRUE | Good |
| get-compliance-status | ✅ TRUE | Good |
| get-course-recommendations | ✅ TRUE | Good |
| scan-certificate | ✅ TRUE | Good |

**Issue:**
- `subscription-webhook` and `update-course-data` accept unauthenticated requests
- While webhooks legitimately need to be unauthenticated, they lack alternative protection mechanisms
- `update-course-data` should almost certainly require JWT verification

**Recommendations:**
1. For `subscription-webhook`: Implement webhook signature verification (HMAC-SHA256)
2. For `update-course-data`: Enable JWT verification immediately
3. Add request origin validation and rate limiting to webhook endpoints
4. Document why JWT is disabled for each function

---

### 4. HIGH: Missing Password Strength Protection

**Severity:** HIGH (Security Warning)
**Source:** Supabase Security Advisors
**Status:** WARNING

**Issue:**
- Leaked Password Protection is disabled in Auth settings
- The application doesn't check against HaveIBeenPwned.org database
- Users can set passwords from compromised password databases

**Recommendations:**
1. Enable Leaked Password Protection in Supabase Auth settings
2. Add client-side password strength validation
3. Implement password scoring (zxcvbn library)
4. Display password requirements to users

---

## Row Level Security (RLS) Status

**Status:** ✅ GOOD - All tables have RLS enabled

**Tables with RLS Enabled (17 total):**
- profiles, licenses, license_requirements, dea_registrations
- certificates, credit_allocations, state_requirements
- subscriptions, chat_messages, notifications
- expert_consultations, courses, push_tokens
- provider_connections, agencies

**Note:** Verify that RLS policies are correctly configured in Supabase dashboard to ensure users can only access their own data. The audit shows RLS is enabled, but policy configuration details require Supabase dashboard inspection.

---

## Environment Configuration

**Status:** ✅ GOOD - Environment variables properly configured

- ✅ `.gitignore` includes `.env*.local`
- ✅ `app.json` uses `$EXPO_PUBLIC_SUPABASE_URL` and `$EXPO_PUBLIC_SUPABASE_ANON_KEY` variables
- ✅ Credentials not in `.env` files (but hardcoded in source instead)
- ⚠️ **Action Required:** Actual implementation in source code uses hardcoded values, not environment variables

---

## Service Role Key Exposure

**Status:** ✅ GOOD - No service role keys found in client code

- Service role key not exposed in TypeScript/JavaScript files
- All API calls use anonymous key or session JWT
- Database access controlled by RLS policies

---

## Secrets Detection

**Status:** ✅ GOOD - No API keys, passwords, or tokens hardcoded

Findings from grep analysis:
- No hardcoded API keys beyond Supabase anon key (which is acceptable but should be in env vars)
- No database passwords or connection strings
- No third-party service tokens
- Auth tokens only used from session management (correct pattern)

---

## Code Quality Observations

**Positive Findings:**
1. ✅ Authentication properly delegated to Supabase Auth
2. ✅ Edge functions use JWT verification for sensitive operations
3. ✅ Database helpers use parameterized queries (Supabase PostgREST)
4. ✅ No SQL injection vulnerabilities evident
5. ✅ Input validation present in auth flows
6. ✅ Proper error handling (throwing on API errors)

**Concerns:**
1. ⚠️ Dependency on `surge` package with multiple transitive vulnerabilities
2. ⚠️ Web bundle contains hardcoded credentials (visible in dist/)
3. ⚠️ No HTTPS enforcement at app level (relies on platform)
4. ⚠️ No certificate pinning for Supabase connections

---

## Security Checklist

- [x] Dependencies scanned for vulnerabilities (8 found)
- [x] Hardcoded secrets searched for
- [ ] Dependency vulnerabilities resolved (ACTION REQUIRED)
- [ ] RLS policies enabled on all tables
- [ ] Service role key not exposed
- [x] .env files in .gitignore
- [ ] Supabase credentials using environment variables (ACTION REQUIRED)
- [ ] Edge Functions JWT verification reviewed (ISSUES FOUND)
- [x] Leaked password protection (ACTION REQUIRED)
- [ ] Pre-production security checklist completed

---

## Remediation Priority

### IMMEDIATE (Before any deployment):
1. **Move Supabase credentials to environment variables**
   - Create `.env.local` with keys (not committed)
   - Update `src/lib/supabase.ts` to use process.env
   - Regenerate exposed anon key in Supabase dashboard

2. **Enable JWT verification on update-course-data**
   - Change `verify_jwt: false` to `verify_jwt: true`
   - Ensure function validates caller permissions

3. **Remediate NPM vulnerabilities**
   - Run `npm audit fix --force`
   - Review and remove `surge` dependency
   - Test deployment pipeline after fixes

### SHORT TERM (Before production):
1. **Fix subscription-webhook authentication**
   - Implement webhook signature verification (HMAC)
   - Add request origin validation
   - Store webhook secret in Supabase Edge Function secrets

2. **Enable password protection**
   - Enable Leaked Password Protection in Auth
   - Add frontend validation

3. **Clean git history**
   - Remove leaked key from all commits using git-filter-repo
   - Force push to all remotes (after team coordination)

### MEDIUM TERM (Next sprint):
1. Add certificate pinning for Supabase connections
2. Implement rate limiting on all endpoints
3. Add security headers to web app
4. Regular dependency audits (monthly)
5. Document RLS policies and security model

---

## Additional Security Recommendations

### Authentication & Authorization
- [ ] Add MFA/2FA support for user accounts
- [ ] Implement session timeout with re-authentication
- [ ] Add account lockout after N failed login attempts
- [ ] Log authentication events for audit trails

### API Security
- [ ] Rate limiting on all endpoints
- [ ] API key rotation mechanism
- [ ] Request signing for critical operations
- [ ] DDoS protection for webhook endpoints

### Infrastructure
- [ ] Enable HTTPS-only for all communications
- [ ] Add security headers (CSP, HSTS, X-Frame-Options)
- [ ] WAF protection for web app
- [ ] Regular security patching schedule

### Compliance
- [ ] Document data handling procedures (HIPAA if applicable)
- [ ] Add privacy policy and terms of service
- [ ] Implement audit logging
- [ ] Data retention and deletion policies

---

## Testing Recommendations

1. **Dependency Testing**
   ```bash
   npm audit
   npm audit fix
   npm test
   ```

2. **Security Testing**
   - Run OWASP ZAP or Burp Suite on web deployment
   - Test JWT validation on Edge Functions
   - Verify RLS policies with unauthorized user
   - Test rate limiting

3. **Credential Rotation Testing**
   - Rotate Supabase keys in dev environment
   - Verify app still works with new credentials
   - Confirm old key is revoked

---

## References

- [Supabase Security Best Practices](https://supabase.com/docs/guides/self-hosting/security)
- [OWASP Top 10 2023](https://owasp.org/www-project-top-ten/)
- [NPM Audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Supabase RLS Guide](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security)

---

## Audit Completion

| Check | Status |
|-------|--------|
| npm audit | ✅ Executed - 8 vulnerabilities found |
| Hardcoded secrets search | ✅ Executed - 1 critical finding |
| RLS verification | ✅ Executed - All enabled |
| Edge Function JWT check | ✅ Executed - 2 issues found |
| .gitignore review | ✅ Executed - Properly configured |
| Service role exposure | ✅ Executed - None found |

**Audit Status:** COMPLETE - Ready for remediation
