# Pending Tasks Backlog

## Day 14 – Email System & Parent Reports
- [ ] Provision Resend client (`/lib/email/client.ts`) with `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, and default reply-to `support@emberdatalabs.co.uk`.
- [ ] Build React Email component library under `/emails/components` (Header, Footer, Button, Card) plus transactional templates under `/emails/templates` (Welcome, Password Reset, Subscription lifecycle, Payment Failed, Weekly Report).
- [ ] Implement `/lib/email/templates/index.ts` to export template registry for the sender layer.

## Day 14.2 – Weekly Progress Report Automation
- [ ] Create `/lib/email/reports/weeklyReportGenerator.ts` with data aggregation helpers for questions practiced, accuracy deltas, readiness gauge data, subject breakdown, highlights, and recommendations.
- [ ] Add `/lib/email/scheduler.ts` to orchestrate Monday 07:00 UK cron execution (batching, logging, retries).
- [ ] Implement `/app/api/cron/weekly-reports/route.ts` secured by `CRON_SECRET`, handling preview mode guards, pagination, and delivery summary notifications.
- [ ] Ensure WeeklyReportEmail template includes "View in browser" link, CTA to analytics, unsubscribe text, and footer compliance copy.

## Day 14.3 – Email Preferences & Notifications
- [ ] Ship migration `supabase/migrations/009_email_preferences.sql` to introduce `email_preferences` table with defaults, reminder cadence fields, timezone, and timestamps.
- [ ] Build `/app/(dashboard)/settings/notifications/page.tsx` + `/components/settings/NotificationSettings.tsx` with toggles, multi-select days, time picker, timezone selector, optimistic persistence, and Ascent/Summit gating.
- [ ] Implement `/app/api/notifications/preferences/route.ts` (GET/PUT) using Supabase auth context + Zod validation.
- [ ] Add `/app/(marketing)/unsubscribe/page.tsx` plus `/lib/email/unsubscribe.ts` helpers for token generation/validation, one-click unsubscribe, and preference management linkage.
- [ ] Wire reminders service (future) to respect preferences + streak checks; log opt-out actions for compliance.

### Shared Dependencies & Setup
- [ ] Add packages: `resend`, `@react-email/components`, `@react-email/tailwind`, and any SVG/icon helpers required for email rendering.
- [ ] Define secrets in `.env.local`/Vercel: `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_REPLY_TO`, `CRON_SECRET`, `UNSUBSCRIBE_TOKEN_SECRET`.
- [ ] Create testing plan covering plain-text fallbacks, spam score checks, and multi-client rendering (Gmail, Outlook, Apple Mail).
