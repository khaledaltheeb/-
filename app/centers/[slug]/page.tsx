import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;

type Center = {
  id: string; slug: string; name: string; description: string | null; logo_url: string | null; cover_url: string | null;
  website_url: string | null; country: string | null; region: string | null; city: string | null; address: string | null;
  center_type: string; services: string[]; languages: string[]; offers_remote: boolean; offers_in_person: boolean;
  public_email: string | null; public_phone: string | null; public_latitude: number | null; public_longitude: number | null;
  working_hours: unknown; parent_center_id: string | null; verified_at: string | null;
};
type Specialist = { id: string; slug: string; full_name: string; professional_title: string | null; specialties: string[] };

async function getCenter(slug: string): Promise<Center | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_public_center', { p_slug: slug });
  if (error || !Array.isArray(data) || !data[0]) return null;
  return data[0] as Center;
}

function safeWebsite(value: string | null) {
  if (!value) return null;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null; } catch { return null; }
}
function safeEmail(value: string | null) { return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null; }
function safePhone(value: string | null) { if (!value) return null; const cleaned = value.replace(/[^+0-9]/g, ''); return cleaned.length >= 7 && cleaned.length <= 18 ? cleaned : null; }
function hoursRows(value: unknown): string[] { if (!value || typeof value !== 'object' || Array.isArray(value)) return []; return Object.entries(value as Record<string, unknown>).slice(0, 14).map(([day, hours]) => `${day}: ${typeof hours === 'string' ? hours : JSON.stringify(hours)}`.slice(0, 180)); }
function schemaType(centerType: string) { if (centerType === 'clinic') return 'MedicalClinic'; if (centerType === 'hospital') return 'Hospital'; if (centerType === 'school') return 'EducationalOrganization'; if (centerType === 'association') return 'Organization'; return 'MedicalOrganization'; }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const center = await getCenter(slug);
  if (!center) return {};
  return buildSeoMetadata({
    title: center.name,
    description: center.description || `${center.name} — مركز موثق في دليل منصة روافد مع بيانات الموقع والخدمات وطرق التواصل التي يسمح المركز بعرضها للعامة.`,
    path: `/centers/${center.slug}`,
    index: true,
    image: center.cover_url || center.logo_url,
    keywords: [center.name, ...(center.services ?? []).slice(0, 8), center.city, center.country].filter(Boolean) as string[],
  });
}

export default async function CenterProfile({ params }: { params: Params }) {
  const { slug } = await params;
  const center = await getCenter(slug);
  if (!center) notFound();
  const supabase = await createClient();

  const { data: memberships } = await supabase.from('center_specialists').select('specialist_id,is_primary').eq('center_id', center.id);
  const specialistIds = (memberships ?? []).map((item) => item.specialist_id);
  let specialists: Specialist[] = [];
  if (specialistIds.length) {
    const { data } = await supabase.from('specialists').select('id,slug,full_name,professional_title,specialties').in('id', specialistIds).eq('verification', 'verified').eq('is_active', true).order('full_name');
    specialists = Array.isArray(data) ? data as Specialist[] : [];
  }

  const website = safeWebsite(center.website_url);
  const email = safeEmail(center.public_email);
  const phone = safePhone(center.public_phone);
  const location = [center.address, center.city, center.region, center.country].filter(Boolean).join('، ');
  const mapUrl = center.public_latitude !== null && center.public_longitude !== null ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${center.public_latitude},${center.public_longitude}`)}` : null;
  const hours = hoursRows(center.working_hours);
  const breadcrumbs = breadcrumbJsonLd([{ name:'الرئيسية', path:'/' }, { name:'المراكز', path:'/centers' }, { name:center.name, path:`/centers/${center.slug}` }]);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': schemaType(center.center_type), '@id': `${SITE_URL}/centers/${center.slug}#organization`,
    name: center.name, description: center.description || undefined, url: `${SITE_URL}/centers/${center.slug}`,
    image: center.logo_url || center.cover_url || undefined,
    address: location ? { '@type': 'PostalAddress', streetAddress: center.address || undefined, addressLocality: center.city || undefined, addressRegion: center.region || undefined, addressCountry: center.country || undefined } : undefined,
    telephone: phone || undefined, email: email || undefined, sameAs: website ? [website] : undefined,
    geo: center.public_latitude !== null && center.public_longitude !== null ? { '@type':'GeoCoordinates', latitude:center.public_latitude, longitude:center.public_longitude } : undefined,
    hasMap: mapUrl || undefined,
    knowsLanguage: center.languages?.length ? center.languages : undefined,
    medicalSpecialty: center.services?.length ? center.services : undefined,
  };

  return (
    <>
      <SiteHeader />
      <main className="profile-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs,jsonLd]).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/centers">المراكز</Link><span>/</span><span aria-current="page">{center.name}</span></nav>
        <section className="profile-hero center-profile-hero"><div className="profile-avatar center-profile-avatar" aria-hidden="true">{center.name.slice(0, 1)}</div><div className="profile-title-block"><span className="verified-label">مركز موثق</span><h1>{center.name}</h1>{location && <p>{location}</p>}<div className="directory-tags">{(center.services ?? []).slice(0, 8).map((service) => <span key={service}>{service}</span>)}</div></div></section>
        <div className="profile-layout">
          <article className="profile-main">
            {center.description && <section><h2>عن المركز</h2><p className="profile-bio">{center.description}</p></section>}
            <section><h2>الخدمات ونمط التقديم</h2><div className="community-facts"><div><strong>نمط الخدمة</strong><span>{[center.offers_in_person ? 'حضوري' : '',center.offers_remote ? 'عن بُعد' : ''].filter(Boolean).join('، ') || 'غير محدد'}</span></div><div><strong>اللغات</strong><span>{(center.languages ?? []).join('، ') || 'غير محددة'}</span></div></div></section>
            {specialists.length > 0 && <section><h2>الفريق المهني</h2><div className="linked-specialists">{specialists.map((specialist) => <Link href={`/specialists/${specialist.slug}`} key={specialist.id}><strong>{specialist.full_name}</strong><span>{specialist.professional_title || (specialist.specialties ?? []).slice(0, 2).join('، ')}</span></Link>)}</div></section>}
            {hours.length > 0 && <section><h2>ساعات العمل</h2><div className="hours-list">{hours.map((row) => <span key={row}>{row}</span>)}</div></section>}
          </article>
          <aside className="profile-sidebar">
            <div className="contact-card"><h2>بيانات المركز</h2><div className="contact-actions"><Link className="primary-link" href={`/login?next=${encodeURIComponent(`/centers/${center.slug}`)}`}>تواصل عبر روافد</Link>{phone && <a className="button" href={`tel:${phone}`}>اتصال</a>}{email && <a className="button" href={`mailto:${email}`}>البريد الإلكتروني</a>}{website && <a className="button" href={website} target="_blank" rel="noopener noreferrer">الموقع الإلكتروني</a>}{mapUrl && <a className="button" href={mapUrl} target="_blank" rel="noopener noreferrer">الخريطة</a>}</div></div>
            <div className="trust-card"><strong>حالة المركز</strong><span>موثق ونشط في منصة روافد{center.verified_at ? ` منذ ${new Intl.DateTimeFormat('ar',{dateStyle:'medium'}).format(new Date(center.verified_at))}` : ''}</span></div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
