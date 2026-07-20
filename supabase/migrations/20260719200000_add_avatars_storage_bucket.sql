-- Storage bucket for profile avatar uploads (parent/trainer profile photo section).
-- Path convention: avatars/{user.id}/{timestamp}.{ext}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "public read avatars"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

create policy "users upload own avatar"
on storage.objects
for insert
to public
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users update own avatar"
on storage.objects
for update
to public
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete own avatar"
on storage.objects
for delete
to public
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
