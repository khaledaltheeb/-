import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;

type PublicSpecialist = {
  id: string; slug: string; full_name: string; professional_title: string | null; bio: string | null; website_url: string | null;
  country: string | null; region: string | null; city: string | null; languages: string[]; specialties: string[]; qualifications: unknown;
  license_number: string | null; years_experience: number | null; offers_remote: boolean; offers_in_person: boolean;
  public_email: string | null; public_phone: string | null; public_latitude: number | null; public_longitude: number | null; verified_at: string | null;
};
type CenterRow = { id: string; slug: string; name: string; city: string | null; country: string | null };

async function getSpecialist(slug: string): Promise<PublicSpecialist | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_public_specialist', { p_slug: slug });
  if (error || !Array.isArray(data) || data.length === 0) return null;
  return data[0] as PublicSpecialist;
}
function safeWebsite(value: string | null) { if (!value) return null; try { const url = new URL(value); return ['http:','https:'].includes(url.protocol) ? url.toString() : null; } catch { return null; } }
function safeEmail(value: string | null) { return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null; }
function safePhone(value: string | null) { if (!value) return null; const cleaned = value.replace(/[^+0-9]/g,''); return cleaned.length >= 7 && cleaned.length <= 18 ? cleaned : null; }
function qualificationText(value: unknown): string[] { if (!Array.isArray(value)) return []; return value.slice(0,12).map((item) => { if (typeof item === 'string') return item.slice(0,240); if (item && typeof item === 'object') { const object = item as Record<string,unknown>; return [object.title,object.degree,object.institution,object.year].filter((part) => typeof part === 'string' || typeof part === 'number').map(String).join(' — ').slice(0,240); } return ''; }).filter(Boolean); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const specialist = await getSpecialist(slug);
  if (!specialist) return {};
  return buildSeoMetadata({
    title: `${specialist.full_name}${specialist.professional_title ? ` - ${specialist.professional_title}` : ''}`,
    description: specialist.bio || `${specialist.full_name} — ملف مختص موثق في منصة روافد، يتضمن التخصصات والمؤهلات ونمط الخدمة والموقع وبيانات التواصل التي يسمح المختص بعرضها.`,
    path: `/specialists/${specialist.slug}`, index: true, type: 'profile',
    keywords: [specialist.full_name, specialist.professional_title, ...(specialist.specialties ?? []).slice(0,8), specialist.city, specialist.country].filter(Boolean) as string[],
  });
}

