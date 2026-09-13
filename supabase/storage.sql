-- Create a private bucket named fir-evidence in Storage before applying these policies.
drop policy if exists fir_evidence_upload_own_folder on storage.objects;
create policy fir_evidence_upload_own_folder on storage.objects for insert to authenticated
with check (bucket_id = 'fir-evidence' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists fir_evidence_read_own_folder on storage.objects;
create policy fir_evidence_read_own_folder on storage.objects for select to authenticated
using (bucket_id = 'fir-evidence' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists fir_evidence_delete_own_folder on storage.objects;
create policy fir_evidence_delete_own_folder on storage.objects for delete to authenticated
using (bucket_id = 'fir-evidence' and (storage.foldername(name))[1] = (select auth.uid()::text));
