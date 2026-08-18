-- Join/leave sessions written exclusively by the backend service-role key.

create table public.room_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz
);

create index room_history_user_recent_idx
  on public.room_history (user_id, joined_at desc);

create index room_history_open_session_idx
  on public.room_history (user_id, room_id)
  where left_at is null;

create index room_history_room_id_idx
  on public.room_history (room_id);

alter table public.room_history enable row level security;

create policy "room_history_select_own"
  on public.room_history
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.room_history from public, anon, authenticated;
grant select on table public.room_history to authenticated;

-- Nested room_history → rooms selects need to see invited private rooms.
create policy "rooms readable if in own room_history"
  on public.rooms
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.room_history h
      where h.room_id = rooms.id
        and h.user_id = (select auth.uid())
    )
  );
