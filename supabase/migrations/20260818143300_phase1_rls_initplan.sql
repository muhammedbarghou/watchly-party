-- Advisor fixes for Phase 1 policies/indexes (already applied remotely without these).

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "notifications_update_own_read_status" on public.notifications;
create policy "notifications_update_own_read_status"
  on public.notifications
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "room_history_select_own" on public.room_history;
create policy "room_history_select_own"
  on public.room_history
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "rooms readable if in own room_history" on public.rooms;
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

create index if not exists room_history_room_id_idx
  on public.room_history (room_id);
