import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveReport } from './actions';

export const dynamic='force-dynamic';
type SearchParams=Promise<{status?:string;ok?:string;error?:string}>;
type Report={report_id:string;conversation_id:string;reporter_id:string;reporter_name:string|null;reported_user_id:string|null;reported_user_name:string|null;message_id:string|null;reason:string;details:string|null;status:string;reviewed_by:string|null;reviewed_at:string|null;resolution_note:string|null;created_at:string};
const REASON:Record<string,string>={spam:'رسائل مزعجة',harassment:'مضايقة',unsafe:'محتوى غير آمن',impersonation:'انتحال',privacy:'خصوصية',other:'أخرى'};
const STATUS:Record<string,string>={pending:'قيد الانتظار',reviewing:'قيد المراجعة',resolved:'مغلق كمعالج',dismissed:'مرفوض'};
function date(v:string|null){if(!v)return'';try{return new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v))}catch{return''}}

export default async function AdminReportsPage({searchParams}:{searchParams:SearchParams}){
 const params=await searchParams;const status=['pending','reviewing','resolved','dismissed'].includes(String(params.status))?String(params.status):null;const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;if(!uid)redirect('/login?next=/admin/reports');const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',uid).single();if(!profile?.is_active||!['owner','admin'].includes(profile.role))redirect('/account');
 const {data,error}=await supabase.rpc('admin_conversation_reports',{p_status:status,p_limit:200,p_offset:0});const rows:Report[]=Array.isArray(data)?data as Report[]:[];
 return <main className="dashboard-shell"><section className="dashboard-card"><div className="admin-heading"><div><span className="eyebrow">Moderation Queue</span><h1>بلاغات المحادثات</h1><p>مراجعة بلاغات الإساءة دون إظهار نصوص المحادثة تلقائيًا في لوحة الإدارة.</p></div><div className="dashboard-actions"><Link className="button" href="/admin">لوحة الإدارة</Link><Link className="button" href="/admin/audit">Audit Log</Link></div></div>
 {params.ok&&<p className="system-message success">تم تحديث حالة البلاغ وتسجيل العملية.</p>}{(params.error||error)&&<p className="system-message error">تعذر تحميل أو تحديث البلاغات.</p>}
 <nav className="search-filters" aria-label="حالة البلاغ"><Link className={!status?'active':''} href="/admin/reports">الكل</Link>{Object.entries(STATUS).map(([value,label])=><Link className={status===value?'active':''} href={`/admin/reports?status=${value}`} key={value}>{label}</Link>)}</nav>
 <div className="admin-list">{rows.map(row=><article className="admin-list-item" key={row.report_id}><div><span className={`status-badge status-${row.status}`}>{STATUS[row.status]||row.status}</span><h2>{REASON[row.reason]||row.reason}</h2><p>المبلّغ: {row.reporter_name||'حساب روافد'}{row.reported_user_name?` · ضد: ${row.reported_user_name}`:''}</p>{row.details&&<blockquote>{row.details}</blockquote>}<small>المحادثة: <bdi>{row.conversation_id}</bdi> · {date(row.created_at)}</small>{row.resolution_note&&<p><strong>قرار المراجعة:</strong> {row.resolution_note}</p>}</div><form action={resolveReport} className="admin-inline-form"><input type="hidden" name="report_id" value={row.report_id}/><label>الحالة<select name="status" defaultValue={row.status==='pending'?'reviewing':row.status}><option value="reviewing">قيد المراجعة</option><option value="resolved">معالج</option><option value="dismissed">مرفوض</option></select></label><label>ملاحظة القرار<textarea name="resolution_note" rows={3} maxLength={2000} defaultValue={row.resolution_note??''}/></label><button className="primary-action" type="submit">حفظ القرار</button></form></article>)}{!error&&rows.length===0&&<p className="empty-state">لا توجد بلاغات ضمن الفلتر الحالي.</p>}</div>
 </section></main>;
}
