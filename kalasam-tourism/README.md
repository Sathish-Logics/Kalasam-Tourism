# Kalasam Tourism

Responsive tourism website and staff content dashboard built with Next.js App Router.

## Run the local preview

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase credentials, public pages use local demonstration content and remain excluded from search indexing. The inquiry form stays disabled until Supabase, server credentials, and client-approved privacy and consent text are configured. No inquiry will appear to succeed when it cannot be securely stored.

## Configure the backend

1. Copy `.env.example` to `.env.local`.
2. Create separate Supabase projects for preview/staging and production.
3. Apply `supabase/migrations/202610010001_initial.sql` and `supabase/migrations/202610010002_retention_schedule.sql` in order. The second migration enables the daily 12-month inquiry cleanup schedule.
4. Set the Supabase URL and publishable key in `.env.local`. Keep the service role key server-side only.
5. In Supabase Auth, disable public sign-ups and anonymous sign-ins. Invite each staff member and add their Auth user ID to `staff_users`; see [backend setup and operations](docs/BACKEND.md).
6. Configure the invitation and recovery template to use `/auth/confirm?token_hash={{ .TokenHash }}&type=invite` (or `type=recovery`). Staff set their password at `/admin/password`.
7. Configure a verified Resend sender, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `INQUIRY_NOTIFICATION_EMAIL`, and a random `RATE_LIMIT_SALT` of at least 32 characters.
8. Enter approved contact details, privacy notice, consent wording, and consent version at `/admin/settings`. Until all privacy/consent values are present, inquiry submission stays off.
9. Add approved, licensed content at `/admin/content`. Demo content is never mixed into a configured database.
10. Set `NEXT_PUBLIC_SITE_URL` to the production origin. Leave `NEXT_PUBLIC_SITE_INDEXABLE=false` until launch content and domain are approved; enable it only for production indexing.

Do not commit a `.env.local` file or put the Supabase service role or Resend key in a `NEXT_PUBLIC_*` variable.

## Useful commands

```bash
npm run dev
npx next typegen
npx tsc --noEmit
npm run lint
npm run build
```

Run `supabase/tests/access_and_workflows.sql` against a disposable Supabase project as a database owner before deployment. See [docs/BACKEND.md](docs/BACKEND.md) for the schema, RLS boundaries, endpoint contract, abuse controls, notification handling, retention monitoring, and staging verification.

## Image licenses

The three local preview photos and their attribution details are listed at [/image-credits](/image-credits). Replace them with client-approved photography before launch if the client prefers.
