create or replace function public.requesting_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid()
$$;

create or replace function public.requesting_user_role()
returns text
language sql
stable
as $$
  select role
  from public.user_profiles
  where id = (select public.requesting_user_id())
$$;

create or replace function public.is_staff_user()
returns boolean
language sql
stable
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
as $$
  select coalesce((select public.requesting_user_role()) = 'admin', false)
$$;

drop policy if exists "Users update own profile" on public.user_profiles;
create policy "Users update own profile"
on public.user_profiles
as permissive
for update
to authenticated
using ((select public.requesting_user_id()) = id)
with check ((select public.requesting_user_id()) = id);

drop policy if exists "Users read own reviews" on public.reviews;
create policy "Users read own reviews"
on public.reviews
as permissive
for select
to authenticated
using ((select public.requesting_user_id()) = user_id);

drop policy if exists "Users create own reviews" on public.reviews;
create policy "Users create own reviews"
on public.reviews
as permissive
for insert
to authenticated
with check ((select public.requesting_user_id()) = user_id);

drop policy if exists "Users update own pending reviews" on public.reviews;
create policy "Users update own pending reviews"
on public.reviews
as permissive
for update
to authenticated
using (
  (select public.requesting_user_id()) = user_id
  and moderation_status = 'pending'
)
with check (
  (select public.requesting_user_id()) = user_id
  and moderation_status = 'pending'
);

drop policy if exists "Moderators read all reviews" on public.reviews;
create policy "Moderators read all reviews"
on public.reviews
as permissive
for select
to authenticated
using ((select public.is_staff_user()));

drop policy if exists "Moderators update reviews" on public.reviews;
create policy "Moderators update reviews"
on public.reviews
as permissive
for update
to authenticated
using ((select public.is_staff_user()));

drop policy if exists "Users vote on reviews" on public.review_votes;
create policy "Users vote on reviews"
on public.review_votes
as permissive
for insert
to authenticated
with check ((select public.requesting_user_id()) = user_id);

drop policy if exists "Users delete own votes" on public.review_votes;
create policy "Users delete own votes"
on public.review_votes
as permissive
for delete
to authenticated
using ((select public.requesting_user_id()) = user_id);

drop policy if exists "Moderators read moderation queue" on public.moderation_queue;
create policy "Moderators read moderation queue"
on public.moderation_queue
as permissive
for select
to authenticated
using ((select public.is_staff_user()));

drop policy if exists "Moderators insert moderation queue" on public.moderation_queue;
create policy "Moderators insert moderation queue"
on public.moderation_queue
as permissive
for insert
to authenticated
with check ((select public.is_staff_user()));

drop policy if exists "Moderators update moderation queue" on public.moderation_queue;
create policy "Moderators update moderation queue"
on public.moderation_queue
as permissive
for update
to authenticated
using ((select public.is_staff_user()));

drop policy if exists "Admins read audit log" on public.audit_log;
create policy "Admins read audit log"
on public.audit_log
as permissive
for select
to authenticated
using ((select public.is_admin_user()));

drop policy if exists "Moderators insert audit log" on public.audit_log;
create policy "Moderators insert audit log"
on public.audit_log
as permissive
for insert
to authenticated
with check ((select public.is_staff_user()));

drop policy if exists "Users create own skill submissions" on public.skill_submissions;
create policy "Users create own skill submissions"
on public.skill_submissions
as permissive
for insert
to authenticated
with check ((select public.requesting_user_id()) = submitted_by_user_id);

drop policy if exists "Users read own skill submissions" on public.skill_submissions;
create policy "Users read own skill submissions"
on public.skill_submissions
as permissive
for select
to authenticated
using ((select public.requesting_user_id()) = submitted_by_user_id);

drop policy if exists "Moderators read skill submissions" on public.skill_submissions;
create policy "Moderators read skill submissions"
on public.skill_submissions
as permissive
for select
to authenticated
using ((select public.is_staff_user()));

drop policy if exists "Moderators update skill submissions" on public.skill_submissions;
create policy "Moderators update skill submissions"
on public.skill_submissions
as permissive
for update
to authenticated
using ((select public.is_staff_user()));

drop policy if exists "Users create own reports" on public.reports;
create policy "Users create own reports"
on public.reports
as permissive
for insert
to authenticated
with check ((select public.requesting_user_id()) = reporter_user_id);

drop policy if exists "Users read own reports" on public.reports;
create policy "Users read own reports"
on public.reports
as permissive
for select
to authenticated
using ((select public.requesting_user_id()) = reporter_user_id);

drop policy if exists "Moderators read reports" on public.reports;
create policy "Moderators read reports"
on public.reports
as permissive
for select
to authenticated
using ((select public.is_staff_user()));

drop policy if exists "Moderators update reports" on public.reports;
create policy "Moderators update reports"
on public.reports
as permissive
for update
to authenticated
using ((select public.is_staff_user()));

drop policy if exists "Users create own review requests" on public.review_requests;
create policy "Users create own review requests"
on public.review_requests
as permissive
for insert
to authenticated
with check ((select public.requesting_user_id()) = user_id);

drop policy if exists "Users read own review requests" on public.review_requests;
create policy "Users read own review requests"
on public.review_requests
as permissive
for select
to authenticated
using ((select public.requesting_user_id()) = user_id);
