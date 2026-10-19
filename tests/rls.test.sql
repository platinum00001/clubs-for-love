-- RLS test for schema clubs4love. Everything runs inside one DO block that ends by RAISING,
-- so every row it creates (test users, submissions, admin row) is rolled back.
-- Run in the Supabase SQL editor (or via the Supabase connector). Expected final error:
--   "RLS TEST RESULT: ALL PASS (n checks)"
do $$
declare
  member uuid := gen_random_uuid(); other uuid := gen_random_uuid(); admin uuid := gen_random_uuid();
  n int; ok int := 0; fails text := ''; sid uuid; txt text;
  procedure_result boolean;
begin
  insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values (member, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'c4l-member@test.invalid', '{}', '{}', now(), now()),
         (other,  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'c4l-other@test.invalid',  '{}', '{}', now(), now()),
         (admin,  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'c4l-admin@test.invalid',  '{}', '{}', now(), now());
  insert into clubs4love.admins (user_id, note) values (admin, 'rls test');

  ---------------------------------------------------------------- anon
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  execute 'set local role anon';
  -- 1 anon can send a form (guard forces status/user_id)
  insert into clubs4love.submissions (kind, name, email, details, status, admin_note, user_id)
  values ('donation', 'Guest', 'GUEST@test.invalid', '{"items":["clubs"]}', 'new', null, null);
  ok := ok + 1;
  -- 2 anon cannot read submissions
  begin select count(*) into n from clubs4love.submissions; fails := fails || ' anon-read-submissions';
  exception when insufficient_privilege then ok := ok + 1; end;
  -- 3 anon cannot spoof status
  begin insert into clubs4love.submissions (kind, name, email, status) values ('contact','x','x@test.invalid','closed');
    -- guard resets to new, so the row is accepted as 'new' (safe); verify later as admin
    ok := ok + 1;
  exception when others then ok := ok + 1; end;
  -- 4 anon cannot attach a user_id
  begin insert into clubs4love.submissions (kind, name, email, user_id) values ('contact','x','spoof@test.invalid', other); ok := ok + 1;
  exception when others then ok := ok + 1; end;
  -- 5 anon reads published events
  select count(*) into n from clubs4love.events; if n >= 3 then ok := ok + 1; else fails := fails || ' anon-events'; end if;
  -- 6 anon cannot write events
  begin insert into clubs4love.events (title) values ('hack'); fails := fails || ' anon-write-events';
  exception when insufficient_privilege then ok := ok + 1; end;
  -- 7 anon cannot read profiles/admins
  begin select count(*) into n from clubs4love.profiles; fails := fails || ' anon-profiles';
  exception when insufficient_privilege then ok := ok + 1; end;
  begin select count(*) into n from clubs4love.admins; fails := fails || ' anon-admins';
  exception when insufficient_privilege then ok := ok + 1; end;
  -- 9 anon cannot call admin_stats / delete_my_data
  begin perform clubs4love.admin_stats(); fails := fails || ' anon-admin-stats';
  exception when insufficient_privilege then ok := ok + 1; end;
  -- 10 bad photo path rejected
  begin insert into clubs4love.submissions (kind, name, email, photo_paths) values ('donation','x','p@test.invalid', array['../../etc/passwd']); fails := fails || ' bad-photo-path';
  exception when others then ok := ok + 1; end;
  -- 11 public interest counts work
  select count(*) into n from clubs4love.event_interest_counts(); if n >= 3 then ok := ok + 1; else fails := fails || ' counts'; end if;
  execute 'reset role';

  ---------------------------------------------------------------- member
  perform set_config('request.jwt.claims', json_build_object('sub', member, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into clubs4love.profiles (id, display_name) values (member, 'Member');
  insert into clubs4love.submissions (kind, name, email) values ('request', 'Member', 'm@test.invalid') returning id into sid;
  -- 12 member sees own submission only
  select count(*) into n from clubs4love.submissions; if n = 1 then ok := ok + 1; else fails := fails || ' member-sees-' || n; end if;
  -- 13 member cannot update status
  update clubs4love.submissions set status = 'closed' where id = sid; get diagnostics n = row_count;
  if n = 0 then ok := ok + 1; else fails := fails || ' member-update'; end if;
  -- 14 member cannot create profile for someone else
  begin insert into clubs4love.profiles (id) values (other); fails := fails || ' member-other-profile';
  exception when insufficient_privilege then ok := ok + 1; end;
  -- 15 member RSVP / interest
  insert into clubs4love.event_interest (event_id) select id from clubs4love.events limit 1; ok := ok + 1;
  -- 16 member cannot add interest for another user
  begin insert into clubs4love.event_interest (event_id, user_id) select id, other from clubs4love.events offset 1 limit 1; fails := fails || ' interest-other';
  exception when insufficient_privilege then ok := ok + 1; end;
  -- 17 member not admin
  begin perform clubs4love.admin_stats(); fails := fails || ' member-admin-stats';
  exception when insufficient_privilege then ok := ok + 1; end;
  -- 18 member cannot make self admin
  begin insert into clubs4love.admins (user_id) values (member); fails := fails || ' self-admin';
  exception when insufficient_privilege then ok := ok + 1; end;
  -- 19 member cannot write events
  begin insert into clubs4love.events (title) values ('x'); fails := fails || ' member-events';
  exception when insufficient_privilege then ok := ok + 1; end;
  execute 'reset role';

  ---------------------------------------------------------------- other member
  perform set_config('request.jwt.claims', json_build_object('sub', other, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  -- 20 other member sees nothing of member's
  select count(*) into n from clubs4love.submissions; if n = 0 then ok := ok + 1; else fails := fails || ' other-sees-subs'; end if;
  select count(*) into n from clubs4love.profiles; if n = 0 then ok := ok + 1; else fails := fails || ' other-sees-profiles'; end if;
  select count(*) into n from clubs4love.event_interest; if n = 0 then ok := ok + 1; else fails := fails || ' other-sees-interest'; end if;
  -- 23 other cannot delete member's submission
  delete from clubs4love.submissions where id = sid; get diagnostics n = row_count; if n = 0 then ok := ok + 1; else fails := fails || ' other-delete'; end if;
  execute 'reset role';

  ---------------------------------------------------------------- admin
  perform set_config('request.jwt.claims', json_build_object('sub', admin, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  -- 24 admin sees all test submissions; guest spoofs were neutralised
  select count(*) into n from clubs4love.submissions where email like '%@test.invalid'; if n >= 4 then ok := ok + 1; else fails := fails || ' admin-sees-' || n; end if;
  select count(*) into n from clubs4love.submissions where email like '%@test.invalid' and (status <> 'new' or (user_id is not null and user_id <> member)); if n = 0 then ok := ok + 1; else fails := fails || ' spoof-kept'; end if;
  -- 26 admin can update status
  update clubs4love.submissions set status = 'received', admin_note = 'ok' where id = sid; get diagnostics n = row_count; if n = 1 then ok := ok + 1; else fails := fails || ' admin-update'; end if;
  -- 27 admin stats
  select clubs4love.admin_stats()->>'open_new' into txt; if txt is not null then ok := ok + 1; else fails := fails || ' admin-stats'; end if;
  -- 28 admin can manage events
  insert into clubs4love.events (title, published) values ('Test event', false); ok := ok + 1;
  execute 'reset role';

  ---------------------------------------------------------------- delete my data
  perform set_config('request.jwt.claims', json_build_object('sub', member, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  -- 29 member cannot see unpublished event
  select count(*) into n from clubs4love.events where title = 'Test event'; if n = 0 then ok := ok + 1; else fails := fails || ' unpublished-visible'; end if;
  perform clubs4love.delete_my_data();
  select count(*) into n from clubs4love.submissions; select n + count(*) into n from clubs4love.profiles; select n + count(*) into n from clubs4love.event_interest;
  if n = 0 then ok := ok + 1; else fails := fails || ' delete-my-data'; end if;
  execute 'reset role';

  if fails = '' then raise exception 'RLS TEST RESULT: ALL PASS (% checks) — rolled back', ok;
  else raise exception 'RLS TEST RESULT: FAIL (% passed) failures:%', ok, fails; end if;
end $$;
