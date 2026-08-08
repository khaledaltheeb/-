import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'لوحة التحكم',robots:{index:false,follow:false,noarchive:true}};

export default async function DashboardEntry(){
 const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;if(!uid)redirect('/login?next=/dashboard');
 const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',uid).single();if(!profile?.is_active)redirect('/account');
 if(profile.role==='owner'||profile.role==='admin')redirect('/admin');
 if(profile.role==='specialist')redirect('/specialist');
 if(profile.role==='center_manager')redirect('/center');
 redirect('/account');
}
