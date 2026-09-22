export async function uploadPrivateEvidence({ supabase, file, userId, sha256 }) {
  if (!supabase || !file || !userId) return { path: null, error: new Error('Storage is not configured') };
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${sha256}-${safeName}`;
  const { error } = await supabase.storage.from('fir-evidence').upload(path, file, {
    upsert: true,
    contentType: file.type || 'application/octet-stream',
  });
  return { path, error };
}
