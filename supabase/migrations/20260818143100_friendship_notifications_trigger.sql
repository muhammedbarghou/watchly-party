-- Auto-create notifications from friendships changes (definer rights).
-- Covers sendFriendRequestOnce: created, auto_accepted; no-ops skip writes.

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create or replace function private.notify_friendship_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_username text;
begin
  if (tg_op = 'INSERT' and new.status = 'pending') then
    select username into actor_username
    from public.users
    where id = new.requester_id;

    insert into public.notifications (user_id, type, payload)
    values (
      new.recipient_id,
      'friend_request',
      jsonb_build_object(
        'fromUserId', new.requester_id,
        'fromUsername', coalesce(actor_username, 'Someone'),
        'friendshipId', new.id
      )
    );

  elsif (tg_op = 'UPDATE' and old.status = 'pending' and new.status = 'accepted') then
    select username into actor_username
    from public.users
    where id = new.recipient_id;

    insert into public.notifications (user_id, type, payload)
    values (
      new.requester_id,
      'friend_accepted',
      jsonb_build_object(
        'byUserId', new.recipient_id,
        'byUsername', coalesce(actor_username, 'Someone'),
        'friendshipId', new.id
      )
    );
  end if;

  return new;
end;
$$;

revoke all on function private.notify_friendship_change() from public, anon, authenticated;

drop trigger if exists friendships_notify on public.friendships;

create trigger friendships_notify
  after insert or update on public.friendships
  for each row
  execute function private.notify_friendship_change();
