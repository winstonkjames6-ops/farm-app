create policy "users delete own post videos" on storage.objects for delete to authenticated
  using (bucket_id = 'post-videos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete own post thumbnails" on storage.objects for delete to authenticated
  using (bucket_id = 'post-thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "trainer deletes own verification doc" on storage.objects for delete to authenticated
  using (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);
