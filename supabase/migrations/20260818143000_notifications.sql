-- Persisted in-app notifications. Rows are written by the friendships trigger
-- (definer rights) or the backend service-role key — never by the client.

create type public.notification_type as enum (
  'friend_request',
  'friend_accepted',
  'room_invite',
  'access_approved',
  'access_denied'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.notification_type not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "notifications_update_own_read_status"
  on public.notifications
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on table public.notifications from public, anon, authenticated;
grant select, update on table public.notifications to authenticated;

-- Clients may only stamp read_at; type/payload/user_id stay server-owned.
create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create or replace function private.notifications_restrict_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.type is distinct from old.type
    or new.payload is distinct from old.payload
    or new.created_at is distinct from old.created_at
  then
    raise exception 'only read_at may be updated on notifications';
  end if;
  return new;
end;
$$;

revoke all on function private.notifications_restrict_update() from public, anon, authenticated;

create trigger notifications_restrict_update
  before update on public.notifications
  for each row
  execute function private.notifications_restrict_update();

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;
