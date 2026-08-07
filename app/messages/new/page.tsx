import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { startConversation } from '../actions';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'بدء محادثة',robots:{index:false,follow:false,noarchive:true}};
type SearchParams=Promise<{specialist?:string;center?:string;error?:string}>;
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i;

export default async function NewConversationPage({searchParams}:{searchParams:SearchParams}){
 const params=await searchParams;const specialistId=String(params.specialist??'');const centerId=String(params.center??'');
 if((specialistId?1:0)+(centerId?1:0)!==1||(!UUID_RE.test(specialistId)&&!UUID_RE.test(centerId)))redirect('/messages?error=invalid-target');
 const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();if(!claims?.claims?.sub)redirect(`/login?next=${encodeURIComponent(`/messages/new?${specialistId?`specialist=${specialistId}`:`center=${centerId}`}`)}`);
 let target:{name:string;subtitle:string;href:string}|null=null;
 if(specialistId){const {data}=await supabase.from('specialists').select('id,slug,full_name,professional_title').eq('id',specialistId).eq('verification','verified').eq('is_active',true).maybeSingle();if(data)target={name:data.full_name,subtitle:data.professional_title||'مختص موثق',href:`/specialists/${data.slug}`};}
 else {const {data}=await supabase.from('centers').select('id,slug,name,city,country').eq('id',centerId).eq('verification','verified').eq('is_active',true).maybeSingle();if(data)target={name:data.name,subtitle:[data.city,data.country].filter(Boolean).join('، ')||'مركز موثق',href:`/centers/${data.slug}`};}
 if(!target)redirect('/messages?error=target-unavailable');
 return <><SiteHeader/><main className="communication-shell narrow"><section className="communication-heading"><div><span className="eyebrow">Secure Contact</span><h1>بدء محادثة</h1><p>ستُنشأ محادثة خاصة بين حسابك والجهة المحددة. إذا كانت هناك محادثة نشطة سيفتحها النظام بدل إنشاء نسخة مكررة.</p></div></section>
 <div className="communication-card start-conversation-card"><div className="inbox-avatar large" aria-hidden="true">{target.name.slice(0,1)}</div><div><span className="verified-label">موثق</span><h2>{target.name}</h2><p>{target.subtitle}</p><Link href={target.href}>مراجعة الملف العام</Link></div></div>
 {params.error&&<div className="system-message error">تعذر بدء المحادثة. تحقق من حالة الملف وحاول مرة أخرى.</div>}
 <form action={startConversation} className="communication-form">{specialistId&&<input type="hidden" name="specialist_id" value={specialistId}/>} {centerId&&<input type="hidden" name="center_id" value={centerId}/>}<label>موضوع مختصر <input name="subject" maxLength={160} placeholder="مثال: استفسار عن الخدمة أو طلب توجيه"/></label><button className="primary-action" type="submit">بدء المحادثة الخاصة</button><small>لا تُستخدم المحادثة للطوارئ ولا تُعد بديلًا عن التقييم المهني المباشر عند الحاجة.</small></form>
 </main><SiteFooter/></>;
}
