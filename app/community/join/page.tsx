import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { saveCommunityApplication } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'طلب الانضمام للمتدربين والمتطوعين',
  description: 'تقديم طلب للانضمام إلى قسم المتدربين والمتطوعين في منصة روافد. جميع الطلبات تخضع للمراجعة قبل الظهور العام.',
  robots: { index: false, follow: false, noarchive: true },
};

type SearchParams = Promise<{ ok?: string; error?: string }>;
type Existing = {
  slug: string; member_type: string; full_name: string; headline: string | null; bio: string | null;
  country: string | null; region: string | null; city: string | null; training_institution: string | null;
  supervisor_name: string | null; organization: string | null; skills: string[]; interests: string[];
  availability: string | null; verification: string; is_active: boolean;
};

const errors: Record<string, string> = {
  invalid_type: 'اختر صفة صحيحة: متدرب أو متطوع.', required: 'الاسم والرابط المختصر حقول مطلوبة.',
  save_failed: 'تعذر حفظ الطلب. تحقق من البيانات والرابط المختصر ثم أعد المحاولة.',
};
const verificationLabels: Record<string, string> = {
  verified: 'موثق', pending: 'قيد المراجعة', rejected: 'يحتاج تصحيحًا', unverified: 'غير مكتمل', suspended: 'موقوف',
};

export default async function CommunityJoinPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login?next=/community/join');
  const { data } = await supabase.from('community_profiles').select('slug,member_type,full_name,headline,bio,country,region,city,training_institution,supervisor_name,organization,skills,interests,availability,verification,is_active').eq('user_id', userId).maybeSingle();
  const existing = data as Existing | null;

  return (
    <>
      <SiteHeader />
      <main className="dashboard-shell community-join-shell">
        <section className="dashboard-card community-join-card">
          <div className="admin-heading"><div><span className="eyebrow">طلب انضمام مجتمعي</span><h1>طلب الانضمام كمتدرب أو متطوع</h1><p>يراجع فريق التوثيق البيانات قبل الظهور العام. لا يمنح هذا الطلب صفة مختص، ولا يُعرض الملف في دليل المختصين.</p></div><Link className="button" href="/community">الدليل العام</Link></div>
          {params.ok === 'submitted' && <div className="system-message success" role="status">تم حفظ الطلب وإرساله للمراجعة.</div>}
          {params.error && <div className="system-message error" role="alert">{errors[params.error] || 'تعذر تنفيذ الطلب.'}</div>}
          {existing && <div className={`portal-notice ${existing.verification === 'verified' ? '' : 'warning'}`}><strong>حالة الملف: {verificationLabels[existing.verification] ?? 'قيد المراجعة'}</strong><span>{existing.verification === 'verified' ? 'الملف معتمد للظهور العام. التعديلات الجوهرية قد تعيده للمراجعة.' : 'الملف غير ظاهر للعامة حتى إكمال المراجعة والاعتماد.'}</span></div>}

          <form className="admin-form specialist-form" action={saveCommunityApplication}>
            <section className="portal-section"><h2>الهوية والصفة</h2><div className="admin-form-grid">
              <label>الصفة<select name="member_type" defaultValue={existing?.member_type || 'trainee'} required><option value="trainee">متدرب</option><option value="volunteer">متطوع</option></select></label>
              <label>الاسم الكامل<input name="full_name" defaultValue={existing?.full_name || ''} required maxLength={200} /></label>
              <label>الرابط المختصر بالإنجليزية<input name="slug" defaultValue={existing?.slug || ''} required maxLength={140} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" placeholder="ahmad-example" /></label>
              <label>وصف مختصر<input name="headline" defaultValue={existing?.headline || ''} maxLength={220} /></label>
              <label className="wide-field">نبذة<textarea name="bio" defaultValue={existing?.bio || ''} maxLength={3000} rows={6} /></label>
            </div></section>
            <section className="portal-section"><h2>التدريب أو التطوع والإشراف</h2><div className="admin-form-grid">
              <label>جهة التدريب<input name="training_institution" defaultValue={existing?.training_institution || ''} maxLength={240} /></label>
              <label>اسم المشرف<input name="supervisor_name" defaultValue={existing?.supervisor_name || ''} maxLength={200} /></label>
              <label>الجهة/المبادرة<input name="organization" defaultValue={existing?.organization || ''} maxLength={240} /></label>
              <label>التوفر<input name="availability" defaultValue={existing?.availability || ''} maxLength={300} placeholder="مثال: 4 ساعات أسبوعيًا" /></label>
            </div></section>
            <section className="portal-section"><h2>الموقع والمهارات</h2><div className="admin-form-grid">
              <label>الدولة<input name="country" defaultValue={existing?.country || ''} maxLength={120} /></label>
              <label>المنطقة<input name="region" defaultValue={existing?.region || ''} maxLength={120} /></label>
              <label>المدينة<input name="city" defaultValue={existing?.city || ''} maxLength={120} /></label>
              <label className="wide-field">المهارات<input name="skills" defaultValue={(existing?.skills || []).join('، ')} maxLength={1200} placeholder="كتابة، تنظيم، بحث..." /></label>
              <label className="wide-field">مجالات الاهتمام<input name="interests" defaultValue={(existing?.interests || []).join('، ')} maxLength={1200} placeholder="الصحة النفسية للطفل، الدمج..." /></label>
            </div></section>
            <button className="primary-action" type="submit">حفظ وإرسال للمراجعة</button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
