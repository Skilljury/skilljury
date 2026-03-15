create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.requesting_user_id()
returns uuid
language sql
stable
set search_path = public
as $$
  select auth.uid()
$$;

create or replace function public.requesting_user_role()
returns text
language sql
stable
set search_path = public
as $$
  select role
  from public.user_profiles
  where id = (select public.requesting_user_id())
$$;

create or replace function public.is_staff_user()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce(
    (select public.requesting_user_role()) in ('moderator', 'admin'),
    false
  )
$$;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce((select public.requesting_user_role()) = 'admin', false)
$$;
