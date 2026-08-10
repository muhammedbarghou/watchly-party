-- User preferences + avatars storage for Settings.

-- 1) Preferences table
create table if not exists public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  notify_friend_request boolean not null default true,
  notify_room_invite boolean not null default true,
  notify_access_request boolean not null default true,
  notify_toasts_enabled boolean not null default true,
  default_room_private boolean not null default false,
  default_visible_to_friends boolean not null default true,
  join_voice_muted boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

grant select, insert, update on table public.user_preferences to authenticated;

drop policy if exists "users can read own preferences" on public.user_preferences;
create policy "users can read own preferences"
  on public.user_preferences
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users can insert own preferences" on public.user_preferences;
create policy "users can insert own preferences"
  on public.user_preferences
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own preferences" on public.user_preferences;
create policy "users can update own preferences"
  on public.user_preferences
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Keep updated_at fresh
create or replace function public.set_user_preferences_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row
  execute function public.set_user_preferences_updated_at();

-- Harden users update policy with WITH CHECK
drop policy if exists "users can update their own row" on public.users;
create policy "users can update their own row"
  on public.users
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 2) Signup: create preferences row with profile
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

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

-- 3) Backfill preferences for existing users
insert into public.user_preferences (user_id)
select u.id
from public.users u
on conflict (user_id) do nothing;

-- 4) Avatars storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects
  for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
