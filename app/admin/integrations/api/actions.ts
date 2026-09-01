'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type PartnerActionState = { ok: boolean; message: string; secret?: string; partnerId?: string };

async function requireApiAdmin() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) throw new Error('authentication_required');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', uid).single();
  if (!profile?.is_active || !['owner','admin'].includes(profile.role)) throw new Error('forbidden');
  return supabase;
}

const field = (formData: FormData, name: string, max = 300) => String(formData.get(name) ?? '').trim().slice(0, max);

export async function createPartnerAction(_: PartnerActionState, formData: FormData): Promise<PartnerActionState> {
  try {
    const supabase = await requireApiAdmin();
    const name = field(formData, 'name', 200);
    const slug = field(formData, 'slug', 120).toLowerCase();
    const contactEmail = field(formData, 'contact_email', 254);
    const plan = field(formData, 'plan', 40) || 'institutional';
    const quotaMinute = Number(field(formData, 'quota_per_minute', 10) || 120);
    const quotaDay = Number(field(formData, 'quota_per_day', 12) || 25000);
    const scopes = formData.getAll('scopes').map(String);
    const { data, error } = await supabase.rpc('admin_create_api_partner', {
      p_name: name,
      p_slug: slug,
      p_contact_email: contactEmail || null,
      p_plan: plan,
      p_scopes: scopes.length ? scopes : ['content:read','sources:read','search:read','changes:read','stats:read'],
      p_quota_per_minute: quotaMinute,
      p_quota_per_day: quotaDay,
    });
    if (error) return { ok: false, message: error.message };
    const row = data as { id?: string; name?: string } | null;
    revalidatePath('/admin/integrations/api');
    return { ok: true, message: `تم إنشاء الشريك ${row?.name || name}.`, partnerId: row?.id };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'تعذر إنشاء الشريك.' };
  }
}

export async function issuePartnerKeyAction(_: PartnerActionState, formData: FormData): Promise<PartnerActionState> {
  try {
    const supabase = await requireApiAdmin();
    const partnerId = field(formData, 'partner_id', 64);
    const label = field(formData, 'label', 120);
    const expiresInDays = Math.min(Math.max(Number(field(formData, 'expires_in_days', 5) || 180), 1), 730);
    const expiresAt = new Date(Date.now() + expiresInDays * 86_400_000).toISOString();
    const scopes = formData.getAll('scopes').map(String);
    const { data, error } = await supabase.rpc('admin_issue_api_partner_key', {
      p_partner_id: partnerId,
      p_label: label,
      p_scopes: scopes.length ? scopes : null,
      p_expires_at: expiresAt,
    });
    if (error) return { ok: false, message: error.message };
    const row = data as { key?: string; key_prefix?: string } | null;
    if (!row?.key) return { ok: false, message: 'تمت العملية دون إرجاع المفتاح؛ لم يتم عرضه حفاظًا على الأمان.' };
    revalidatePath('/admin/integrations/api');
    return {
      ok: true,
      message: `تم إصدار المفتاح ${row.key_prefix || ''}. انسخه الآن؛ لن يظهر مرة أخرى.`,
      secret: row.key,
      partnerId,
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'تعذر إصدار المفتاح.' };
  }
}

export async function revokePartnerKeyAction(formData: FormData) {
  const supabase = await requireApiAdmin();
  const keyId = field(formData, 'key_id', 64);
  const { error } = await supabase.rpc('admin_revoke_api_partner_key', { p_key_id: keyId });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/integrations/api');
}

export async function setPartnerStatusAction(formData: FormData) {
  const supabase = await requireApiAdmin();
  const partnerId = field(formData, 'partner_id', 64);
  const status = field(formData, 'status', 20);
  const { error } = await supabase.rpc('admin_set_api_partner_status', { p_partner_id: partnerId, p_status: status });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/integrations/api');
}
