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
function date(value:string){try{return new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}catch{return''}}
function destination(item:Notification){const data=item.data||{};const conversation=typeof data.conversation_id==='string'?data.conversation_id:null;const appointment=typeof data.appointment_id==='string'?data.appointment_id:null;if(conversation)return `/messages/${conversation}`;if(appointment)return '/appointments';return '/account';}

export default async function NotificationsPage(){
 const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();if(!claims?.claims?.sub)redirect('/login?next=/notifications');
 const {data,error}=await supabase.rpc('get_my_notifications',{p_limit:100,p_offset:0});const rows:Notification[]=Array.isArray(data)?data as Notification[]:[];const unread=rows.filter(row=>!row.read_at).length;
 return <><SiteHeader/><main className="communication-shell"><section className="communication-heading"><div><span className="eyebrow">Notification Center</span><h1>الإشعارات</h1><p>إشعارات الرسائل والمواعيد والتغييرات المهمة الخاصة بحسابك.</p></div><div className="communication-actions"><Link className="button" href="/messages">الرسائل</Link><Link className="button" href="/appointments">المواعيد</Link>{unread>0&&<form action={markNotificationRead}><input type="hidden" name="all" value="true"/><button className="button" type="submit">تحديد الكل كمقروء</button></form>}</div></section>
 {error&&<div className="search-state error"><h2>تعذر تحميل الإشعارات</h2></div>}{!error&&rows.length===0&&<div className="search-state"><h2>لا توجد إشعارات</h2><p>ستظهر هنا إشعارات الرسائل والمواعيد والعمليات المتعلقة بحسابك.</p></div>}
 <div className="notification-list">{rows.map(row=><article className={`notification-item ${row.read_at?'':'unread'}`} key={row.notification_id}><div><span className="notification-kind">{row.kind}</span><h2>{row.title}</h2>{row.body&&<p>{row.body}</p>}<time dateTime={row.created_at}>{date(row.created_at)}</time></div><div className="notification-actions"><Link className="button" href={destination(row)}>فتح</Link>{!row.read_at&&<form action={markNotificationRead}><input type="hidden" name="notification_id" value={row.notification_id}/><button className="button" type="submit">مقروء</button></form>}</div></article>)}</div>
 </main><SiteFooter/></>;
}
