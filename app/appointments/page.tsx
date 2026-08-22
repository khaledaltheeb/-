import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { cancelAppointment,providerUpdateAppointment } from './actions';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'المواعيد',description:'إدارة طلبات المواعيد الخاصة في منصة روافد.',robots:{index:false,follow:false,noarchive:true}};
type SearchParams=Promise<{error?:string;created?:string;cancelled?:string;updated?:string}>;
type Appointment={appointment_id:string;conversation_id:string|null;perspective:'requester'|'provider';specialist_id:string|null;center_id:string|null;counterpart_name:string;counterpart_title:string|null;counterpart_slug:string|null;starts_at:string;ends_at:string|null;appointment_mode:string;status:'requested'|'confirmed'|'completed'|'cancelled'|'no_show';note:string|null;provider_note:string|null;cancelled_at:string|null;cancellation_reason:string|null;created_at:string;updated_at:string};
const STATUS:Record<string,string>={requested:'قيد الطلب',confirmed:'مؤكد',completed:'مكتمل',cancelled:'ملغى',no_show:'عدم حضور'};
const MODE:Record<string,string>={remote:'عن بُعد',in_person:'حضوري',phone:'هاتف',other:'يُحدد'};
function date(value:string|null){if(!value)return'';try{return new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}catch{return''}}

export default async function AppointmentsPage({searchParams}:{searchParams:SearchParams}){
 const params=await searchParams;const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();if(!claims?.claims?.sub)redirect('/login?next=/appointments');
 const {data,error}=await supabase.rpc('get_my_appointments',{p_limit:200,p_offset:0});const rows:Appointment[]=Array.isArray(data)?data as Appointment[]:[];
 const upcoming=rows.filter(r=>['requested','confirmed'].includes(r.status));const history=rows.filter(r=>!['requested','confirmed'].includes(r.status));
 return <><SiteHeader/><main className="communication-shell appointments-shell">
 <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">المواعيد</span></nav>
 <section className="communication-heading"><div><span className="eyebrow">إدارة المواعيد</span><h1>المواعيد</h1><p>تابع طلبات المواعيد القادمة وسجل المواعيد السابقة من مكان واحد، سواء كنت طالب الخدمة أو مقدمها.</p></div><div className="communication-actions"><Link className="button" href="/messages">الرسائل</Link><Link className="button" href="/notifications">الإشعارات</Link></div></section>
 <nav className="communication-service-nav" aria-label="مسارات الخدمات"><Link href="/specialists">دليل المختصين</Link><Link href="/centers">دليل المراكز</Link><Link href="/care-guides/">أدلة الرعاية</Link><Link href="/search">البحث</Link></nav>
 {params.created&&<div className="system-message success">تم إرسال طلب الموعد. سيبقى قيد الطلب حتى تؤكده الجهة.</div>}{params.cancelled&&<div className="system-message success">تم إلغاء الموعد وتسجيل العملية.</div>}{params.updated&&<div className="system-message success">تم تحديث الموعد وإشعار الطرف الآخر.</div>}{params.error&&<div className="system-message error">تعذر تنفيذ عملية الموعد. لم تُحفظ حالة غير صالحة.</div>}{error&&<div className="search-state error"><h2>تعذر تحميل المواعيد</h2><p>حاول إعادة تحميل الصفحة بعد قليل.</p></div>}
 <section className="appointment-section"><div className="section-mini-heading"><div><span className="eyebrow">نشطة</span><h2>القادمة وقيد التنسيق</h2></div><span>{upcoming.length.toLocaleString('ar')}</span></div>{!error&&upcoming.length===0&&<div className="search-state appointment-empty"><h3>لا توجد مواعيد نشطة</h3><p>يمكنك اختيار مختص أو مركز موثق ثم إرسال طلب موعد من ملف الجهة.</p><div className="appointment-empty-actions"><Link className="primary-link" href="/specialists">استكشف المختصين</Link><Link className="button" href="/centers">استكشف المراكز</Link></div></div>}<div className="appointment-list">{upcoming.map(row=><AppointmentCard row={row} key={row.appointment_id}/>)}</div></section>
 {history.length>0&&<section className="appointment-section"><div className="section-mini-heading"><div><span className="eyebrow">السجل</span><h2>المواعيد السابقة</h2></div><span>{history.length.toLocaleString('ar')}</span></div><div className="appointment-list">{history.map(row=><AppointmentCard row={row} key={row.appointment_id}/>)}</div></section>}
 </main><SiteFooter/></>;
}

function AppointmentCard({row}:{row:Appointment}){
 const providerCanAct=row.perspective==='provider';const requesterCanCancel=row.perspective==='requester'&&['requested','confirmed'].includes(row.status);
 return <article className={`appointment-card status-${row.status}`}><div className="appointment-card-head"><div><span className="status-badge">{STATUS[row.status]||row.status}</span><h3>{row.counterpart_name}</h3><p>{row.counterpart_title||''}</p></div><div className="appointment-time"><strong>{date(row.starts_at)}</strong><span>{MODE[row.appointment_mode]||row.appointment_mode}{row.ends_at?` · حتى ${date(row.ends_at)}`:''}</span></div></div>
 <div className="appointment-meta">{row.note&&<div><strong>ملاحظة طالب الموعد</strong><p>{row.note}</p></div>}{row.provider_note&&<div><strong>ملاحظة مقدم الخدمة</strong><p>{row.provider_note}</p></div>}{row.cancellation_reason&&<div><strong>سبب الإلغاء</strong><p>{row.cancellation_reason}</p></div>}</div>
 <div className="appointment-actions">{row.conversation_id&&<Link className="button" href={`/messages/${row.conversation_id}`}>فتح المحادثة</Link>}{row.counterpart_slug&&<Link className="button" href={row.specialist_id?`/specialists/${row.counterpart_slug}`:`/centers/${row.counterpart_slug}`}>عرض ملف الجهة</Link>}
 {requesterCanCancel&&<details className="inline-action"><summary>إلغاء الموعد</summary><form action={cancelAppointment}><input type="hidden" name="appointment_id" value={row.appointment_id}/><label>سبب اختياري<input name="reason" maxLength={1000}/></label><button className="button danger" type="submit">تأكيد الإلغاء</button></form></details>}
 {providerCanAct&&row.status==='requested'&&<form action={providerUpdateAppointment} className="provider-quick-action"><input type="hidden" name="appointment_id" value={row.appointment_id}/><input type="hidden" name="status" value="confirmed"/><button className="primary-action" type="submit">تأكيد الموعد</button></form>}
 {providerCanAct&&row.status==='confirmed'&&<><form action={providerUpdateAppointment} className="provider-quick-action"><input type="hidden" name="appointment_id" value={row.appointment_id}/><input type="hidden" name="status" value="completed"/><button className="button" type="submit">تم الموعد</button></form><form action={providerUpdateAppointment} className="provider-quick-action"><input type="hidden" name="appointment_id" value={row.appointment_id}/><input type="hidden" name="status" value="no_show"/><button className="button" type="submit">عدم حضور</button></form></>}
 </div></article>;
}
