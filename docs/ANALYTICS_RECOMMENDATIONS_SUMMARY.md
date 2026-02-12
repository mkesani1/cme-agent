# CME Agent - Analytics & Monitoring Quick Reference

## TL;DR - Recommended Tools

### Error Monitoring: **SENTRY**
```bash
npx expo install @sentry/react-native
npm exec @sentry/wizard@latest -i reactNative
```
- Free tier: 5,000 events/month
- Setup time: ~5 minutes
- Best React Native/Expo support
- Session replay, breadcrumbs, source maps included

### Analytics: **POSTHOG** (Primary) or **APTABASE** (Privacy-First)
```bash
# PostHog
npx expo install posthog-react-native

# Aptabase
npx expo install aptabase-react-native
```

| Feature | PostHog | Aptabase |
|---------|---------|----------|
| Free events/month | 1,000,000 | Generous | 
| Session replay | ✅ Yes | ❌ No |
| User-level tracking | ✅ Yes | ❌ Anonymous only |
| Privacy focus | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Self-hosting | ✅ Open source | ✅ Open source |
| **Best for** | Feature-rich, user analytics | Privacy-first, HIPAA-sensitive |

---

## Core Events to Track (Post Launch)

### Must-Have (Phase 1)
- `user_signup` - Track signups
- `course_started` - Track enrollment
- `course_completed` - Track completion
- `quiz_completed` - Track knowledge checks
- `certificate_claimed` - Track credential achievements

### Nice-to-Have (Phase 2)
- `subscription_started` - Track conversions
- `course_abandoned` - Track dropout
- `user_inactive` - Identify at-risk users
- `app_error_occurred` - Combined with Sentry

### Advanced (Phase 3)
- Funnel analysis: Signup → First course → Completion
- Retention cohorts: 7-day, 30-day retention
- Feature flags: A/B test course recommendations

---

## Implementation Timeline

**Week 1:** Sentry setup + core event tracking
**Week 2:** PostHog dashboard creation + additional events
**Week 3:** Funnel analysis + data validation
**Week 4:** Insights extraction + optimization

---

## Cost Estimate
- **At launch**: $0/month (both stay in free tiers)
- **At 100K events/month**: ~$95/month (Sentry + PostHog)
- **At scale**: PostHog $0.00045/event, very predictable

---

## Critical Next Steps
1. Create Sentry account and get DSN
2. Create PostHog account and get API key
3. Follow full setup guide in `ANALYTICS_SETUP.md`
4. Test with dummy events before production
5. Deploy to Expo EAS with environment variables

---

**Full documentation**: See `ANALYTICS_SETUP.md` for complete setup instructions, code snippets, and CME-specific event recommendations.
