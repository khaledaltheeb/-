'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function text(fd:FormData,key:string,max:number){return String(fd.get(key)??'').trim().slice(0,max)}
function uuid(fd:FormData,key:string){const value=text(fd,key,60);return UUID_RE.test(value)?value:null}
function isoDateValue(fd:FormData,key:string){const raw=text(fd,key,80);if(!raw)return null;const date=new Date(raw);return Number.isFinite(date.getTime())?date.toISOString():null}
async function client(next:string){const supabase=await createClient();const {data}=await supabase.auth.getClaims();if(!data?.claims?.sub)redirect(`/login?next=${encodeURIComponent(next)}`);return supabase}

export async function requestAppointment(formData:FormData){
 const specialistId=uuid(formData,'specialist_id');const centerId=uuid(formData,'center_id');const conversationId=uuid(formData,'conversation_id');
 if((specialistId?1:0)+(centerId?1:0)!==1)redirect('/appointments?error=invalid-target');
 const startsAt=isoDateValue(formData,'starts_at_utc');if(!startsAt)redirect('/appointments?error=invalid-time');
 const mode=text(formData,'mode',30);if(!['remote','in_person','phone','other'].includes(mode))redirect('/appointments?error=invalid-mode');
 const next=`/appointments/new?${specialistId?`specialist=${specialistId}`:`center=${centerId}`}${conversationId?`&conversation=${conversationId}`:''}`;
 const supabase=await client(next);const {data,error}=await supabase.rpc('request_appointment',{p_specialist_id:specialistId,p_center_id:centerId,p_starts_at:startsAt,p_ends_at:null,p_note:text(formData,'note',2000)||null,p_mode:mode,p_conversation_id:conversationId});
 if(error||typeof data!=='string')redirect(`${next}&error=request-failed`);
 revalidatePath('/appointments');revalidatePath('/notifications');revalidatePath('/messages');redirect(`/appointments?created=${data}`);
}

export async function cancelAppointment(formData:FormData){
 const appointmentId=uuid(formData,'appointment_id');if(!appointmentId)redirect('/appointments');const supabase=await client('/appointments');
 const {error}=await supabase.rpc('requester_cancel_appointment',{p_appointment_id:appointmentId,p_reason:text(formData,'reason',1000)||null});
 if(error)redirect('/appointments?error=cancel-failed');revalidatePath('/appointments');revalidatePath('/notifications');redirect('/appointments?cancelled=1');
}

export async function providerUpdateAppointment(formData:FormData){
 const appointmentId=uuid(formData,'appointment_id');if(!appointmentId)redirect('/appointments');const status=text(formData,'status',30);if(!['confirmed','completed','cancelled','no_show'].includes(status))redirect('/appointments?error=invalid-status');
 const supabase=await client('/appointments');const startsAt=isoDateValue(formData,'starts_at');const endsAt=isoDateValue(formData,'ends_at');
 const {error}=await supabase.rpc('provider_update_appointment',{p_appointment_id:appointmentId,p_status:status,p_starts_at:startsAt,p_ends_at:endsAt,p_provider_note:text(formData,'provider_note',2000)||null});
 if(error)redirect('/appointments?error=update-failed');revalidatePath('/appointments');revalidatePath('/notifications');redirect('/appointments?updated=1');
}
