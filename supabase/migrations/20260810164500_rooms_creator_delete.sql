-- Allow room creators to delete their own rooms; publish rooms for live-feed updates.

drop policy if exists "creators can delete their rooms" on public.rooms;

create policy "creators can delete their rooms"
  on public.rooms
  for delete
  to authenticated
  using (created_by = auth.uid());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;
end;
$$;
