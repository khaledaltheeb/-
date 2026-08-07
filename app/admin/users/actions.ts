'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ROLES = new Set(['owner','admin','editor','scientific_reviewer','seo_manager','specialist','center_manager','user']);

export async function setUserAccess(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner','admin'].includes(profile.role)) redirect('/account');

  const targetId = String(formData.get('user_id') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim();
  const isActive = formData.get('is_active') === 'on';
  if (!UUID_RE.test(targetId) || !ROLES.has(role)) redirect('/admin/users?error=invalid-input');

  const { error } = await supabase.rpc('admin_set_user_access', {
    p_user_id: targetId,
    p_role: role,
    p_is_active: isActive,
  });
  if (error) redirect('/admin/users?error=update-failed');

  revalidatePath('/admin/users');
  revalidatePath('/admin');
  redirect('/admin/users?ok=updated');
}