export default async function SpecialistProfile({ params }: { params: Params }) {
  const { slug } = await params;
  const specialist = await getSpecialist(slug);
  if (!specialist) notFound();
  const supabase = await createClient();
  const [{ data: memberships }, { data: canContact }] = await Promise.all([
    supabase.from('center_specialists').select('center_id,is_primary').eq('specialist_id', specialist.id),
    supabase.rpc('can_contact_provider', { p_specialist_id: specialist.id, p_center_id: null }),
  ]);
  const centerIds = (memberships ?? []).map((item) => item.center_id);
  let centers: CenterRow[] = [];
  if (centerIds.length) { const { data } = await supabase.from('centers').select('id,slug,name,city,country').in('id', centerIds).eq('verification','verified').eq('is_active',true); centers = Array.isArray(data) ? data as CenterRow[] : []; }

  const website = safeWebsite(specialist.website_url);
  const email = safeEmail(specialist.public_email);
  const phone = safePhone(specialist.public_phone);
  const qualifications = qualificationText(specialist.qualifications);
  const location = [specialist.city,specialist.region,specialist.country].filter(Boolean).join('، ');
  const mapUrl = specialist.public_latitude !== null && specialist.public_longitude !== null ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${specialist.public_latitude},${specialist.public_longitude}`)}` : null;
  const breadcrumbs = breadcrumbJsonLd([{name:'الرئيسية',path:'/'},{name:'المختصون',path:'/specialists'},{name:specialist.full_name,path:`/specialists/${specialist.slug}`}]);
  const personSchema = {
    '@context':'https://schema.org','@type':'Person','@id':`${SITE_URL}/specialists/${specialist.slug}#person`,name:specialist.full_name,
    jobTitle:specialist.professional_title || undefined,description:specialist.bio || undefined,url:`${SITE_URL}/specialists/${specialist.slug}`,
    address:location ? {'@type':'PostalAddress',addressLocality:specialist.city || undefined,addressRegion:specialist.region || undefined,addressCountry:specialist.country || undefined} : undefined,
    knowsLanguage:specialist.languages?.length ? specialist.languages : undefined,knowsAbout:specialist.specialties?.length ? specialist.specialties : undefined,
    hasCredential: specialist.license_number ? {'@type':'EducationalOccupationalCredential',credentialCategory:'Professional license',identifier:specialist.license_number} : undefined,
    workLocation: centers.map((center) => ({'@type':'MedicalOrganization',name:center.name,url:`${SITE_URL}/centers/${center.slug}`})),
  };

  return (
    <>
      <SiteHeader />
      <main className="profile-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs,personSchema]).replace(/</g,'\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/specialists">المختصون</Link><span>/</span><span aria-current="page">{specialist.full_name}</span></nav>
        <section className="profile-hero"><div className="profile-avatar" aria-hidden="true">{specialist.full_name.slice(0,1)}</div><div className="profile-title-block"><span className="verified-label">ملف موثق</span><h1>{specialist.full_name}</h1>{specialist.professional_title && <p>{specialist.professional_title}</p>}<div className="profile-quick-meta">{location && <span>{location}</span>}{specialist.years_experience !== null && <span>{specialist.years_experience} سنوات خبرة</span>}{specialist.offers_remote && <span>عن بُعد</span>}{specialist.offers_in_person && <span>حضوري</span>}</div></div></section>
        <div className="profile-layout">
          <article className="profile-main">
            {specialist.bio && <section><h2>نبذة مهنية</h2><p className="profile-bio">{specialist.bio}</p></section>}
            <section><h2>التخصصات</h2><div className="directory-tags">{(specialist.specialties ?? []).map((item) => <span key={item}>{item}</span>)}</div></section>
            {qualifications.length > 0 && <section><h2>المؤهلات</h2><ul className="qualification-list">{qualifications.map((item) => <li key={item}>{item}</li>)}</ul></section>}
            {specialist.license_number && <section><h2>الترخيص المهني</h2><div className="license-card"><strong>رقم الترخيص/التسجيل</strong><span dir="ltr">{specialist.license_number}</span><small>الرقم منشور ضمن بيانات الملف الموثق. يجب التحقق من سريانه لدى الجهة التنظيمية المختصة عند الحاجة.</small></div></section>}
            {specialist.languages?.length > 0 && <section><h2>اللغات</h2><div className="directory-tags">{specialist.languages.map((item) => <span key={item}>{item}</span>)}</div></section>}
            {centers.length > 0 && <section><h2>المراكز المرتبطة</h2><div className="linked-centers">{centers.map((center) => <Link href={`/centers/${center.slug}`} key={center.id}><strong>{center.name}</strong><span>{[center.city,center.country].filter(Boolean).join('، ')}</span></Link>)}</div></section>}
          </article>
          <aside className="profile-sidebar"><div className="contact-card"><h2>التواصل</h2><p>ابدأ التواصل داخل روافد، أو استخدم وسيلة مباشرة فقط إذا سمح المختص بعرضها.</p><div className="contact-actions">{canContact===true&&<><Link className="primary-link" href={`/messages/new?specialist=${specialist.id}`}>محادثة مع المختص</Link><Link className="button" href={`/appointments/new?specialist=${specialist.id}`}>طلب موعد</Link></>}{canContact!==true&&<span className="contact-unavailable">التواصل والمواعيد داخل روافد غير مفعلة لهذا الملف بعد.</span>}{email && <a className="button" href={`mailto:${email}`}>البريد الإلكتروني</a>}{phone && <a className="button" href={`tel:${phone}`}>اتصال</a>}{website && <a className="button" href={website} target="_blank" rel="noopener noreferrer">الموقع الإلكتروني</a>}{mapUrl && <a className="button" href={mapUrl} target="_blank" rel="noopener noreferrer">عرض الموقع</a>}</div></div><div className="trust-card"><strong>حالة التوثيق</strong><span>موثق في منصة روافد</span>{specialist.verified_at && <small>آخر توثيق: {new Intl.DateTimeFormat('ar',{dateStyle:'medium'}).format(new Date(specialist.verified_at))}</small>}</div></aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
