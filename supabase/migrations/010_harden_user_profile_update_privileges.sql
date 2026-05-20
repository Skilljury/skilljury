-- Harden profile updates so authenticated users cannot self-promote or edit trust/moderation fields.
-- RLS limits rows, but column privileges are needed to limit which profile columns a client can update.

revoke update on public.user_profiles from anon;
revoke update on public.user_profiles from authenticated;

grant update (username, display_name, avatar_url, bio)
on public.user_profiles
to authenticated;

comment on policy "Users update own profile" on public.user_profiles is
  'Users may update only their own row, and column grants restrict updates to public profile fields.';
