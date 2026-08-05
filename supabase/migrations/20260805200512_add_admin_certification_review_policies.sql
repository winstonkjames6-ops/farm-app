create policy "admins can update any trainer certification" on public.trainers for update
  using (exists (select 1 from public.admin_roles where admin_roles.profile_id = auth.uid()))
  with check (exists (select 1 from public.admin_roles where admin_roles.profile_id = auth.uid()));

create policy "admins can read all verification docs" on storage.objects for select
  using (bucket_id = 'verification-docs' and exists (select 1 from public.admin_roles where admin_roles.profile_id = auth.uid()));
