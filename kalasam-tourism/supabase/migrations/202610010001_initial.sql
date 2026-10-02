-- Apply to a Supabase project through migrations or the SQL editor.
begin;

create table public.staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.staff_users enable row level security;
revoke all on public.staff_users from anon, authenticated;
grant select on public.staff_users to authenticated;
grant all on public.staff_users to service_role;
create policy "Staff can check their own membership" on public.staff_users
  for select to authenticated using (user_id = (select auth.uid()));

create function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated, service_role;

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.content_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('destination','journey','circuit','service','testimonial')),
  slug text not null check (length(slug) between 1 and 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(title) between 1 and 160),
  summary text not null default '' check (length(summary) <= 600),
  body text not null default '' check (length(body) <= 30000),
  hero_image text not null default '' check (length(hero_image) <= 2000),
  image_alt text not null default '' check (length(image_alt) <= 300),
  region text not null default '' check (length(region) <= 150),
  duration text not null default '' check (length(duration) <= 100),
  tags text[] not null default '{}' check (cardinality(tags) <= 30),
  related_slugs text[] not null default '{}' check (cardinality(related_slugs) <= 30),
  stops text[] not null default '{}' check (cardinality(stops) <= 40),
  published boolean not null default false,
  seo_title text not null default '' check (length(seo_title) <= 160),
  seo_description text not null default '' check (length(seo_description) <= 320),
  canonical_url text not null default '' check (length(canonical_url) <= 2048),
  social_image text not null default '' check (length(social_image) <= 2000),
  noindex boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(kind, slug)
);
create index content_published_kind_idx on public.content_entries(kind) where published;
create trigger content_updated_at before update on public.content_entries for each row execute function public.set_updated_at();
alter table public.content_entries enable row level security;
revoke all on public.content_entries from anon, authenticated;
grant select on public.content_entries to anon;
grant select, insert, update, delete on public.content_entries to authenticated;
grant all on public.content_entries to service_role;
create policy "Published content is public" on public.content_entries for select to anon, authenticated using (published);
create policy "Staff manages content" on public.content_entries for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create table public.site_settings (
  id boolean primary key default true check (id),
  brand_name text not null default 'Kalasam Tourism' check (length(brand_name) <= 120),
  email text not null default '' check (length(email) <= 254),
  phone text not null default '' check (length(phone) <= 40),
  whatsapp text not null default '' check (length(whatsapp) <= 40),
  address text not null default '' check (length(address) <= 1000),
  instagram text not null default '' check (length(instagram) <= 2000),
  facebook text not null default '' check (length(facebook) <= 2000),
  privacy_text text not null default '' check (length(privacy_text) <= 30000),
  consent_text text not null default '' check (length(consent_text) <= 2000),
  consent_version text not null default '' check (length(consent_version) <= 100),
  updated_at timestamptz not null default now()
);
insert into public.site_settings(id) values (true);
create trigger settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon;
grant select, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
create policy "Settings are public" on public.site_settings for select to anon, authenticated using (true);
create policy "Staff edits settings" on public.site_settings for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create table public.slug_redirects (
  source_path text primary key check (source_path ~ '^/[a-z0-9/-]+$'),
  target_path text not null check (target_path ~ '^/[a-z0-9/-]+$'),
  created_at timestamptz not null default now(),
  check (source_path <> target_path)
);
alter table public.slug_redirects enable row level security;
revoke all on public.slug_redirects from anon, authenticated;
grant select on public.slug_redirects to anon, authenticated;
grant all on public.slug_redirects to service_role;
create policy "Redirects are public" on public.slug_redirects for select to anon, authenticated using (true);

create function public.content_path(entry_kind text, entry_slug text) returns text
language sql immutable set search_path = '' as $$
  select case entry_kind
    when 'journey' then '/journeys/' || entry_slug
    when 'destination' then '/destinations/' || entry_slug
    when 'circuit' then '/temple-circuits/' || entry_slug
    when 'service' then '/' || entry_slug
    else null end;
$$;

