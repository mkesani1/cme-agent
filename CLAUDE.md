# Claude Instructions

## ⚠️ CRITICAL: Mandatory Verification (Ralph Loop)

**EVERY task that involves code, fixes, or deployments MUST follow this loop:**

```
BUILD → TEST → VERIFY → If fails, REPEAT → Only say "done" when ALL pass
```

**You are NOT allowed to say a task is complete unless you have:**
1. Actually RUN the code (not just written it)
2. Actually TESTED the functionality (not assumed it works)
3. Actually VERIFIED the output (screenshots, logs, query results)
4. Actually COMPARED against requirements

**Banned phrases until verification is complete:**
- ❌ "This should work"
- ❌ "I've made the changes"
- ❌ "The code looks correct"

**Required evidence when reporting done:**
- What was built
- How it was tested (specific commands/actions)
- Proof it works (screenshots, test output, console logs)

---

## Available Integrations

Act independently using these services without asking for permission:

| Service | Capabilities |
|---------|-------------|
| **Supabase** | SQL queries, migrations, edge functions, schema management |
| **GitHub** | Issues, PRs, commits, repo management via `gh` CLI |
| **Vercel** | Deploy, list deployments, check build logs |
| **File System** | Full read/write access to this folder |

Chain operations across services when tasks require it (e.g., code → commit → deploy → verify).

---

## Verification Checklist (Reference)

Before saying "done", confirm:

- [ ] Code compiles/runs without errors
- [ ] Tests pass (actually run them)
- [ ] Feature works as specified (manually test it)
- [ ] UI matches design exactly (screenshot)
- [ ] No console errors or warnings
- [ ] Database state correct (query to verify)
- [ ] Deployment succeeded (check logs)

---

## Design Lock

Once a design element is agreed upon, it is **locked** and must not change without explicit permission.

### Rules

1. When user says "lock this" or "this is final" → add to `PROJECT_DESIGN.md`
2. Before delivering ANY work, check `PROJECT_DESIGN.md` and verify locked elements unchanged
3. If a fix seems to require changing a locked element → **ASK first**, don't just change it
4. Only modify what was specifically requested

### Locked elements include:
- Colors / color scheme
- Fonts / typography
- Icons / icon style
- Layout / spacing
- Component styles
- Any element explicitly marked as approved

### Project Design File

Each project should have a `PROJECT_DESIGN.md` that tracks locked decisions. When locking an element, record: what it is, the specific values, and the date locked.

---

## Security Audit (Pre-Deploy)

**Run security checks before ANY deployment.**

### Mandatory Checks

1. **Dependency Scan**
   ```bash
   npm audit          # Node.js
   pip-audit          # Python
   ```

2. **Secrets Detection**
   - No hardcoded API keys, passwords, tokens
   - .env files not committed to git
   - Environment variables used for all secrets

3. **Code Vulnerabilities**
   - No SQL injection (use parameterized queries)
   - No XSS (sanitize user input)
   - Input validation on all endpoints

4. **Supabase Security**
   - RLS enabled on all tables
   - RLS policies reviewed
   - Service role key NOT exposed to client

### Pre-Deploy Security Checklist

- [ ] `npm audit` shows 0 critical/high vulnerabilities
- [ ] No secrets in code (grep for api_key, secret, password)
- [ ] RLS enabled and policies verified (Supabase projects)
- [ ] Security headers configured
- [ ] SECURITY_AUDIT.md updated

### When to Run Full Audit

- Before production deployments
- After adding new dependencies
- After implementing authentication/authorization
- When handling sensitive data
- User requests security review

Use the **security-auditor** skill for comprehensive scanning.
