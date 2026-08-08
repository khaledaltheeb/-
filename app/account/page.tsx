import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateMyProfile } from './actions';

export const dynamic = 'force-dynamic';
type SearchParams = Promise<{ ok?: string; error?: string }>;
const ROLE_LABELS: Record<string, string> = { owner: 'المالك', admin: 'مدير', editor: 'محرر', scientific_reviewer: 'مراجع علمي', seo_manager: 'مدير SEO', specialist: 'مختص', center_manager: 'مدير مركز', user: 'مستخدم' };
const STATUS_LABELS:Record<string,string>={pending:'قيد المراجعة',rejected:'يحتاج تصحيحًا',unverified:'غير مكتمل',verified:'موثق',suspended:'موقوف'};
type ApplicationStatus={verification:string;verification_note:string|null;updated_at:string};

export default async function AccountPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient(); const { data: claimsData } = await supabase.auth.getClaims(); const userId = claimsData?.claims?.sub; if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('display_name,phone,locale,role,is_active,created_at,updated_at').eq('id', userId).single(); if (!profile) redirect('/login');
  let specialistApplication:ApplicationStatus|null=null,centerApplication:ApplicationStatus|null=null;
  if(profile.role==='user'){
    const [{data:specialist},{data:center}]=await Promise.all([
      supabase.from('specialists').select('verification,verification_note,updated_at').eq('user_id',userId).maybeSingle(),
      supabase.from('centers').select('verification,verification_note,updated_at').eq('manager_user_id',userId).is('parent_center_id',null).maybeSingle(),
    ]);
    specialistApplication=specialist as ApplicationStatus|null;centerApplication=center as ApplicationStatus|null;
  }
  const params = await searchParams;

  return <main className="dashboard-shell account-shell"><section className="dashboard-card account-card">
    <div className="admin-heading"><div><span className="eyebrow">حسابي · لوحة المستخدم</span><h1>{profile.display_name || 'حساب منصة روافد'}</h1><p>إدارة البيانات الأساسية والوصول إلى الرسائل والمواعيد والإشعارات والطلبات المهنية المرتبطة بالحساب.</p></div><div className="dashboard-actions"><Link className="button" href="/">عرض الموقع</Link><form action="/auth/signout" method="post"><button className="button" type="submit">تسجيل الخروج</button></form></div></div>
    {params.ok && <p className="system-message success">تم حفظ بيانات الحساب.</p>}{params.error && <p className="system-message error">تعذر حفظ البيانات. لم يتم تغيير الصلاحيات.</p>}
    <div className="account-overview"><article><span>الدور</span><strong>{ROLE_LABELS[profile.role] ?? profile.role}</strong></article><article><span>الحالة</span><strong>{profile.is_active ? 'نشط' : 'غير نشط'}</strong></article><article><span>اللغة</span><strong>{profile.locale === 'en' ? 'English' : 'العربية'}</strong></article><article><span>معرّف الحساب</span><strong dir="ltr" className="account-id">{userId}</strong></article></div>

    {profile.role==='user'&&<section className="account-section"><div className="section-mini-heading"><h2>الانضمام المهني</h2><span>طلب واحد مهني لكل حساب في المرحلة الحالية</span></div>{(specialistApplication||centerApplication)?<div className="account-application-status">{specialistApplication&&<article><span>طلب مختص</span><strong>{STATUS_LABELS[specialistApplication.verification]??specialistApplication.verification}</strong>{specialistApplication.verification_note&&<p>{specialistApplication.verification_note}</p>}<div className="join-inline-actions"><Link href="/join/specialist">فتح الطلب</Link></div></article>}{centerApplication&&<article><span>طلب مركز</span><strong>{STATUS_LABELS[centerApplication.verification]??centerApplication.verification}</strong>{centerApplication.verification_note&&<p>{centerApplication.verification_note}</p>}<div className="join-inline-actions"><Link href="/join/center">فتح الطلب</Link></div></article>}</div>:<div className="account-links"><Link href="/join/specialist"><strong>التقدم كمختص</strong><span>إرسال المؤهلات والتخصص والترخيص إلى مسار التوثيق.</span></Link><Link href="/join/center"><strong>تسجيل مركز</strong><span>إرسال بيانات المنشأة والخدمات والموقع والترخيص للمراجعة.</span></Link></div>}</section>}

    <section className="account-section"><div className="section-mini-heading"><h2>الملف الأساسي</h2><span>حقول آمنة للتحديث الذاتي</span></div><form action={updateMyProfile} className="account-form"><label>الاسم المعروض<input name="display_name" maxLength={160} defaultValue={profile.display_name ?? ''} /></label><label>الهاتف<input name="phone" maxLength={80} dir="ltr" defaultValue={profile.phone ?? ''} /></label><label>لغة الواجهة<select name="locale" defaultValue={profile.locale ?? 'ar'}><option value="ar">العربية</option><option value="en">English</option></select></label><button className="primary-action" type="submit">حفظ الإعدادات</button></form></section>

    <section className="account-section"><div className="section-mini-heading"><h2>مساحات العمل والخدمات</h2><span>تظهر حسب صلاحية الحساب</span></div><div className="account-links">
      {(profile.role === 'owner' || profile.role === 'admin') && <Link href="/admin"><strong>لوحة الإدارة</strong><span>المحتوى، القطاعات، المختصون، المراكز والصلاحيات.</span></Link>}
      {profile.role === 'specialist' && <Link href="/specialist"><strong>بوابة المختص</strong><span>الملف المهني، التوثيق، المحتوى، الرسائل والمواعيد.</span></Link>}
      {profile.role === 'center_manager' && <Link href="/center"><strong>بوابة المركز</strong><span>بيانات المركز والفروع والخدمات والتواصل والظهور العام.</span></Link>}
      <Link href="/messages"><strong>الرسائل</strong><span>المحادثات الخاصة داخل منصة روافد.</span></Link><Link href="/appointments"><strong>المواعيد</strong><span>طلبات المواعيد وحالاتها المرتبطة بحسابك.</span></Link><Link href="/notifications"><strong>الإشعارات</strong><span>تنبيهات الحساب والمراجعات والتواصل.</span></Link><Link href="/forgot-password"><strong>أمان الحساب</strong><span>طلب رابط آمن لإعادة تعيين كلمة المرور عند الحاجة.</span></Link><Link href="/search"><strong>البحث</strong><span>البحث في المحتوى والقطاعات والمختصين والمراكز.</span></Link>
    </div></section>
  </section></main>;
}