-- Serialized slug changes keep aliases immutable and flatten previous redirects.
create function public.protect_content_slug() returns trigger
language plpgsql security definer set search_path = '' as $$
declare destination text;
begin
  perform pg_advisory_xact_lock(75211001);
  if tg_op = 'UPDATE' and new.kind <> old.kind then
    raise exception 'Content type cannot change after creation.';
  end if;
  destination := public.content_path(new.kind, new.slug);
  if destination is not null and exists (select 1 from public.slug_redirects where source_path = destination) then
    raise exception 'This slug is reserved by a previous page URL.';
  end if;
  if new.kind = 'service' and new.slug not in ('family-ceremonies','senior-assistance','b2b-partners') then
    raise exception 'Choose a supported service URL.';
  end if;
  if tg_op = 'UPDATE' and new.kind = 'service' and new.slug <> old.slug then
    raise exception 'Service URLs are fixed navigation pages.';
  end if;
  return new;
end;
$$;
create trigger protect_content_slug before insert or update on public.content_entries for each row execute function public.protect_content_slug();

create function public.retain_content_redirect() returns trigger
language plpgsql security definer set search_path = '' as $$
declare previous_path text; next_path text;
begin
  if old.slug = new.slug then return new; end if;
  previous_path := public.content_path(old.kind, old.slug);
  next_path := public.content_path(new.kind, new.slug);
  if previous_path is null then return new; end if;
  update public.slug_redirects set target_path = next_path where target_path = previous_path;
  insert into public.slug_redirects(source_path, target_path) values (previous_path, next_path);
  return new;
end;
$$;
create trigger retain_content_redirect after update on public.content_entries for each row execute function public.retain_content_redirect();

create function public.save_content_entry(payload jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare saved_id uuid; existing_kind text;
begin
  if not public.is_staff() then raise exception 'Staff access required.'; end if;
  saved_id := coalesce(nullif(payload->>'id','')::uuid, gen_random_uuid());
  if nullif(payload->>'id','') is not null then
    select kind into existing_kind from public.content_entries where id = saved_id;
    if not found then raise exception 'Content entry no longer exists.'; end if;
  end if;
  insert into public.content_entries (
    id, kind, slug, title, summary, body, hero_image, image_alt, region, duration,
    tags, related_slugs, stops, published, seo_title, seo_description, canonical_url, social_image, noindex
  ) values (
    saved_id, payload->>'kind', payload->>'slug', payload->>'title',
    coalesce(payload->>'summary',''), coalesce(payload->>'body',''),
    coalesce(payload->>'hero_image',''), coalesce(payload->>'image_alt',''),
    coalesce(payload->>'region',''), coalesce(payload->>'duration',''),
    array(select jsonb_array_elements_text(coalesce(payload->'tags','[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(payload->'related_slugs','[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(payload->'stops','[]'::jsonb))),
    coalesce((payload->>'published')::boolean,false), coalesce(payload->>'seo_title',''),
    coalesce(payload->>'seo_description',''), coalesce(payload->>'canonical_url',''), coalesce(payload->>'social_image',''),
    coalesce((payload->>'noindex')::boolean,false)
  ) on conflict (id) do update set
    kind = excluded.kind, slug = excluded.slug, title = excluded.title, summary = excluded.summary,
    body = excluded.body, hero_image = excluded.hero_image, image_alt = excluded.image_alt,
    region = excluded.region, duration = excluded.duration, tags = excluded.tags,
    related_slugs = excluded.related_slugs, stops = excluded.stops, published = excluded.published,
    seo_title = excluded.seo_title, seo_description = excluded.seo_description,
    canonical_url = excluded.canonical_url,
    social_image = excluded.social_image, noindex = excluded.noindex;
  return saved_id;
end;
$$;
revoke all on function public.save_content_entry(jsonb) from public, anon;
grant execute on function public.save_content_entry(jsonb) to authenticated;

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('journey','ceremony','senior','partner','contact')),
  name text not null check (length(name) between 2 and 100),
  email text not null default '' check (length(email) <= 254),
  phone text not null default '' check (length(phone) <= 30),
  country text not null check (length(country) between 2 and 100),
  travel_window text not null default '' check (length(travel_window) <= 200),
  traveler_count integer check (traveler_count between 1 and 100),
  interests text[] not null default '{}' check (cardinality(interests) <= 12),
  message text not null check (length(message) between 10 and 4000),
  consent_at timestamptz not null,
  consent_version text not null check (length(consent_version) between 1 and 100),
  source_path text not null default '/' check (source_path ~ '^/([a-zA-Z0-9_-]+/)*[a-zA-Z0-9_-]*$'),
  status text not null default 'new' check (status in ('new','contacted','qualified','closed')),
  notification_status text not null default 'pending' check (notification_status in ('pending','sent','failed')),
  notification_error text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(email) > 0 or length(phone) > 0)
);
create index inquiries_created_idx on public.inquiries(created_at desc);
create index inquiries_status_idx on public.inquiries(status, created_at desc);
create trigger inquiries_updated_at before update on public.inquiries for each row execute function public.set_updated_at();
alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
grant select, delete on public.inquiries to authenticated;
grant update (status) on public.inquiries to authenticated;
grant all on public.inquiries to service_role;
create policy "Staff reads inquiries" on public.inquiries for select to authenticated using ((select public.is_staff()));
create policy "Staff updates inquiry status" on public.inquiries for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "Staff deletes inquiries" on public.inquiries for delete to authenticated using ((select public.is_staff()));

