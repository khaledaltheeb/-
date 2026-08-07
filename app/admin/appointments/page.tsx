import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic='force-dynamic';
type SearchParams=Promise<{status?:string}>;
type Row={appointment_id:string;requester_id:string;requester_name:string|null;conversation_id:string|null;specialist_id:string|null;center_id:string|null;provider_name:string;starts_at:string;ends_at:string|null;appointment_mode:string;status:string;note:string|null;provider_note:string|null;cancelled_at:string|null;cancellation_reason:string|null;created_at:string;updated_at:string};
const STATUS:Record<string,string>={requested:'قيد الطلب',confirmed:'مؤكد',completed:'مكتمل',cancelled:'ملغى',no_show:'عدم حضور'};
function date(v:string|null){if(!v)return'';try{return new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v))}catch{return''}}

export default async function AdminAppointmentsPage({searchParams}:{searchParams:SearchParams}){
 const params=await searchParams;const status=Object.hasOwn(STATUS,String(params.status))?String(params.status):null;const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;if(!uid)redirect('/login?next=/admin/appointments');const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',uid).single();if(!profile?.is_active||!['owner','admin'].includes(profile.role))redirect('/account');
 const {data,error}=await supabase.rpc('admin_appointments',{p_status:status,p_limit:300,p_offset:0});const rows:Row[]=Array.isArray(data)?data as Row[]:[];
 return <main className="dashboard-shell"><section className="dashboard-card"><div className="admin-heading"><div><span className="eyebrow">Appointment Oversight</span><h1>المواعيد</h1><p>رؤية إدارية لحالات المواعيد وتشخيص الاختناقات التشغيلية. إدارة الحالة اليومية تبقى لدى طالب الموعد ومقدم الخدمة.</p></div><div className="dashboard-actions"><Link className="button" href="/admin">لوحة الإدارة</Link><Link className="button" href="/admin/audit">Audit Log</Link></div></div>
 <nav className="search-filters"><Link className={!status?'active':''} href="/admin/appointments">الكل</Link>{Object.entries(STATUS).map(([key,label])=><Link className={status===key?'active':''} href={`/admin/appointments?status=${key}`} key={key}>{label}</Link>)}</nav>
 {error&&<p className="system-message error">تعذر تحميل المواعيد.</p>}<div className="admin-list">{rows.map(row=><article className="admin-list-item" key={row.appointment_id}><div><span className="status-badge">{STATUS[row.status]||row.status}</span><h2>{row.provider_name}</h2><p>طالب الموعد: {row.requester_name||'حساب روافد'} · {date(row.starts_at)}</p><small>{row.appointment_mode} · <bdi>{row.appointment_id}</bdi></small>{row.cancellation_reason&&<p>سبب الإلغاء: {row.cancellation_reason}</p>}</div>{row.conversation_id&&<Link className="button" href={`/admin/audit?q=${row.appointment_id}`}>الأحداث المسجلة</Link>}</article>)}{!error&&rows.length===0&&<p className="empty-state">لا توجد مواعيد مطابقة.</p>}</div>
 </section></main>;
}
