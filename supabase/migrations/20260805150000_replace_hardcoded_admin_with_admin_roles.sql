-- The "Temp admin" policies added in 20260731145531 and 20260731153353 hardcoded
-- a single profile UUID that no longer belongs to any existing profile. Replace
-- them with a check against admin_roles (populated via 20260805143009), so admin
-- access to reports is driven by that table instead of a dead literal UUID.

drop policy if exists "Temp admin can view all reports" on public.post_reports;
drop policy if exists "Temp admin can dismiss reports" on public.post_reports;

create policy "Admins can view all reports"
  on public.post_reports
  for select
  using (exists (select 1 from public.admin_roles where profile_id = auth.uid()));

create policy "Admins can dismiss reports"
  on public.post_reports
  for delete
  using (exists (select 1 from public.admin_roles where profile_id = auth.uid()));

drop policy if exists "Temp admin can view all comment reports" on public.comment_reports;
drop policy if exists "Temp admin can dismiss comment reports" on public.comment_reports;

create policy "Admins can view all comment reports"
  on public.comment_reports
  for select
  using (exists (select 1 from public.admin_roles where profile_id = auth.uid()));

create policy "Admins can dismiss comment reports"
  on public.comment_reports
  for delete
  using (exists (select 1 from public.admin_roles where profile_id = auth.uid()));
