import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'الرسائل',description:'صندوق الرسائل الخاص في منصة روافد.',robots:{index:false,follow:false,noarchive:true}};
type SearchParams=Promise<{archived?:string;error?:string}>;
type Conversation={conversation_id:string;subject:string|null;specialist_id:string|null;center_id:string|null;counterpart_user_id:string;counterpart_name:string;counterpart_title:string|null;counterpart_slug:string|null;last_message_body:string|null;last_message_at:string;unread_count:number;archived_at:string|null;blocked_by_me:boolean;blocked_me:boolean;closed_at:string|null};
function date(value:string){try{return new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}catch{return''}}

export default async function MessagesPage({searchParams}:{searchParams:SearchParams}){
 const params=await searchParams;const includeArchived=params.archived==='1';const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();if(!claims?.claims?.sub)redirect('/login?next=/messages');
 const {data,error}=await supabase.rpc('get_my_conversations',{p_include_archived:includeArchived,p_limit:100,p_offset:0});const rows:Conversation[]=Array.isArray(data)?data as Conversation[]:[];
 return <><SiteHeader/><main className="communication-shell messages-shell">
 <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">الرسائل</span></nav>
 <section className="communication-heading"><div><span className="eyebrow">التواصل الخاص</span><h1>الرسائل</h1><p>محادثاتك الخاصة مع المختصين والمراكز داخل روافد. لا تظهر المحادثة إلا لأطرافها المخولين، ويمكن متابعة الموعد من المسار نفسه عند توفره.</p></div><div className="communication-actions"><Link className="button" href="/notifications">الإشعارات</Link><Link className="button" href="/appointments">المواعيد</Link></div></section>
 <nav className="communication-service-nav" aria-label="مسارات الخدمات"><Link href="/specialists">دليل المختصين</Link><Link href="/centers">دليل المراكز</Link><Link href="/appointments">المواعيد</Link><Link href="/care-guides/">أدلة الرعاية</Link></nav>
 {params.error&&<div className="system-message error">تعذر تنفيذ العملية. لم يتم تغيير بيانات المحادثة.</div>}
 <div className="inbox-toolbar"><div><strong>{rows.length.toLocaleString('ar')}</strong><span>{includeArchived?'محادثة تشمل المؤرشفة':'محادثة نشطة'}</span></div><Link className="button" href={includeArchived?'/messages':'/messages?archived=1'}>{includeArchived?'إخفاء المؤرشفة':'عرض المؤرشفة'}</Link></div>
 {error&&<div className="search-state error"><h2>تعذر تحميل الرسائل</h2><p>لم يتم عرض أي بيانات غير مؤكدة. حاول إعادة تحميل الصفحة بعد قليل.</p></div>}
 {!error&&rows.length===0&&<div className="search-state message-empty"><h2>لا توجد محادثات بعد</h2><p>ابدأ من ملف مختص موثق أو مركز موثق؛ لن تحتاج إلى مشاركة بيانات الاتصال الخاصة لبدء التواصل داخل المنصة.</p><div className="appointment-empty-actions"><Link className="primary-link" href="/specialists">استكشف المختصين</Link><Link className="button" href="/centers">استكشف المراكز</Link></div></div>}
 <div className="inbox-list">{rows.map((row)=><Link className={`inbox-item ${row.unread_count>0?'unread':''}`} href={`/messages/${row.conversation_id}`} key={row.conversation_id}><div className="inbox-avatar" aria-hidden="true">{row.counterpart_name.slice(0,1)}</div><div className="inbox-copy"><div className="inbox-title"><strong>{row.counterpart_name}</strong>{row.unread_count>0&&<span className="unread-badge">{row.unread_count.toLocaleString('ar')}</span>}</div><span className="inbox-subtitle">{row.counterpart_title||'مستخدم روافد'}{row.archived_at?' · مؤرشفة':''}{row.closed_at?' · مغلقة':''}</span><p>{row.last_message_body||row.subject||'ابدأ المحادثة برسالة واضحة ومختصرة.'}</p></div><time dateTime={row.last_message_at}>{date(row.last_message_at)}</time></Link>)}</div>
 </main><SiteFooter/></>;
}
