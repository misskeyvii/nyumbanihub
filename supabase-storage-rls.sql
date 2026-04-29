create policy "storage_read_all" on storage.objects for select using (bucket_id = 'listings');

create policy "storage_upload_auth" on storage.objects for insert
with check (bucket_id = 'listings' and auth.role() = 'authenticated');

create policy "storage_update_own" on storage.objects for update
using (bucket_id = 'listings' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "storage_delete_own" on storage.objects for delete
using (bucket_id = 'listings' and auth.uid()::text = (storage.foldername(name))[1]);
