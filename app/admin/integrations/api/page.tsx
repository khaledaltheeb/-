import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PartnerApiConsole from './partner-api-console';
import { revokePartnerKeyAction, setPartnerStatusAction } from './actions';

export const dynamic = 'force-dynamic';

type ApiKeyRow = {
  id: string; label: string; key_prefix: string; scopes: string[]; status: string;
  expires_at: string; last_used_at: string | null; created_at: string;
};
type PartnerRow = {
  id: string; slug: string; name: string; contact_email: string | null; status: string; plan: string;
  scopes: string[]; quota_per_minute: number; quota_per_day: number; created_at: string;
  keys: ApiKeyRow[]; usage_today: number;
};

type Dashboard = { generated_at: string; partners: PartnerRow[] };

export default async function PartnerApiAdminPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) redirect('/login?next=/admin/integrations/api');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id',uid).single();
  if (!profile?.is_active || !['owner','admin'].includes(profile.role)) redirect('/account');

  const { data, error } = await supabase.rpc('admin_api_partner_dashboard');
  const dashboard = (data || { generated_at: new Date().toISOString(), partners: [] }) as Dashboard;
  const partners = Array.isArray(dashboard.partners) ? dashboard.partners : [];
  const activeKeys = partners.flatMap(p=>p.keys || []).filter(k=>k.status==='active' && new Date(k.expires_at).getTime()>Date.now()).length;
  const todayUsage = partners.reduce((sum,p)=>sum+Number(p.usage_today||0),0);

  return <main className="dashboard-shell"><section className="dashboard-card">
    <div className="admin-heading"><div><span className="eyebrow">Institutional API</span><h1>تكاملات الشركاء ومفاتيح API</h1><p>إدارة الجهات المصرح لها، المفاتيح، نطاقات القراءة، انتهاء الصلاحية، الحصص، وسجل الاستخدام دون مشاركة أي مفتاح لقاعدة البيانات.</p></div><div className="dashboard-actions"><Link className="button" href="/developers">توثيق المطورين</Link><Link className="button" href="/admin/audit">سجل التدقيق</Link></div></div>
    {error&&<p className="system-message error">تعذر تحميل لوحة Partner API: {error.message}</p>}
    <div className="integrity-grid">
      <article className="integrity-card ok"><div className="integrity-count">{partners.length}</div><div><span className="status-badge">Partners</span><h2>الجهات المسجلة</h2></div></article>
      <article className="integrity-card ok"><div className="integrity-count">{activeKeys}</div><div><span className="status-badge">Keys</span><h2>المفاتيح الفعالة</h2></div></article>
      <article className="integrity-card ok"><div className="integrity-count">{todayUsage}</div><div><span className="status-badge">UTC Today</span><h2>طلبات الشركاء اليوم</h2></div></article>
    </div>
    <PartnerApiConsole partners={partners.map(({id,name,slug,status})=>({id,name,slug,status}))} />

    <section className="dashboard-card">
      <div className="section-mini-heading"><h2>الشركاء الحاليون</h2><span>الحالة والحصص والمفاتيح</span></div>
      {partners.length===0?<p>لا توجد جهات Partner API مسجلة حتى الآن.</p>:<div className="integrity-grid">{partners.map(partner=><article className={`integrity-card ${partner.status==='active'?'ok':partner.status==='suspended'?'warn':'error'}`} key={partner.id}>
        <div><span className="status-badge">{partner.status}</span><h2>{partner.name}</h2><code>{partner.slug}</code><p>{partner.contact_email||'لا يوجد بريد مسجل'}</p><p>الخطة: <strong>{partner.plan}</strong> — الحصة: {partner.quota_per_minute}/دقيقة و{partner.quota_per_day}/يوم — استخدام اليوم: {Number(partner.usage_today||0)}</p><p>النطاقات: {(partner.scopes||[]).join(', ')}</p></div>
        <form action={setPartnerStatusAction} className="dashboard-actions"><input type="hidden" name="partner_id" value={partner.id}/><select name="status" defaultValue={partner.status}><option value="active">active</option><option value="suspended">suspended</option><option value="revoked">revoked</option></select><button className="button" type="submit">تحديث الحالة</button></form>
        <div>{(partner.keys||[]).length===0?<p>لا توجد مفاتيح.</p>:(partner.keys||[]).map(key=><div className="portal-notice" key={key.id}><strong>{key.label}</strong><code>{key.key_prefix}…</code><span>{key.status} — ينتهي {new Date(key.expires_at).toLocaleDateString('ar')} — آخر استخدام {key.last_used_at?new Date(key.last_used_at).toLocaleString('ar'):'لم يُستخدم بعد'}</span><span>{(key.scopes||[]).join(', ')}</span>{key.status==='active'&&<form action={revokePartnerKeyAction}><input type="hidden" name="key_id" value={key.id}/><button className="button" type="submit">إلغاء المفتاح</button></form>}</div>)}</div>
      </article>)}</div>}
    </section>
    <aside className="portal-notice"><strong>قاعدة أمنية</strong><span>المفتاح الكامل يظهر مرة واحدة عند الإصدار. بعد ذلك تعرض اللوحة البادئة فقط. الإلغاء نهائي، ويمكن إصدار مفتاح بديل دون تغيير تكامل بقية الشركاء.</span></aside>
  </section></main>;
}
