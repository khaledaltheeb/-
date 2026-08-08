import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PlatformIcon from '@/components/platform-icon';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic='force-dynamic';
export const metadata:Metadata=buildSeoMetadata({title:'الانضمام المهني',description:'التقدم للانضمام إلى منصة روافد كمختص أو كمركز، مع مسار مراجعة وتوثيق واضح قبل الظهور في الدليل العام.',path:'/join',index:true,keywords:['الانضمام إلى منصة روافد','تسجيل مختص','تسجيل مركز','توثيق مختص']});

export default async function JoinHub(){
 const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;
 let role:string|null=null;if(uid){const {data:profile}=await supabase.from('profiles').select('role').eq('id',uid).maybeSingle();role=profile?.role??null;}
 const workspace=role==='specialist'?'/specialist':role==='center_manager'?'/center':role==='owner'||role==='admin'?'/admin':null;
 return <><SiteHeader/><main className="join-shell"><section className="join-hero"><div><span className="eyebrow">Professional Onboarding</span><h1>الانضمام المهني إلى <em>منصة روافد</em></h1><p>مسار واحد واضح من تقديم البيانات إلى المراجعة ثم التوثيق. لا يظهر أي مختص أو مركز في الدليل العام قبل الاعتماد الإداري.</p></div>{workspace?<Link className="primary-link" href={workspace}>فتح مساحة العمل</Link>:uid?<Link className="button" href="/account">حسابي</Link>:<Link className="primary-link" href="/login?next=%2Fjoin">تسجيل الدخول أو إنشاء حساب</Link>}</section>
 <section className="join-options" aria-label="خيارات الانضمام"><Link href="/join/specialist" className="join-option"><span className="icon-shell"><PlatformIcon name="specialist"/></span><div><span>للأفراد المهنيين</span><h2>التقدم كمختص</h2><p>بيانات مهنية، تخصصات، مؤهلات وترخيص ثم مراجعة إدارية قبل تفعيل الملف العام.</p><strong>بدء الطلب ←</strong></div></Link><Link href="/join/center" className="join-option"><span className="icon-shell"><PlatformIcon name="center"/></span><div><span>للمنشآت والجهات</span><h2>تسجيل مركز</h2><p>بيانات المركز والخدمات والموقع والترخيص وساعات العمل، ثم التوثيق قبل الظهور العام.</p><strong>بدء الطلب ←</strong></div></Link></section>
 <section className="join-process"><div className="section-mini-heading"><div><span className="eyebrow">Verification Journey</span><h2>كيف يعمل الاعتماد؟</h2></div><span>لا توجد صلاحيات مهنية تلقائية بمجرد إنشاء حساب.</span></div><ol><li><strong>1</strong><div><h3>إنشاء حساب</h3><p>الحساب يبدأ كمستخدم عادي دون صلاحيات نشر أو إدارة مهنية.</p></div></li><li><strong>2</strong><div><h3>إكمال طلب الانضمام</h3><p>تُحفظ البيانات في سجل المختص أو المركز نفسه بحالة «قيد المراجعة» دون إنشاء جداول مكررة.</p></div></li><li><strong>3</strong><div><h3>مراجعة الإدارة</h3><p>يراجع المدير الترخيص والمؤهلات والخدمات ويمكنه إعادة الطلب للتصحيح مع ملاحظة واضحة.</p></div></li><li><strong>4</strong><div><h3>التوثيق وتفعيل البوابة</h3><p>عند الاعتماد تُمنح صلاحية المختص أو مدير المركز ويصبح الملف مؤهلًا للظهور العام والتواصل والمواعيد.</p></div></li></ol></section>
 </main><SiteFooter/></>;
}
