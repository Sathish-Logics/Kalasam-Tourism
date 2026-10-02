-- pg_cron is available on Supabase. Runs inside Postgres; no HTTP cron secret.
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'kalasam-inquiry-retention',
  '17 2 * * *',
  $$select public.purge_expired_inquiries();$$
);
