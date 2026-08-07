import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic='force-dynamic';
type SearchParams=Promise<{q?:string;entity?:string;action?:string}>;
type AuditRow={id:number;actor_id:string|null;actor_name:string|null;entity_type:string;entity_id:string|null;action:string;before_data:unknown;after_data:unknown;created_at:string};
function date(v:string){try{return new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'long'}).format(new Date(v))}catch{return''}}
function compact(value:unknown){if(!value)return'';try{const text=JSON.stringify(value);return text.length>900?`${text.slice(0,900)}…`:text}catch{return''}}

export default async function AuditPage({searchParams}:{searchParams:SearchParams}){
 const params=await searchParams;const q=String(params.q??'').trim().slice(0,200);const entity=String(params.entity??'').trim().slice(0,120);const action=String(params.action??'').trim().slice(0,160);const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;if(!uid)redirect('/login?next=/admin/audit');const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',uid).single();if(!profile?.is_active||!['owner','admin'].includes(profile.role))redirect('/account');
 const {data,error}=await supabase.rpc('admin_audit_log',{p_entity_type:entity||null,p_action:action||null,p_actor_id:null,p_query:q||null,p_from:null,p_to:null,p_limit:300,p_offset:0});const rows:AuditRow[]=Array.isArray(data)?data as AuditRow[]:[];
 return <main className="dashboard-shell"><section className="dashboard-card"><div className="admin-heading"><div><span className="eyebrow">Audit Trail</span><h1>سجل العمليات</h1><p>سجل زمني للعمليات الحساسة: التوثيق، الصلاحيات، المحتوى، الرسائل كأحداث بدون نصوصها، المواعيد، البلاغات والتحويلات.</p></div><div className="dashboard-actions"><Link className="button" href="/admin">لوحة الإدارة</Link><Link className="button" href="/admin/redirects">Redirects</Link></div></div>
 <form className="directory-filters" method="get"><label>بحث<input name="q" defaultValue={q} placeholder="معرّف، إجراء، اسم منفذ..."/></label><label>نوع الكيان<input name="entity" defaultValue={entity} placeholder="appointment, redirect..."/></label><label>الإجراء<input name="action" defaultValue={action} placeholder="appointment_requested..."/></label><button className="primary-action" type="submit">تصفية</button>{(q||entity||action)&&<Link href="/admin/audit">مسح</Link>}</form>
 {error&&<p className="system-message error">تعذر تحميل سجل العمليات.</p>}<div className="audit-list">{rows.map(row=><article className="audit-item" key={row.id}><div className="audit-head"><div><span className="status-badge">{row.entity_type}</span><strong>{row.action}</strong></div><time dateTime={row.created_at}>{date(row.created_at)}</time></div><div className="audit-meta"><span>المنفذ: {row.actor_name||row.actor_id||'النظام'}</span>{row.entity_id&&<span>الكيان: <bdi>{row.entity_id}</bdi></span>}</div>{row.before_data&&<details><summary>قبل</summary><pre>{compact(row.before_data)}</pre></details>}{row.after_data&&<details><summary>بعد</summary><pre>{compact(row.after_data)}</pre></details>}</article>)}{!error&&rows.length===0&&<p className="empty-state">لا توجد عمليات مطابقة.</p>}</div>
 </section></main>;
}
