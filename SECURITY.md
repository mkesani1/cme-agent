# CME Agent Security Guide

## 1) Security Architecture Overview

The CME Agent app uses Supabase for authentication, database access, and Edge Functions. The mobile/web client authenticates with Supabase Auth and receives a user-scoped JWT. All database access from the client must be constrained by Row Level Security (RLS), so users can only read/write their own records.

### Trust boundaries
- **Client app (Expo/React Native):** untrusted runtime; never assume client-side checks are sufficient.
- **Supabase Auth:** identity provider and token issuer.
- **Supabase Postgres + RLS:** primary authorization enforcement layer.
- **Edge Functions:** server-side logic boundary for privileged operations and integrations.

### Credential model
- `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are loaded from environment variables.
- The anon key is intended to be public, but exposure still increases operational risk if RLS is weak/misconfigured.
- **Never** ship service-role keys in client code.

## 2) Required RLS Policy Coverage

Enable RLS on every user-facing table and ensure policies are explicit. At minimum, verify these tables have RLS enabled and scoped policies:

1. `profiles`
   - Read/update only where `id = auth.uid()`
   - Insert allowed only for own `id`
2. `subscriptions` (or equivalent billing/subscription table)
   - Read only own records
   - Write restricted to backend/service context where appropriate
3. `course_recommendations`
   - Read only own recommendations
   - Insert/update from trusted backend path (Edge Function) or owner-only if required
4. `compliance_status`
   - Read only own status
   - Writes from trusted backend or owner-restricted workflow
5. `certificates` / `certificate_scans`
   - Read/write only own certificate metadata and scan results
6. `chat_sessions` and `chat_messages` (if present)
   - Access limited to conversation owner
7. `audit_logs` (if present)
   - No direct client writes unless strictly controlled
   - Read limited to the relevant user/tenant role

### RLS validation actions
- Confirm **RLS enabled** for each table.
- Confirm there is **no permissive policy** accidentally granting broad access.
- Test with two distinct user accounts to verify cross-account denial.
- Test unauthenticated access paths explicitly.

## 3) Environment Variable Setup Guide

Create a local `.env` from `.env.example`:

```bash
cp .env.example .env
```

Set values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Expo / EAS
- Add both variables in EAS project environment settings for each environment (`development`, `preview`, `production`).
- Keep values environment-specific (separate Supabase projects recommended for non-prod vs prod).

### Vercel (if web build hosted there)
- Add same variables under Project Settings → Environment Variables.
- Scope by environment (Preview/Production) as needed.

### Git hygiene
- Keep `.env*` files out of version control.
- Commit `.env.example` only.

## 4) Pre-Launch Security Checklist

### Secrets and key hygiene
- [ ] Remove any hardcoded Supabase URL/key from source history and current branches.
- [ ] Rotate previously exposed anon key in Supabase project settings.
- [ ] Confirm no service-role key exists in client bundle, logs, or CI output.

### Supabase hardening
- [ ] Verify RLS enabled on all user-facing tables.
- [ ] Review every policy for least privilege.
- [ ] Verify auth settings (email confirmation, password policy, session duration) align with risk posture.
- [ ] Restrict Edge Function CORS origins to known app domains where possible.

### Compliance and healthcare readiness
- [ ] If handling PHI, execute a signed BAA with required vendors (e.g., Supabase/hosting/providers as applicable).
- [ ] Document data retention and deletion workflows.
- [ ] Validate auditability of security-relevant events.

### App and operational controls
- [ ] Add runtime monitoring and error tracking (Sentry or equivalent).
- [ ] Ensure auth/network failures show user-safe messaging (slow/offline states).
- [ ] Validate sign-out clears local user data.
- [ ] Perform dependency and supply-chain scan before release.

## 5) Incident Response Basics

### Detection triggers
- Unusual auth failures/spikes
- Unexpected cross-user data visibility
- Suspected leaked credentials in repo/logs/chat
- Edge Function abuse patterns or traffic anomalies

### Immediate containment (first hour)
1. Rotate exposed keys/tokens immediately.
2. Disable vulnerable endpoint/policy path (temporary deny policy if needed).
3. Preserve logs and timelines for forensic review.
4. Notify internal owners (engineering, security, product).

### Investigation and eradication
- Identify root cause (policy misconfiguration, credential leak, code defect).
- Patch and validate in staging with adversarial tests.
- Review blast radius: affected users, data classes, and timeframe.

### Recovery and communication
- Re-enable services with verified controls.
- Notify affected stakeholders/users according to policy/regulatory obligations.
- Publish internal post-incident review with corrective actions and owners.

### Post-incident hardening
- Add regression tests for the failure mode.
- Add monitoring alerts for recurrence.
- Update playbooks and onboarding docs.
