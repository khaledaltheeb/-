import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const SITE = 'https://healthrenewal.org';
type Params = Promise<{ slug: string }>;

type PublicSpecialist = {
  id: string;
  slug: string;
  full_name: string;
  professional_title: string | null;
  bio: string | null;
  website_url: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  languages: string[];
  specialties: string[];
  qualifications: unknown;
  license_number: string | null;
  years_experience: number | null;
  offers_remote: boolean;
  offers_in_person: boolean;
  public_email: string | null;
  public_phone: string | null;
  public_latitude: number | null;
  public_longitude: number | null;
  verified_at: string | null;
};

type CenterRow = { id: string; slug: string; name: string; city: string | null; country: string | null };

async function getSpecialist(slug: string): Promise<PublicSpecialist | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('get_public_specialist', { p_slug: slug });
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0] as PublicSpecialist;
}

function safeWebsite(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function safeEmail(value: string | null) {
  if (!value) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

function safePhone(value: string | null) {
  if (!value) return null;
  const cleaned = value.replace(/[^+0-9]/g, '');
  return cleaned.length >= 7 && cleaned.length <= 18 ? cleaned : null;
}

function qualificationText(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).map((item) => {
    if (typeof item === 'string') return item.slice(0, 240);
    if (item && typeof item === 'object') {
      const object = item as Record<string, unknown>;
      return [object.title, object.degree, object.institution, object.year].filter((part) => typeof part === 'string' || typeof part === 'number').map(String).join(' — ').slice(0, 240);
    }
    return '';
  }).filter(Boolean);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const specialist = await getSpecialist(slug);
  if (!specialist) return {};
  const description = specialist.bio?.slice(0, 300) || `${specialist.full_name} — ملف مختص موثق في منصة روافد.`;
  return {
    title: specialist.full_name,
    description,
    alternates: { canonical: `/specialists/${specialist.slug}` },
    openGraph: { type: 'profile', url: `${SITE}/specialists/${specialist.slug}`, title: specialist.full_name, description, siteName: 'منصة روافد', locale: 'ar_AR' },
  };
}

export default async function SpecialistProfile({ params }: { params: Params }) {
  const { slug } = await params;
  const specialist = await getSpecialist(slug);
  if (!specialist) notFound();

  const supabase = await createClient();
  const { data: memberships } = await supabase.from('center_specialists').select('center_id,is_primary').eq('specialist_id', specialist.id);
  const centerIds = (memberships ?? []).map((item) => item.center_id);
  let centers: CenterRow[] = [];
  if (centerIds.length) {
    const { data } = await supabase.from('centers').select('id,slug,name,city,country').in('id', centerIds).eq('verification', 'verified').eq('is_active', true);
    centers = Array.isArray(data) ? data as CenterRow[] : [];
  }

  const website = safeWebsite(specialist.website_url);
  const email = safeEmail(specialist.public_email);
  const phone = safePhone(specialist.public_phone);
  const qualifications = qualificationText(specialist.qualifications);
  const location = [specialist.city, specialist.region, specialist.country].filter(Boolean).join('، ');
  const mapUrl = specialist.public_latitude !== null && specialist.public_longitude !== null
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${specialist.public_latitude},${specialist.public_longitude}`)}`
    : null;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: specialist.full_name,
    jobTitle: specialist.professional_title || undefined,
    description: specialist.bio || undefined,
    url: `${SITE}/specialists/${specialist.slug}`,
    address: location ? { '@type': 'PostalAddress', addressLocality: specialist.city || undefined, addressRegion: specialist.region || undefined, addressCountry: specialist.country || undefined } : undefined,
    knowsLanguage: specialist.languages,
  };

  return (
    <main className="profile-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <header className="directory-header">
        <Link className="brand" href="/"><span className="brand-mark">ر</span><span><strong>روافد</strong><small>Rawafid</small></span></Link>
        <Link className="button" href="/specialists">كل المختصين</Link>
      </header>

      <section className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">{specialist.full_name.slice(0, 1)}</div>
        <div className="profile-title-block">
          <span className="verified-label">ملف موثق</span>
          <h1>{specialist.full_name}</h1>
          {specialist.professional_title && <p>{specialist.professional_title}</p>}
          <div className="profile-quick-meta">
            {location && <span>{location}</span>}
            {specialist.years_experience !== null && <span>{specialist.years_experience} سنوات خبرة</span>}
            {specialist.offers_remote && <span>استشارات عن بُعد</span>}
            {specialist.offers_in_person && <span>خدمة حضورية</span>}
          </div>
        </div>
      </section>

      <div className="profile-layout">
        <article className="profile-main">
          {specialist.bio && <section><h2>نبذة مهنية</h2><p className="profile-bio">{specialist.bio}</p></section>}
          <section><h2>التخصصات</h2><div className="directory-tags">{(specialist.specialties ?? []).map((item) => <span key={item}>{item}</span>)}</div></section>
          {qualifications.length > 0 && <section><h2>المؤهلات</h2><ul className="qualification-list">{qualifications.map((item) => <li key={item}>{item}</li>)}</ul></section>}
          {specialist.languages?.length > 0 && <section><h2>اللغات</h2><div className="directory-tags">{specialist.languages.map((item) => <span key={item}>{item}</span>)}</div></section>}
          {centers.length > 0 && <section><h2>المراكز المرتبطة</h2><div className="linked-centers">{centers.map((center) => <Link href={`/centers/${center.slug}`} key={center.id}><strong>{center.name}</strong><span>{[center.city, center.country].filter(Boolean).join('، ')}</span></Link>)}</div></section>}
        </article>

        <aside className="profile-sidebar">
          <div className="contact-card">
            <h2>التواصل</h2>
            <p>تظهر وسائل الاتصال المباشرة فقط عندما يسمح صاحب الملف بعرضها.</p>
            <div className="contact-actions">
              <Link className="primary-link" href={`/login?next=${encodeURIComponent(`/specialists/${specialist.slug}`)}`}>مراسلة داخل روافد</Link>
              {email && <a className="button" href={`mailto:${email}`}>البريد الإلكتروني</a>}
              {phone && <a className="button" href={`tel:${phone}`}>اتصال</a>}
              {website && <a className="button" href={website} target="_blank" rel="noopener noreferrer">الموقع الإلكتروني</a>}
              {mapUrl && <a className="button" href={mapUrl} target="_blank" rel="noopener noreferrer">عرض الموقع</a>}
            </div>
          </div>
          <div className="trust-card"><strong>حالة التوثيق</strong><span>موثق في منصة روافد</span>{specialist.verified_at && <small>آخر توثيق: {new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(specialist.verified_at))}</small>}</div>
        </aside>
      </div>
    </main>
  );
}
