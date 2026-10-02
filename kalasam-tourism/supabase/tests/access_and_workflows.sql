-- Run against a disposable Supabase/local database after both migrations.
-- All fixtures roll back. Run with a database owner, never with application keys.
begin;
insert into auth.users(id, email) values
  ('71000000-0000-0000-0000-000000000001','staff-test@example.invalid'),
  ('71000000-0000-0000-0000-000000000002','visitor-test@example.invalid');
insert into public.staff_users(user_id) values ('71000000-0000-0000-0000-000000000001');
insert into public.content_entries(id,kind,slug,title,published) values
  ('72000000-0000-0000-0000-000000000001','destination','rls-visible','Visible test entry',true),
  ('72000000-0000-0000-0000-000000000002','destination','rls-private','Private test entry',false);
insert into public.inquiries(id,type,name,email,country,message,consent_at,consent_version,created_at) values
  ('73000000-0000-0000-0000-000000000001','contact','Test Traveler','test@example.invalid','India','Test inquiry content',now(),'test',now()),
  ('73000000-0000-0000-0000-000000000002','contact','Old Traveler','old@example.invalid','India','Expired test inquiry',now(),'test',now()-interval '13 months');

set local role anon;
do $$ begin
  if (select count(*) from public.content_entries where slug like 'rls-%') <> 1 then
    raise exception 'Anonymous content publication isolation failed'; end if;
  begin
    perform id from public.inquiries;
    raise exception 'Anonymous inquiries were readable';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.staff_users(user_id) values ('71000000-0000-0000-0000-000000000002');
    raise exception 'Anonymous visitor escalated to staff';
  exception when insufficient_privilege then null; end;
  begin
    perform public.consume_inquiry_rate_limit(repeat('a',64),3,900);
    raise exception 'Anonymous visitor called private rate limit RPC';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','71000000-0000-0000-0000-000000000002',true);
do $$ begin
  if (select count(*) from public.inquiries) <> 0 then raise exception 'Nonstaff saw inquiries'; end if;
  if (select count(*) from public.staff_users) <> 0 then raise exception 'Nonstaff saw membership'; end if;
  begin
    insert into public.content_entries(kind,slug,title) values ('journey','rls-forbidden','Forbidden');
    raise exception 'Nonstaff wrote content';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.staff_users(user_id) values ('71000000-0000-0000-0000-000000000002');
    raise exception 'Nonstaff escalated membership';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','71000000-0000-0000-0000-000000000001',true);
do $$ declare entry_id uuid; begin
  if not public.is_staff() then raise exception 'Staff allowlist lookup failed'; end if;
  if (select count(*) from public.content_entries where slug like 'rls-%') <> 2 then raise exception 'Staff cannot read drafts'; end if;
  entry_id := public.save_content_entry('{"kind":"journey","slug":"rls-original","title":"Journey test","published":true}'::jsonb);
  perform public.save_content_entry(jsonb_build_object('id',entry_id,'kind','journey','slug','rls-renamed','title','Journey test','published',true));
  perform public.save_content_entry(jsonb_build_object('id',entry_id,'kind','journey','slug','rls-latest','title','Journey test','published',true));
  if (select target_path from public.slug_redirects where source_path='/journeys/rls-original') <> '/journeys/rls-latest' then raise exception 'Redirect chain was not flattened'; end if;
  begin
    perform public.save_content_entry(jsonb_build_object('id',entry_id,'kind','journey','slug','rls-original','title','Reused slug'));
    raise exception 'Expected reserved alias rejection';
  exception when raise_exception then
    if sqlerrm <> 'This slug is reserved by a previous page URL.' then raise; end if;
  end;
  update public.inquiries set status='contacted' where id='73000000-0000-0000-0000-000000000001';
  if (select status from public.inquiries where id='73000000-0000-0000-0000-000000000001') <> 'contacted' then raise exception 'Staff status mutation failed'; end if;
  begin
    update public.inquiries set message='Changed message text' where id='73000000-0000-0000-0000-000000000001';
    raise exception 'Staff could rewrite submitted inquiry';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
set local role service_role;
do $$ begin
  if not public.consume_inquiry_rate_limit(repeat('a',64),2,900) then raise exception 'First request rejected'; end if;
  if not public.consume_inquiry_rate_limit(repeat('a',64),2,900) then raise exception 'Second request rejected'; end if;
  if public.consume_inquiry_rate_limit(repeat('a',64),2,900) then raise exception 'Rate limit bypassed'; end if;
  perform public.purge_expired_inquiries();
  if exists(select 1 from public.inquiries where id='73000000-0000-0000-0000-000000000002') then raise exception 'Expired inquiry survived retention'; end if;
  if not exists(select 1 from public.inquiries where id='73000000-0000-0000-0000-000000000001') then raise exception 'Current inquiry was deleted'; end if;
end $$;
reset role;
rollback;
