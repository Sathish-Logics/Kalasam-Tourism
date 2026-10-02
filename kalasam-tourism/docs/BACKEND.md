# Backend setup and operations

The application uses Supabase Postgres, Auth and Storage. Public content is read with a cookie-free publishable client. Staff pages and server actions use the staff member's verified Auth session and check `staff_users` on every operation. RLS enforces the same boundary in Postgres. Only the inquiry endpoint uses the server credential.

## Configure a project

1. Create separate Supabase projects for staging and production. Run `supabase/migrations/202610010001_initial.sql`, then `202610010002_retention_schedule.sql`, in order with the Supabase CLI or project SQL editor. The latter enables `pg_cron` and schedules retention. No migration is run automatically by the application.
2. Copy `.env.example` to `.env.local` for local development, and configure matching environment variables in the deployment host. Use the publishable key (the legacy anon key is also supported as `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Keep `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` and `RATE_LIMIT_SALT` server-only. Generate a random salt of at least 32 characters, e.g. `openssl rand -hex 32`.
3. Set `NEXT_PUBLIC_SITE_URL` to the actual origin. Keep the site's indexing flag disabled for previews and before content approval. Rebuild/redeploy after changing public environment variables.
4. In Supabase Auth, **disable new user signups** and anonymous sign-ins. Set the Site URL to the application origin and allow only the intended production/local redirect URLs. Configure custom SMTP for reliable staff invitations.
5. Invite each staff member from Supabase Auth. Add their immutable Auth user ID to `staff_users` using an operator account. There is intentionally no public signup or staff self-enrollment.

```sql
insert into public.staff_users(user_id)
values ('replace-with-invited-auth-user-uuid');
```

Removing a row immediately removes dashboard access and database privileges for that account. Configure the invitation email to use the application's `/auth/confirm` token-hash route as described in the app README; invited users then set their password at `/admin/password`. Existing staff can sign in with email/password. Do not put staff names/emails or credentials in migrations.

## Content and media

The dashboard edits `content_entries` with kinds `destination`, `journey`, `circuit`, `service`, and `testimonial`. The `save_content_entry(payload jsonb)` RPC saves all entry fields atomically. Database triggers preserve old URLs on slug changes and rewrite existing aliases to the latest URL. Reusing an old alias or changing an existing entry's kind is rejected. Service slugs are fixed: `family-ceremonies`, `senior-assistance`, `b2b-partners`. Testimonials do not get standalone URLs.

The singleton `site_settings` row has `id=true`. Only its client-approved public information belongs there. Publish the approved privacy notice, consent text, and a nonempty consent version before opening inquiry forms. Change `consent_version` whenever the approved wording changes and retain the associated policy version in the client's policy records. Notifications and server secrets are deployment configuration, never public settings.

The `media` bucket is public and accepts JPEG, PNG, WebP and AVIF up to 5 MB. Staff alone can upload/change/delete objects. Upload only licensed images approved for public viewing: an unpublished entry does not make its media private. Do not upload passports, contact lists or other private documents. Use the dashboard's image upload and copy its public URL into the entry's image fields. Meaningful alt text is required before publishing.

Before Supabase is configured, public routes show local demonstration content. Once it is configured, only database content is used, including an empty database. Database errors produce an error state, never a silent fallback to demo material. The migration deliberately creates no fictional published tours or testimonials; create and approve actual entries in the dashboard before launch.

## Inquiry API and notifications

`POST /api/inquiries` accepts JSON: `type`, `name`, `email`, `phone`, `country`, `travelWindow`, `travelerCount`, `interests`, `message`, `consent`, `sourcePath`, and optional empty `website` honeypot. Types are `journey`, `ceremony`, `senior`, `partner`, `contact`. Either email or phone is required. Country and a message of at least 10 characters are required. `travelerCount` is an integer from 1 through 100 or null. Consent must be `true`; source paths are local paths without query parameters.

Bodies are limited to 16 KB, including streamed requests. Validation returns HTTP 400 with `{error, fieldErrors}`; oversized bodies return 413, unsupported content types 415, rejected origins 403, and rate limits 429 with `Retry-After`. The endpoint returns 503 if secure storage or approved privacy configuration is missing. It never simulates a successful submission.

The endpoint saves the inquiry first and returns HTTP 201 `{id, status:"received"}` after attempting notification. Missing email configuration, a rejected provider request, or timeout marks the notification failed while keeping the stored receipt. A status-write outage leaves `pending`; the maintenance job marks such stale records failed after an hour. A pending/failed notification never means the inquiry was lost.

Configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL` from a verified sending domain, and `INQUIRY_NOTIFICATION_EMAIL`. Notification messages contain only inquiry type, receipt ID and a dashboard link; traveler contact data stays in the dashboard. The API uses a deterministic Resend idempotency key and an eight-second provider timeout. `sent` means the provider accepted the request; it does not assert inbox delivery. There is no automatic retry or bounce webhook in v1; staff should review failed/pending notifications in the dashboard. Keep the endpoint runtime's allowed execution time above the notification timeout plus database round trips.

## Spam controls and privacy

The database atomically limits each hashed contact identifier to three requests per 15 minutes. If `INQUIRY_IP_HEADER` names a header that the deployment host **overwrites with the trusted client IP**, that IP gets a ten-request limit per 15 minutes. Never trust a client-controlled forwarded header. With no configured trusted header, the second limit is a shared site-wide 100 requests per 15 minutes. Configure the appropriate trusted host header before production and add hosting/WAF traffic protection for volumetric abuse. Honeypots and rate limits reduce spam; they do not verify a person's identity.

HMAC hashes use `RATE_LIMIT_SALT`; raw IP addresses are not stored. Limit rows are cleaned after a day of inactivity. Inquiry content is not included in application logs, URLs or notifications. Staff can read inquiries, change their status (`new`, `contacted`, `qualified`, `closed`), and delete them. They cannot rewrite submitted contact/consent details through the database's authenticated role. Never grant staff access by trusting user-editable Auth metadata.

## Retention and monitoring

`kalasam-inquiry-retention` runs at 02:17 UTC daily inside Postgres. It deletes inquiries submitted at least 12 calendar months ago, removes old rate-limit buckets, and marks stale pending notifications as failed. Daily scheduling means records can remain up to 24 hours past their anniversary. Staff deletion acts immediately. Configure backups and backup retention separately so the client's policy describes residual backup copies accurately.

Inspect `cron.job` and `cron.job_run_details` in Supabase for scheduling and failures. Alert on failed jobs and on absence of a successful run for more than 48 hours. These metadata contain counts/status, not inquiry bodies. Application errors use generic operational messages; monitor request 5xx/429 rates and dashboard notification failures. A database outage blocks submissions with a retry message.

## Verification before deployment

Run the schema access/workflow checks in `supabase/tests/access_and_workflows.sql` against a disposable project as a database owner. Fixtures roll back. They cover anonymous and nonstaff isolation, staff mutations, immutable inquiry fields, redirect flattening/alias reuse, rate limits, and retention. The initial migration can also be checked in local Postgres using stub Auth/Storage schemas; that does not replace testing actual Supabase Auth, Storage and cron integration.

Confirm in staging: invitation, password setup, session refresh and revocation; media upload; all inquiry validation and notification-failure scenarios; current content after staff publishing; 12-month cleanup; and production host IP-header behavior. Verify sender/domain and client-approved content before enabling public indexing. No live cloud resource, invitation, email or deployment is created by installing this source.

Reference documentation: [Supabase SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Resend email API](https://resend.com/docs/api-reference/emails/send-email).
