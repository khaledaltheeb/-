import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = buildSeoMetadata({
  title: 'المتدربون والمتطوعون',
  description: 'دليل روافد للمتدربين والمتطوعين المعتمدين: ملفات واضحة الصفة، مجالات الاهتمام والمهارات وجهات التدريب أو التطوع، مع فصل كامل عن صفة المختص المرخص.',
  path: '/community',
  index: true,
  keywords: ['متدرب علم نفس', 'متطوع صحة نفسية', 'تدريب الصحة النفسية', 'التطوع', 'منصة روافد'],
});

type SearchParams = Promise<{ type?: string; city?: string }>;
type CommunityRow = {
  id: string;
  slug: string;
  member_type: 'trainee' | 'volunteer';
  full_name: string;
  headline: string | null;
  bio: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  training_institution: string | null;
  supervisor_name: string | null;
  organization: string | null;
  skills: string[];
  interests: string[];
};

const labels = { trainee: 'متدرب', volunteer: 'متطوع' } as const;

export default async function CommunityDirectory({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const requestedType = params.type === 'trainee' || params.type === 'volunteer' ? params.type : '';
  const city = String(params.city ?? '').trim().slice(0, 100);
  const supabase = await createClient();

  let query = supabase
    .from('community_profiles')
    .select('id,slug,member_type,full_name,headline,bio,country,region,city,training_institution,supervisor_name,organization,skills,interests')
    .eq('verification', 'verified')
    .eq('is_active', true)
    .order('full_name')
    .limit(100);
  if (requestedType) query = query.eq('member_type', requestedType);
  if (city) query = query.ilike('city', `%${city.replace(/[%_]/g, '')}%`);
  const { data, error } = await query;
  const rows = (Array.isArray(data) ? data : []) as CommunityRow[];

  return (
    <>
      <SiteHeader />
      <main className="directory-shell community-directory-shell">
        <section className="directory-hero community-hero">
          <span className="eyebrow">Community & Learning Pathways</span>
          <h1>المتدربون والمتطوعون</h1>
          <p>مساحة مستقلة للمتدربين والمتطوعين المعتمدين داخل روافد. الصفة المعروضة هنا لا تعني ترخيصًا مهنيًا ولا تُعرض كبديل عن المختصين المرخصين.</p>
          <div className="section-actions"><Link className="primary-link" href="/community/join">طلب الانضمام</Link><Link className="button" href="/specialists">دليل المختصين المرخصين</Link></div>
        </section>

        <section className="community-role-explainer" aria-label="الفرق بين الصفات">
          <article><strong>متدرب</strong><span>شخص في مسار تدريب أو ممارسة تحت إشراف أو ضمن جهة تدريبية معلنة.</span></article>
          <article><strong>متطوع</strong><span>شخص يشارك بمهارات أو وقت في أنشطة دعم أو توعية أو تنظيم، دون منحه صفة علاجية.</span></article>
          <article><strong>مختص</strong><span>يبقى في دليل مستقل ويتطلب مسار توثيق مهني وترخيص وفق البيانات المعتمدة.</span></article>
        </section>

        <form className="directory-filters" method="get">
          <label>الصفة<select name="type" defaultValue={requestedType}><option value="">الكل</option><option value="trainee">متدرب</option><option value="volunteer">متطوع</option></select></label>
          <label>المدينة<input name="city" defaultValue={city} placeholder="المدينة" maxLength={100} /></label>
          <button className="primary-action" type="submit">تصفية</button>
          {(requestedType || city) && <Link href="/community">مسح</Link>}
        </form>

        <section className="directory-results" aria-live="polite">
          <div className="directory-summary"><strong>{rows.length}</strong><span>ملف معتمد مطابق</span></div>
          {error && <div className="search-state error"><h2>تعذر تحميل الدليل</h2><p>لم يتم عرض بيانات غير مؤكدة.</p></div>}
          {!error && rows.length === 0 && <div className="search-state"><h2>لا توجد ملفات مطابقة حاليًا</h2><p>تظهر الملفات هنا فقط بعد مراجعتها واعتمادها من الإدارة.</p></div>}
          <div className="directory-grid">
            {rows.map((member) => (
              <article className="directory-card community-card" key={member.id}>
                <div className="directory-card-top"><div className="profile-placeholder" aria-hidden="true">{member.full_name.slice(0, 1)}</div><div><span className={`community-badge ${member.member_type}`}>{labels[member.member_type]}</span><h2>{member.full_name}</h2><p className="professional-title">{member.headline || [member.city, member.country].filter(Boolean).join('، ') || 'عضو في مجتمع روافد'}</p></div></div>
                {member.bio && <p className="directory-bio">{member.bio.slice(0, 220)}{member.bio.length > 220 ? '…' : ''}</p>}
                <div className="directory-meta">{(member.skills ?? []).slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}</div>
                <Link className="directory-open" href={`/community/${member.slug}`}>عرض الملف</Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
