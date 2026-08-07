import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic='force-dynamic';
type IntegrityRow={check_key:string;severity:'error'|'warn'|'info';issue_count:number;summary:string};

export default async function IntegrityPage(){
 const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;if(!uid)redirect('/login?next=/admin/integrity');const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',uid).single();if(!profile?.is_active||!['owner','admin'].includes(profile.role))redirect('/account');
 const {data,error}=await supabase.rpc('admin_platform_integrity');const rows:IntegrityRow[]=Array.isArray(data)?data as IntegrityRow[]:[];const errors=rows.filter(row=>row.severity==='error'&&Number(row.issue_count)>0);const warnings=rows.filter(row=>row.severity==='warn'&&Number(row.issue_count)>0);
 return <main className="dashboard-shell"><section className="dashboard-card"><div className="admin-heading"><div><span className="eyebrow">Platform Integrity</span><h1>سلامة وترابط المنصة</h1><p>فحص مستمر للعلاقات بين المحادثات والرسائل والمواعيد، جاهزية حسابات مقدمي الخدمة، التحويلات، الصلاحيات المباشرة، ونواقص الثقة الأساسية في المحتوى المنشور.</p></div><div className="dashboard-actions"><Link className="button" href="/admin">لوحة الإدارة</Link><Link className="button" href="/admin/audit">Audit Log</Link></div></div>
 {error&&<p className="system-message error">تعذر تشغيل فحص سلامة المنصة.</p>}{!error&&errors.length===0&&warnings.length===0&&<p className="system-message success">جميع اختبارات التكامل الحالية تمر دون مشاكل مسجلة.</p>}{errors.length>0&&<p className="system-message error">يوجد {errors.reduce((sum,row)=>sum+Number(row.issue_count),0)} خلل تكاملي يجب معالجته.</p>}{warnings.length>0&&<p className="portal-notice warning"><strong>ملاحظات جاهزية</strong><span>يوجد {warnings.reduce((sum,row)=>sum+Number(row.issue_count),0)} عنصرًا يحتاج استكمالًا قبل اعتباره جاهزًا تشغيليًا.</span></p>}
 <div className="integrity-grid">{rows.map(row=>{const count=Number(row.issue_count);const state=count===0?'ok':row.severity;return <article className={`integrity-card ${state}`} key={row.check_key}><div className="integrity-count">{count}</div><div><span className="status-badge">{state==='ok'?'سليم':row.severity==='error'?'خلل':'تنبيه'}</span><h2>{row.summary}</h2><code>{row.check_key}</code></div></article>;})}</div>
 <aside className="portal-notice"><strong>معيار التقرير</strong><span>العدد 0 يعني عدم وجود حالة مخالفة في البيانات الحالية. الاختبار لا يستبدل E2E ثنائي الحسابات عندما تتوفر حسابات مقدم خدمة موثقة فعلية.</span></aside>
 </section></main>;
}
