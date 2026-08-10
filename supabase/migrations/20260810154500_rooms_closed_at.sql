-- Add closed_at so closed rooms can show when they closed (not created_at).
alter table public.rooms
  add column if not exists closed_at timestamptz;

-- Stamp closed_at when a room transitions to closed.
create or replace function public.set_room_closed_at()
returns trigger
language plpgsql
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
