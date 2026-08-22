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
 return <><SiteHeader/><main className="join-shell"><nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">الانضمام المهني</span></nav><section className="join-hero"><div><span className="eyebrow">الانضمام والتوثيق المهني</span><h1>الانضمام المهني إلى <em>منصة روافد</em></h1><p>مسار واضح من تقديم البيانات إلى المراجعة ثم التوثيق. لا يظهر أي مختص أو مركز في الدليل العام، ولا تُفتح الصلاحيات المهنية، قبل اكتمال الاعتماد.</p><nav className="join-local-nav" aria-label="روابط الانضمام والثقة"><Link href="/specialists">دليل المختصين</Link><Link href="/centers">دليل المراكز</Link><Link href="/medical-review-policy">سياسة المراجعة</Link><Link href="/privacy">الخصوصية</Link></nav></div>{workspace?<Link className="primary-link" href={workspace}>فتح مساحة العمل</Link>:uid?<Link className="button" href="/account">حسابي</Link>:<Link className="primary-link" href="/login?next=%2Fjoin">تسجيل الدخول أو إنشاء حساب</Link>}</section>
 <section className="join-options" aria-label="خيارات الانضمام"><Link href="/join/specialist" className="join-option"><span className="icon-shell"><PlatformIcon name="specialist"/></span><div><span>للأفراد المهنيين</span><h2>التقدم كمختص</h2><p>بيانات مهنية، تخصصات، مؤهلات وترخيص ثم مراجعة إدارية قبل تفعيل الملف العام.</p><strong>بدء طلب المختص ←</strong></div></Link><Link href="/join/center" className="join-option"><span className="icon-shell"><PlatformIcon name="center"/></span><div><span>للمنشآت والجهات</span><h2>تسجيل مركز</h2><p>بيانات المركز والخدمات والموقع والترخيص وساعات العمل، ثم التوثيق قبل الظهور العام.</p><strong>بدء طلب المركز ←</strong></div></Link></section>
 <section className="join-process"><div className="section-mini-heading"><div><span className="eyebrow">رحلة التوثيق</span><h2>كيف يعمل الاعتماد؟</h2></div><span>لا توجد صلاحيات مهنية تلقائية بمجرد إنشاء حساب.</span></div><ol><li><strong>1</strong><div><h3>إنشاء حساب</h3><p>الحساب يبدأ كمستخدم عادي دون صلاحيات نشر أو إدارة مهنية.</p></div></li><li><strong>2</strong><div><h3>إكمال طلب الانضمام</h3><p>تُحفظ البيانات بحالة «قيد المراجعة» حتى يتم فحصها وربطها بصاحب الحساب.</p></div></li><li><strong>3</strong><div><h3>مراجعة الإدارة</h3><p>تُراجع بيانات الترخيص والمؤهلات والخدمات، ويمكن إعادة الطلب للتصحيح مع ملاحظة واضحة.</p></div></li><li><strong>4</strong><div><h3>التوثيق وتفعيل البوابة</h3><p>عند الاعتماد تُمنح الصلاحية المهنية المناسبة ويصبح الملف مؤهلًا للظهور العام والتواصل والمواعيد.</p></div></li></ol></section>
 <section className="join-trust-strip" aria-label="مبادئ التوثيق"><div><strong>المستندات خاصة</strong><span>وثائق التحقق لا تُعرض للعامة.</span></div><div><strong>الظهور بعد الاعتماد</strong><span>لا يدخل الملف الدليل العام قبل التوثيق.</span></div><div><strong>قرار قابل للمتابعة</strong><span>تظهر حالة الطلب وملاحظات المراجعة في الحساب.</span></div></section>
 </main><SiteFooter/></>;
}
