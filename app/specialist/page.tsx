import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { saveSpecialistProfile } from './actions';

export const dynamic = 'force-dynamic';
type SearchParams = Promise<{ ok?: string; error?: string }>;

type SpecialistProfile = {
  id: string;
  slug: string;
  full_name: string;
  professional_title: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  languages: string[];
  specialties: string[];
  qualifications: unknown;
  license_number: string | null;
  years_experience: number | null;
  offers_remote: boolean;
  offers_in_person: boolean;
  show_email: boolean;
  show_phone: boolean;
  show_map: boolean;
  verification: string;
  verified_at: string | null;
  is_active: boolean;
  updated_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  unverified: 'غير موثق',
  pending: 'قيد المراجعة',
  verified: 'موثق',
  rejected: 'يحتاج تصحيحًا',
  suspended: 'موقوف',
};

function qualificationsText(value: unknown) {
  if (!Array.isArray(value)) return '';
  return value.map((item) => typeof item === 'string' ? item : JSON.stringify(item)).join('\n');
}

export default async function SpecialistDashboard({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('display_name,role,is_active').eq('id', userId).single();
  if (!profile?.is_active || profile.role !== 'specialist') redirect('/account');

  const { data } = await supabase.rpc('get_my_specialist_profile');
  const specialist: SpecialistProfile | null = Array.isArray(data) && data.length ? data[0] as SpecialistProfile : null;
  const params = await searchParams;

  return (
    <main className="dashboard-shell specialist-dashboard-shell">
      <section className="dashboard-card specialist-dashboard-card">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">بوابة المختص</span>
            <h1>{specialist?.full_name || profile.display_name || 'الملف المهني'}</h1>
            <p>إدارة البيانات المهنية والخصوصية والمحتوى والتواصل والمواعيد من حساب واحد. الملفات لا تظهر في الدليل العام قبل التوثيق.</p>
          </div>
          <div className="dashboard-actions">
            <Link className="button" href="/account">حسابي</Link>
            <Link className="button" href="/notifications">الإشعارات</Link>
            {specialist?.verification === 'verified' && <Link className="button" href={`/specialists/${specialist.slug}`}>عرض ملفي العام</Link>}
          </div>
        </div>

        {params.ok && <p className="system-message success">تم حفظ الملف. إذا تغيرت بيانات التوثيق الجوهرية فقد أُعيد الملف تلقائيًا للمراجعة.</p>}
        {params.error && <p className="system-message error">تعذر حفظ الملف. تحقق من القيم والـSlug ووسائل التواصل.</p>}

        <div className="specialist-status-grid">
          <article><span>حالة التوثيق</span><strong>{STATUS_LABELS[specialist?.verification ?? 'unverified'] ?? specialist?.verification}</strong></article>
          <article><span>الظهور العام</span><strong>{specialist?.verification === 'verified' && specialist.is_active ? 'ظاهر' : 'غير ظاهر'}</strong></article>
          <article><span>عن بُعد</span><strong>{specialist?.offers_remote ? 'متاح' : 'غير متاح'}</strong></article>
          <article><span>حضوري</span><strong>{specialist?.offers_in_person ? 'متاح' : 'غير متاح'}</strong></article>
        </div>

        {specialist?.verification === 'pending' && <div className="portal-notice"><strong>الملف قيد المراجعة.</strong><span>يمكنك تحديث البيانات، لكن أي تعديل إضافي قد يغيّر المادة التي يراجعها المدير.</span></div>}
        {specialist?.verification === 'rejected' && <div className="portal-notice warning"><strong>الملف يحتاج تصحيحًا.</strong><span>راجع المؤهلات والتخصص والترخيص ثم أعد الحفظ ليعود إلى مسار المراجعة.</span></div>}
        {specialist?.verification === 'suspended' && <div className="portal-notice danger"><strong>الملف موقوف عن الظهور.</strong><span>لا يظهر في الدليل العام حتى إعادة تفعيله من الإدارة.</span></div>}

        <form action={saveSpecialistProfile} className="specialist-form">
          <section className="portal-section">
            <div className="section-mini-heading"><h2>الهوية المهنية</h2><span>بيانات التوثيق الأساسية</span></div>
            <div className="cms-grid">
              <label>الاسم الكامل<input name="full_name" required minLength={3} maxLength={200} defaultValue={specialist?.full_name ?? profile.display_name ?? ''} /></label>
              <label>Slug العام<input name="slug" required dir="ltr" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={140} defaultValue={specialist?.slug ?? ''} placeholder="dr-example-name" /></label>
              <label>المسمى المهني<input name="professional_title" maxLength={240} defaultValue={specialist?.professional_title ?? ''} /></label>
              <label>رقم الترخيص / الاعتماد<input name="license_number" maxLength={160} defaultValue={specialist?.license_number ?? ''} /></label>
              <label>سنوات الخبرة<input name="years_experience" type="number" min="0" max="80" defaultValue={specialist?.years_experience ?? ''} /></label>
              <label>اللغات<input name="languages" defaultValue={(specialist?.languages ?? []).join(', ')} placeholder="العربية، الإنجليزية" /></label>
              <label className="cms-wide">التخصصات<input name="specialties" defaultValue={(specialist?.specialties ?? []).join(', ')} placeholder="العلاج النفسي، الإدمان، الأسرة..." /></label>
              <label className="cms-wide">المؤهلات — مؤهل واحد في كل سطر<textarea name="qualifications" rows={6} defaultValue={qualificationsText(specialist?.qualifications)} placeholder="ماجستير علم النفس السريري — الجامعة — السنة" /></label>
              <label className="cms-wide">النبذة المهنية<textarea name="bio" rows={7} maxLength={10000} defaultValue={specialist?.bio ?? ''} /></label>
            </div>
          </section>

          <section className="portal-section">
            <div className="section-mini-heading"><h2>الموقع ونمط الخدمة</h2><span>للبحث والتصفية في الدليل</span></div>
            <div className="cms-grid">
              <label>الدولة<input name="country" maxLength={120} defaultValue={specialist?.country ?? ''} /></label>
              <label>المنطقة / المحافظة<input name="region" maxLength={120} defaultValue={specialist?.region ?? ''} /></label>
              <label>المدينة<input name="city" maxLength={120} defaultValue={specialist?.city ?? ''} /></label>
              <label>Latitude<input name="latitude" type="number" step="any" min="-90" max="90" dir="ltr" defaultValue={specialist?.latitude ?? ''} /></label>
              <label>Longitude<input name="longitude" type="number" step="any" min="-180" max="180" dir="ltr" defaultValue={specialist?.longitude ?? ''} /></label>
              <label className="check-field"><input name="offers_remote" type="checkbox" defaultChecked={specialist?.offers_remote ?? false} /> أقدم خدمة عن بُعد</label>
              <label className="check-field"><input name="offers_in_person" type="checkbox" defaultChecked={specialist?.offers_in_person ?? true} /> أقدم خدمة حضورية</label>
            </div>
          </section>

          <section className="portal-section">
            <div className="section-mini-heading"><h2>التواصل والخصوصية</h2><span>الاختيار هنا يحدد ما يمكن للجمهور رؤيته</span></div>
            <div className="cms-grid">
              <label>البريد المهني<input name="email" type="email" maxLength={254} defaultValue={specialist?.email ?? ''} /></label>
              <label>الهاتف<input name="phone" maxLength={80} dir="ltr" defaultValue={specialist?.phone ?? ''} /></label>
              <label className="cms-wide">الموقع الإلكتروني<input name="website_url" type="url" maxLength={500} dir="ltr" defaultValue={specialist?.website_url ?? ''} placeholder="https://" /></label>
              <label className="check-field"><input name="show_email" type="checkbox" defaultChecked={specialist?.show_email ?? false} /> السماح بعرض البريد للعامة</label>
              <label className="check-field"><input name="show_phone" type="checkbox" defaultChecked={specialist?.show_phone ?? false} /> السماح بعرض الهاتف للعامة</label>
              <label className="check-field"><input name="show_map" type="checkbox" defaultChecked={specialist?.show_map ?? false} /> السماح بعرض الموقع على الخريطة</label>
            </div>
          </section>

          <div className="cms-actions"><button className="primary-action" type="submit">حفظ الملف المهني</button><span>الحقول الخاصة محمية في قاعدة البيانات وليست مجرد حقول مخفية بصريًا.</span></div>
        </form>

        <section className="portal-section portal-modules">
          <div className="section-mini-heading"><h2>مساحة العمل</h2><span>الوحدات التالية مرتبطة بنفس حساب المختص</span></div>
          <div className="admin-module-grid">
            <Link href="/specialist/content"><strong>مقالاتي ومحتواي</strong><span>إنشاء المسودات وتعديلها ومتابعة مسار المراجعة.</span></Link>
            <Link href="/messages"><strong>المحادثات</strong><span>استقبال الرسائل والرد عليها داخل روافد.</span></Link>
            <Link href="/appointments"><strong>المواعيد</strong><span>طلبات المواعيد والتأكيد والإلغاء والحالات.</span></Link>
            <Link href="/notifications"><strong>الإشعارات</strong><span>التحديثات والتنبيهات المرتبطة بالحساب.</span></Link>
          </div>
        </section>
      </section>
    </main>
  );
}
