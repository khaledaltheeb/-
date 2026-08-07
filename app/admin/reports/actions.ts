'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i;
export async function resolveReport(formData:FormData){const id=String(formData.get('report_id')??'').trim();const status=String(formData.get('status')??'').trim();if(!UUID_RE.test(id)||!['reviewing','resolved','dismissed'].includes(status))redirect('/admin/reports?error=invalid');const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();if(!claims?.claims?.sub)redirect('/login?next=/admin/reports');const {error}=await supabase.rpc('admin_resolve_conversation_report',{p_report_id:id,p_status:status,p_resolution_note:String(formData.get('resolution_note')??'').trim().slice(0,2000)||null});if(error)redirect('/admin/reports?error=update');revalidatePath('/admin/reports');redirect('/admin/reports?ok=1');}
