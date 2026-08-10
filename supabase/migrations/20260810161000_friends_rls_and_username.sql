-- Username = email local-part (before @); harden friendships + rooms friend visibility.

-- 1) Profile trigger: always derive username from email local-part
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(split_part(coalesce(new.email, ''), '@', 1));
  if base_username is null or base_username = '' then
    base_username := 'user';
  end if;

  -- Keep usernames URL/search friendly
  base_username := regexp_replace(base_username, '[^a-z0-9._-]', '', 'g');
  if base_username = '' then
    base_username := 'user';
  end if;

  final_username := base_username;

  while exists (select 1 from public.users where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.users (id, username, avatar_url)
  values (
    new.id,
    final_username,
    new.raw_user_meta_data->>'avatar_url'
  );

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

-- 2) Backfill existing usernames from auth email local-part (collision-safe)
do $$
declare
  r record;
  base_username text;
  final_username text;
  suffix int;
begin
  for r in
    select u.id, au.email
    from public.users u
    join auth.users au on au.id = u.id
    where au.email is not null
  loop
    base_username := lower(split_part(r.email, '@', 1));
    base_username := regexp_replace(base_username, '[^a-z0-9._-]', '', 'g');
    if base_username = '' then
      base_username := 'user';
    end if;

    final_username := base_username;
    suffix := 0;

    while exists (
      select 1
      from public.users
      where username = final_username
        and id <> r.id
    ) loop
      suffix := suffix + 1;
      final_username := base_username || suffix::text;
    end loop;

    update public.users
    set username = final_username
    where id = r.id
      and username is distinct from final_username;
  end loop;
end;
$$;

-- 3) closed_at on rooms (idempotent)
alter table public.rooms
  add column if not exists closed_at timestamptz;

create or replace function public.set_room_closed_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'closed' and old.status is distinct from 'closed' then
    new.closed_at := coalesce(new.closed_at, now());
  elsif new.status is distinct from 'closed' then
    new.closed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists rooms_set_closed_at on public.rooms;

create trigger rooms_set_closed_at
  before update of status on public.rooms
  for each row
  execute function public.set_room_closed_at();

-- 4) Unordered friendship uniqueness (blocks A→B and B→A duplicates)
create unique index if not exists friendships_unordered_pair_uidx
  on public.friendships (
    least(requester_id, recipient_id),
    greatest(requester_id, recipient_id)
  );

-- 5) Only the recipient may accept (update status)
drop policy if exists "recipient can update request status" on public.friendships;

create policy "recipient can accept friend request"
  on public.friendships
  for update
  to authenticated
  using (auth.uid() = recipient_id)
  with check (
    auth.uid() = recipient_id
    and status = 'accepted'
  );

-- 6) Rooms readable only when own, or friend-visible to an accepted friend
drop policy if exists "rooms readable if public, own, or friend-visible" on public.rooms;

create policy "rooms readable if own or friend-visible"
  on public.rooms
  for select
  to authenticated
  using (
    created_by = auth.uid()
    or (
      visible_to_friends = true
      and exists (
        select 1
        from public.friendships f
        where f.status = 'accepted'
          and (
            (f.requester_id = auth.uid() and f.recipient_id = rooms.created_by)
            or (f.recipient_id = auth.uid() and f.requester_id = rooms.created_by)
          )
      )
    )
  );

-- Realtime for cross-client friend request updates
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'friendships'
  ) then
    alter publication supabase_realtime add table public.friendships;
  end if;
end;
$$;
