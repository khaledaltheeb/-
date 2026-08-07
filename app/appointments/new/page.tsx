import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { requestAppointment } from '../actions';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'طلب موعد',robots:{index:false,follow:false,noarchive:true}};
type SearchParams=Promise<{specialist?:string;center?:string;conversation?:string;error?:string}>;
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i;

export default async function NewAppointmentPage({searchParams}:{searchParams:SearchParams}){
 const params=await searchParams;const specialistId=String(params.specialist??'');const centerId=String(params.center??'');const conversationId=String(params.conversation??'');
 if((specialistId?1:0)+(centerId?1:0)!==1||(!UUID_RE.test(specialistId)&&!UUID_RE.test(centerId))||(conversationId&&!UUID_RE.test(conversationId)))redirect('/appointments?error=invalid-target');
 const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();if(!claims?.claims?.sub)redirect(`/login?next=${encodeURIComponent(`/appointments/new?${specialistId?`specialist=${specialistId}`:`center=${centerId}`}${conversationId?`&conversation=${conversationId}`:''}`)}`);
 let target:{name:string;subtitle:string;href:string;remote:boolean;inPerson:boolean}|null=null;
 if(specialistId){const {data}=await supabase.from('specialists').select('id,slug,full_name,professional_title,offers_remote,offers_in_person').eq('id',specialistId).eq('verification','verified').eq('is_active',true).maybeSingle();if(data)target={name:data.full_name,subtitle:data.professional_title||'مختص موثق',href:`/specialists/${data.slug}`,remote:data.offers_remote,inPerson:data.offers_in_person};}
 else {const {data}=await supabase.from('centers').select('id,slug,name,city,country,offers_remote,offers_in_person').eq('id',centerId).eq('verification','verified').eq('is_active',true).maybeSingle();if(data)target={name:data.name,subtitle:[data.city,data.country].filter(Boolean).join('، ')||'مركز موثق',href:`/centers/${data.slug}`,remote:data.offers_remote,inPerson:data.offers_in_person};}
 if(!target)redirect('/appointments?error=target-unavailable');
 return <><SiteHeader/><main className="communication-shell narrow"><section className="communication-heading"><div><span className="eyebrow">Appointments</span><h1>طلب موعد</h1><p>أرسل وقتًا مقترحًا ونمط الخدمة. يبقى الموعد «قيد الطلب» حتى يؤكده المختص أو المركز.</p></div></section>
 <div className="communication-card appointment-target"><div className="inbox-avatar large" aria-hidden="true">{target.name.slice(0,1)}</div><div><span className="verified-label">جهة موثقة</span><h2>{target.name}</h2><p>{target.subtitle}</p><Link href={target.href}>عرض الملف</Link></div></div>
 {params.error&&<div className="system-message error">تعذر إنشاء الطلب. تحقق من الوقت وحالة الجهة وعدم وجود طلب مماثل.</div>}
 <form action={requestAppointment} className="communication-form appointment-form">{specialistId&&<input type="hidden" name="specialist_id" value={specialistId}/>} {centerId&&<input type="hidden" name="center_id" value={centerId}/>} {conversationId&&<input type="hidden" name="conversation_id" value={conversationId}/>}<label>الوقت المقترح<input name="starts_at" type="datetime-local" required/></label><label>نمط الموعد<select name="mode" required defaultValue={target.remote?'remote':target.inPerson?'in_person':'other'}>{target.remote&&<option value="remote">عن بُعد</option>}{target.inPerson&&<option value="in_person">حضوري</option>}<option value="phone">هاتف</option><option value="other">يُحدد لاحقًا</option></select></label><label>ملاحظة للجهة<textarea name="note" rows={5} maxLength={2000} placeholder="سبب التواصل أو أي معلومة لازمة لترتيب الموعد، دون معلومات حساسة غير ضرورية."/></label><button className="primary-action" type="submit">إرسال طلب الموعد</button><small>الوقت المقترح لا يصبح موعدًا مؤكدًا إلا بعد قبول الجهة مقدمة الخدمة.</small></form>
 </main><SiteFooter/></>;
}
