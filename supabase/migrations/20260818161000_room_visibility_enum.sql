-- Public room discovery: visibility enum replaces friend-only discovery.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'room_visibility'
      and n.nspname = 'public'
  ) then
    create type public.room_visibility as enum ('private', 'friends', 'public');
  end if;
end;
$$;

alter table public.rooms
  add column if not exists visibility public.room_visibility;

update public.rooms
set visibility = case
  when visible_to_friends is true then 'friends'::public.room_visibility
  else 'private'::public.room_visibility
end
where visibility is null;

alter table public.rooms
  alter column visibility set default 'friends'::public.room_visibility;

alter table public.rooms
  alter column visibility set not null;

alter table public.rooms
  drop constraint if exists rooms_public_open_join;

alter table public.rooms
  add constraint rooms_public_open_join
  check (
    visibility <> 'public'
    or (coalesce(is_private, false) = false and password_hash is null)
  );

create index if not exists rooms_public_active_idx
  on public.rooms (created_at desc)
  where status = 'active' and visibility = 'public';

drop policy if exists "rooms readable if own or friend-visible" on public.rooms;
drop policy if exists "rooms readable if own, public, or friend-visible" on public.rooms;

create policy "rooms readable if own, public, or friend-visible"
  on public.rooms
  for select
  to authenticated
  using (
    created_by = (select auth.uid())
    or visibility = 'public'
    or (
      visibility = 'friends'
      and exists (
        select 1
        from public.friendships f
        where f.status = 'accepted'
          and (
            (f.requester_id = (select auth.uid()) and f.recipient_id = rooms.created_by)
            or (f.recipient_id = (select auth.uid()) and f.requester_id = rooms.created_by)
          )
      )
    )
  );
