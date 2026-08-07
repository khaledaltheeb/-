'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function text(fd:FormData,key:string,max:number){return String(fd.get(key)??'').trim().slice(0,max)}
function uuid(fd:FormData,key:string){const value=text(fd,key,60);return UUID_RE.test(value)?value:null}
async function authenticatedClient(next:string){const supabase=await createClient();const {data}=await supabase.auth.getClaims();if(!data?.claims?.sub)redirect(`/login?next=${encodeURIComponent(next)}`);return supabase}

export async function startConversation(formData:FormData){
  const specialistId=uuid(formData,'specialist_id');const centerId=uuid(formData,'center_id');
  if((specialistId?1:0)+(centerId?1:0)!==1)redirect('/messages?error=invalid-target');
  const next=specialistId?`/messages/new?specialist=${specialistId}`:`/messages/new?center=${centerId}`;
  const supabase=await authenticatedClient(next);
  const {data,error}=await supabase.rpc('start_conversation',{p_specialist_id:specialistId,p_center_id:centerId,p_subject:text(formData,'subject',160)||null});
  if(error||typeof data!=='string'||!UUID_RE.test(data))redirect(`${next}&error=start-failed`);
  revalidatePath('/messages');redirect(`/messages/${data}`);
}

export async function sendMessage(formData:FormData){
  const conversationId=uuid(formData,'conversation_id');if(!conversationId)redirect('/messages?error=invalid-conversation');
  const body=text(formData,'body',4000);if(!body)redirect(`/messages/${conversationId}?error=empty-message`);
  const supabase=await authenticatedClient(`/messages/${conversationId}`);
  const {error}=await supabase.rpc('send_message',{p_conversation_id:conversationId,p_body:body,p_client_token:crypto.randomUUID(),p_reply_to_id:null,p_attachments:[]});
  if(error)redirect(`/messages/${conversationId}?error=send-failed`);
  revalidatePath(`/messages/${conversationId}`);revalidatePath('/messages');revalidatePath('/notifications');redirect(`/messages/${conversationId}`);
}

export async function setConversationArchived(formData:FormData){
  const conversationId=uuid(formData,'conversation_id');if(!conversationId)redirect('/messages');
  const archived=formData.get('archived')==='true';const supabase=await authenticatedClient('/messages');
  await supabase.rpc('set_conversation_archived',{p_conversation_id:conversationId,p_archived:archived});
  revalidatePath('/messages');redirect('/messages');
}

export async function setUserBlock(formData:FormData){
  const conversationId=uuid(formData,'conversation_id');const userId=uuid(formData,'user_id');if(!conversationId||!userId)redirect('/messages');
  const blocked=formData.get('blocked')==='true';const supabase=await authenticatedClient(`/messages/${conversationId}`);
  const {error}=await supabase.rpc('set_user_block',{p_user_id:userId,p_blocked:blocked});
  if(error)redirect(`/messages/${conversationId}?error=block-failed`);
  revalidatePath(`/messages/${conversationId}`);redirect(`/messages/${conversationId}`);
}

export async function reportConversation(formData:FormData){
  const conversationId=uuid(formData,'conversation_id');const reportedUserId=uuid(formData,'reported_user_id');if(!conversationId)redirect('/messages');
  const reason=text(formData,'reason',40);const allowed=new Set(['spam','harassment','unsafe','impersonation','privacy','other']);
  if(!allowed.has(reason))redirect(`/messages/${conversationId}?error=invalid-report`);
  const supabase=await authenticatedClient(`/messages/${conversationId}`);
  const {error}=await supabase.rpc('report_conversation',{p_conversation_id:conversationId,p_reason:reason,p_details:text(formData,'details',2000)||null,p_reported_user_id:reportedUserId,p_message_id:null});
  if(error)redirect(`/messages/${conversationId}?error=report-failed`);
  redirect(`/messages/${conversationId}?reported=1`);
}
