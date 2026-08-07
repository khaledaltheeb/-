'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const MIME_EXT: Record<string,string> = {
  'image/jpeg':'jpg',
  'image/png':'png',
  'image/webp':'webp',
  'image/avif':'avif',
};
const PURPOSES = new Set(['content','featured','profile','center','community','other']);
const MAX_SIZE = 6 * 1024 * 1024;

async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login?next=/admin/media');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner','admin'].includes(profile.role)) redirect('/account');
  return { supabase, userId };
}

export async function uploadMedia(formData: FormData) {
  const { supabase, userId } = await requireAdmin();
  const upload = formData.get('file');
  const alt = String(formData.get('alt_text') ?? '').trim().slice(0,500);
  const caption = String(formData.get('caption') ?? '').trim().slice(0,1200);
  const purposeRaw = String(formData.get('purpose') ?? 'content');
  const purpose = PURPOSES.has(purposeRaw) ? purposeRaw : 'content';

  if (!(upload instanceof File) || !MIME_EXT[upload.type] || upload.size <= 0 || upload.size > MAX_SIZE || alt.length < 3) {
    redirect('/admin/media?error=invalid-file');
  }

  const now = new Date();
  const path = `${userId}/${now.getUTCFullYear()}/${String(now.getUTCMonth()+1).padStart(2,'0')}/${randomUUID()}.${MIME_EXT[upload.type]}`;
  const { error: uploadError } = await supabase.storage.from('rawafid-media').upload(path, upload, {
    contentType: upload.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (uploadError) redirect('/admin/media?error=upload-failed');

  const { error: registerError } = await supabase.rpc('register_media_asset', {
    p_object_path: path,
    p_file_name: upload.name.slice(0,300),
    p_mime_type: upload.type,
    p_size_bytes: upload.size,
    p_alt_text: alt,
    p_caption: caption || null,
    p_purpose: purpose,
  });
  if (registerError) {
    await supabase.storage.from('rawafid-media').remove([path]);
    redirect('/admin/media?error=register-failed');
  }

  revalidatePath('/admin/media');
  redirect('/admin/media?ok=uploaded');
}

export async function deleteMedia(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') ?? '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect('/admin/media?error=invalid-id');
  const { data: asset } = await supabase.from('media_assets').select('object_path').eq('id',id).maybeSingle();
  if (!asset?.object_path) redirect('/admin/media?error=not-found');

  const { error: storageError } = await supabase.storage.from('rawafid-media').remove([asset.object_path]);
  if (storageError) redirect('/admin/media?error=delete-storage-failed');
  const { error: dbError } = await supabase.rpc('delete_media_asset',{ p_id:id });
  if (dbError) redirect('/admin/media?error=delete-db-failed');

  revalidatePath('/admin/media');
  redirect('/admin/media?ok=deleted');
}
