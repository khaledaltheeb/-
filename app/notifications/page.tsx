import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { markNotificationRead } from './actions';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'الإشعارات',robots:{index:false,follow:false,noarchive:true}};
type Notification={notification_id:string;kind:string;title:string;body:string|null;data:Record<string,unknown>;read_at:string|null;created_at:string};
const KIND_LABELS:Record<string,string>={message:'رسالة',new_message:'رسالة جديدة',appointment:'موعد',appointment_requested:'طلب موعد',appointment_confirmed:'تأكيد موعد',appointment_cancelled:'إلغاء موعد',appointment_updated:'تحديث موعد',provider_application:'طلب انضمام مهني',verification_update:'تحديث التوثيق',system:'إشعار النظام'};
function date(value:string){try{return new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}catch{return''}}
function destination(item:Notification){
 const data=item.data||{};const conversation=typeof data.conversation_id==='string'?data.conversation_id:null;const appointment=typeof data.appointment_id==='string'?data.appointment_id:null;
 if(conversation)return `/messages/${conversation}`;if(appointment)return '/appointments';
 if(item.kind==='provider_application'&&typeof data.specialist_id==='string')return '/admin/specialists?status=pending';
 if(item.kind==='provider_application'&&typeof data.center_id==='string')return '/admin/centers?status=pending';
 if(item.kind==='verification_update'&&typeof data.specialist_id==='string')return '/join/specialist';
 if(item.kind==='verification_update'&&typeof data.center_id==='string')return '/join/center';
 return '/account';
}

export default async function NotificationsPage(){
 const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();if(!claims?.claims?.sub)redirect('/login?next=/notifications');
 const {data,error}=await supabase.rpc('get_my_notifications',{p_limit:100,p_offset:0});const rows:Notification[]=Array.isArray(data)?data as Notification[]:[];const unread=rows.filter(row=>!row.read_at).length;
 return <><SiteHeader/><main className="communication-shell notifications-shell">
 <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">الإشعارات</span></nav>
 <section className="communication-heading"><div><span className="eyebrow">مركز التنبيهات</span><h1>الإشعارات</h1><p>تابع الرسائل والمواعيد وتحديثات التوثيق والعمليات المهمة المرتبطة بحسابك من مكان واحد.</p></div><div className="communication-actions"><Link className="button" href="/messages">الرسائل</Link><Link className="button" href="/appointments">المواعيد</Link>{unread>0&&<form action={markNotificationRead}><input type="hidden" name="all" value="true"/><button className="button" type="submit">تحديد الكل كمقروء</button></form>}</div></section>
 <nav className="communication-service-nav" aria-label="مسارات الخدمات"><Link href="/specialists">دليل المختصين</Link><Link href="/centers">دليل المراكز</Link><Link href="/messages">الرسائل</Link><Link href="/appointments">المواعيد</Link></nav>
 <div className="inbox-toolbar notification-summary"><div><strong>{unread.toLocaleString('ar')}</strong><span>إشعار غير مقروء</span></div><span>{rows.length.toLocaleString('ar')} إشعار إجمالًا</span></div>
 {error&&<div className="search-state error"><h2>تعذر تحميل الإشعارات</h2><p>حاول إعادة تحميل الصفحة بعد قليل.</p></div>}{!error&&rows.length===0&&<div className="search-state"><h2>لا توجد إشعارات</h2><p>ستظهر هنا إشعارات الرسائل والمواعيد والعمليات المتعلقة بحسابك.</p></div>}
 <div className="notification-list">{rows.map(row=><article className={`notification-item ${row.read_at?'':'unread'}`} key={row.notification_id}><div><span className="notification-kind">{KIND_LABELS[row.kind]||'إشعار'}</span><h2>{row.title}</h2>{row.body&&<p>{row.body}</p>}<time dateTime={row.created_at}>{date(row.created_at)}</time></div><div className="notification-actions"><Link className="button" href={destination(row)}>فتح التفاصيل</Link>{!row.read_at&&<form action={markNotificationRead}><input type="hidden" name="notification_id" value={row.notification_id}/><button className="button" type="submit">تحديد كمقروء</button></form>}</div></article>)}</div>
 </main><SiteFooter/></>;
}
