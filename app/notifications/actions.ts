'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i;
export async function markNotificationRead(formData:FormData){
 const id=String(formData.get('notification_id')??'').trim();const all=formData.get('all')==='true';if(!all&&!UUID_RE.test(id))redirect('/notifications');
 const supabase=await createClient();const {data}=await supabase.auth.getClaims();if(!data?.claims?.sub)redirect('/login?next=/notifications');
 await supabase.rpc('mark_notification_read',{p_notification_id:all?null:id,p_all:all});revalidatePath('/notifications');redirect('/notifications');
}
