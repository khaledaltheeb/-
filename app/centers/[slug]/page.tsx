import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const SITE = 'https://healthrenewal.org';
type Params = Promise<{ slug: string }>;

type Center = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  working_hours: unknown;
};

type Specialist = { id: string; slug: string; full_name: string; professional_title: string | null; specialties: string[] };

async function getCenter(slug: string): Promise<Center | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('centers')
    .select('id,slug,name,description,logo_url,cover_url,email,phone,website_url,country,region,city,address,latitude,longitude,working_hours')
    .eq('slug', slug)
    .eq('verification', 'verified')
    .eq('is_active', true)
    .maybeSingle();
  return data as Center | null;
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
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

function safePhone(value: string | null) {
  if (!value) return null;
  const cleaned = value.replace(/[^+0-9]/g, '');
  return cleaned.length >= 7 && cleaned.length <= 18 ? cleaned : null;
}

function hoursRows(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>).slice(0, 14).map(([day, hours]) => `${day}: ${typeof hours === 'string' ? hours : JSON.stringify(hours)}`.slice(0, 180));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const center = await getCenter(slug);
  if (!center) return {};
  const description = center.description?.slice(0, 300) || `${center.name} — مركز موثق في منصة روافد.`;
  return {
    title: center.name,
    description,
    alternates: { canonical: `/centers/${center.slug}` },
    openGraph: { type: 'website', url: `${SITE}/centers/${center.slug}`, title: center.name, description, siteName: 'منصة روافد', locale: 'ar_AR' },
  };
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
    const { data } = await supabase
      .from('specialists')
      .select('id,slug,full_name,professional_title,specialties')
      .in('id', specialistIds)
      .eq('verification', 'verified')
      .eq('is_active', true)
      .order('full_name');
    specialists = Array.isArray(data) ? data as Specialist[] : [];
  }

  const website = safeWebsite(center.website_url);
  const email = safeEmail(center.email);
  const phone = safePhone(center.phone);
  const location = [center.address, center.city, center.region, center.country].filter(Boolean).join('، ');
  const mapUrl = center.latitude !== null && center.longitude !== null
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${center.latitude},${center.longitude}`)}`
    : null;
  const hours = hoursRows(center.working_hours);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: center.name,
    description: center.description || undefined,
    url: `${SITE}/centers/${center.slug}`,
    address: location ? { '@type': 'PostalAddress', streetAddress: center.address || undefined, addressLocality: center.city || undefined, addressRegion: center.region || undefined, addressCountry: center.country || undefined } : undefined,
    telephone: phone || undefined,
    email: email || undefined,
  };

  return (
    <main className="profile-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <header className="directory-header">
        <Link className="brand" href="/"><span className="brand-mark">ر</span><span><strong>روافد</strong><small>Rawafid</small></span></Link>
        <Link className="button" href="/centers">كل المراكز</Link>
      </header>

      <section className="profile-hero center-profile-hero">
        <div className="profile-avatar center-profile-avatar" aria-hidden="true">{center.name.slice(0, 1)}</div>
        <div className="profile-title-block"><span className="verified-label">مركز موثق</span><h1>{center.name}</h1>{location && <p>{location}</p>}</div>
      </section>

      <div className="profile-layout">
        <article className="profile-main">
          {center.description && <section><h2>عن المركز</h2><p className="profile-bio">{center.description}</p></section>}
          {specialists.length > 0 && <section><h2>الفريق المهني</h2><div className="linked-specialists">{specialists.map((specialist) => <Link href={`/specialists/${specialist.slug}`} key={specialist.id}><strong>{specialist.full_name}</strong><span>{specialist.professional_title || (specialist.specialties ?? []).slice(0, 2).join('، ')}</span></Link>)}</div></section>}
          {hours.length > 0 && <section><h2>ساعات العمل</h2><div className="hours-list">{hours.map((row) => <span key={row}>{row}</span>)}</div></section>}
        </article>

        <aside className="profile-sidebar">
          <div className="contact-card"><h2>بيانات المركز</h2><div className="contact-actions">
            <Link className="primary-link" href={`/login?next=${encodeURIComponent(`/centers/${center.slug}`)}`}>تواصل عبر روافد</Link>
            {phone && <a className="button" href={`tel:${phone}`}>اتصال</a>}
            {email && <a className="button" href={`mailto:${email}`}>البريد الإلكتروني</a>}
            {website && <a className="button" href={website} target="_blank" rel="noopener noreferrer">الموقع الإلكتروني</a>}
            {mapUrl && <a className="button" href={mapUrl} target="_blank" rel="noopener noreferrer">الخريطة</a>}
          </div></div>
          <div className="trust-card"><strong>حالة المركز</strong><span>موثق ونشط في منصة روافد</span></div>
        </aside>
      </div>
    </main>
  );
}
