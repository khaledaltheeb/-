'use client';

import { useActionState } from 'react';
import { createPartnerAction, issuePartnerKeyAction, type PartnerActionState } from './actions';

const initialState: PartnerActionState = { ok: false, message: '' };
const scopes = [
  ['content:read','المحتوى'],
  ['sources:read','المصادر'],
  ['search:read','البحث'],
  ['changes:read','التزامن'],
  ['stats:read','الإحصاءات'],
] as const;

type PartnerOption = { id: string; name: string; slug: string; status: string };

export default function PartnerApiConsole({ partners }: { partners: PartnerOption[] }) {
  const [createState, createAction, createPending] = useActionState(createPartnerAction, initialState);
  const [keyState, keyAction, keyPending] = useActionState(issuePartnerKeyAction, initialState);
  return <div className="integrity-grid">
    <section className="dashboard-card">
      <div className="section-mini-heading"><h2>إنشاء شريك API</h2><span>هوية مؤسسية + نطاقات + حصص</span></div>
      <form action={createAction} className="account-form">
        <label>اسم الجهة<input name="name" required maxLength={200} /></label>
        <label>المعرّف البرمجي<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="example-university" /></label>
        <label>البريد المؤسسي<input name="contact_email" type="email" maxLength={254} /></label>
        <label>الخطة<select name="plan" defaultValue="institutional"><option value="institutional">Institutional</option><option value="research">Research</option><option value="strategic">Strategic</option></select></label>
        <label>حد الدقيقة<input name="quota_per_minute" type="number" min={1} max={10000} defaultValue={120} /></label>
        <label>حد اليوم<input name="quota_per_day" type="number" min={1} max={10000000} defaultValue={25000} /></label>
        <fieldset><legend>النطاقات</legend>{scopes.map(([value,label])=><label key={value}><input type="checkbox" name="scopes" value={value} defaultChecked /> {label} <code>{value}</code></label>)}</fieldset>
        <button className="button" type="submit" disabled={createPending}>{createPending?'جارٍ الإنشاء…':'إنشاء الشريك'}</button>
        {createState.message&&<p className={`system-message ${createState.ok?'success':'error'}`}>{createState.message}</p>}
      </form>
    </section>

    <section className="dashboard-card">
      <div className="section-mini-heading"><h2>إصدار مفتاح</h2><span>يظهر مرة واحدة فقط</span></div>
      <form action={keyAction} className="account-form">
        <label>الشريك<select name="partner_id" required defaultValue=""><option value="" disabled>اختر الشريك</option>{partners.filter(p=>p.status==='active').map(p=><option key={p.id} value={p.id}>{p.name} — {p.slug}</option>)}</select></label>
        <label>تسمية المفتاح<input name="label" required maxLength={120} placeholder="production-website" /></label>
        <label>مدة الصلاحية بالأيام<input name="expires_in_days" type="number" min={1} max={730} defaultValue={180} /></label>
        <fieldset><legend>تقييد النطاقات اختياريًا</legend>{scopes.map(([value,label])=><label key={value}><input type="checkbox" name="scopes" value={value} /> {label} <code>{value}</code></label>)}</fieldset>
        <button className="button" type="submit" disabled={keyPending}>{keyPending?'جارٍ الإصدار…':'إصدار مفتاح جديد'}</button>
        {keyState.message&&<p className={`system-message ${keyState.ok?'success':'error'}`}>{keyState.message}</p>}
        {keyState.secret&&<div className="portal-notice warning"><strong>انسخ المفتاح الآن</strong><code dir="ltr" style={{overflowWrap:'anywhere'}}>{keyState.secret}</code><span>لن يعرضه النظام مرة أخرى، ولا يُخزن كنص صريح.</span></div>}
      </form>
    </section>
  </div>;
}