create table public.inquiry_rate_limits (
  bucket_key text primary key,
  window_start timestamptz not null default now(),
  request_count integer not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.inquiry_rate_limits enable row level security;
revoke all on public.inquiry_rate_limits from anon, authenticated;
grant all on public.inquiry_rate_limits to service_role;

-- Atomic UPSERT prevents concurrent app instances from bypassing the limit.
create function public.consume_inquiry_rate_limit(bucket_key text, max_requests integer, window_seconds integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare requests integer;
begin
  if length(bucket_key) <> 64 or max_requests < 1 or window_seconds < 1 then
    raise exception 'Invalid rate limit input.';
  end if;
  insert into public.inquiry_rate_limits as buckets (bucket_key, window_start, request_count, updated_at)
    values (bucket_key, now(), 1, now())
  on conflict on constraint inquiry_rate_limits_pkey do update set
    request_count = case when buckets.window_start <= now() - make_interval(secs => window_seconds) then 1 else buckets.request_count + 1 end,
    window_start = case when buckets.window_start <= now() - make_interval(secs => window_seconds) then now() else buckets.window_start end,
    updated_at = now()
  returning request_count into requests;
  return requests <= max_requests;
end;
$$;
revoke all on function public.consume_inquiry_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_inquiry_rate_limit(text,integer,integer) to service_role;

create function public.purge_expired_inquiries() returns integer
language plpgsql security invoker set search_path = '' as $$
declare removed integer;
begin
  delete from public.inquiries where created_at <= now() - interval '12 months';
  get diagnostics removed = row_count;
  delete from public.inquiry_rate_limits where updated_at < now() - interval '1 day';
  update public.inquiries set notification_status = 'failed', notification_error = 'delivery_interrupted'
    where notification_status = 'pending' and created_at < now() - interval '1 hour';
  return removed;
end;
$$;
revoke all on function public.purge_expired_inquiries() from public, anon, authenticated;
grant execute on function public.purge_expired_inquiries() to service_role;

-- Only approved public imagery belongs in this bucket, never inquiry documents.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('media','media',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;
create policy "Public reads approved media" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "Staff uploads media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and (select public.is_staff()));
create policy "Staff updates media" on storage.objects for update to authenticated using (bucket_id = 'media' and (select public.is_staff())) with check (bucket_id = 'media' and (select public.is_staff()));
create policy "Staff deletes media" on storage.objects for delete to authenticated using (bucket_id = 'media' and (select public.is_staff()));

-- Trigger functions must not be callable through the public Data API.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.protect_content_slug() from public, anon, authenticated;
revoke all on function public.retain_content_redirect() from public, anon, authenticated;

commit;
