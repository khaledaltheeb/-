import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;

type CommunityProfile = {
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
  availability: string | null;
};

const labels = { trainee: 'متدرب', volunteer: 'متطوع' } as const;

async function getProfile(slug: string): Promise<CommunityProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('community_profiles')
    .select('slug,member_type,full_name,headline,bio,country,region,city,training_institution,supervisor_name,organization,skills,interests,availability')
    .eq('slug', slug)
    .eq('verification', 'verified')
    .eq('is_active', true)
    .maybeSingle();
  return data as CommunityProfile | null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) return {};
  return buildSeoMetadata({
    title: `${profile.full_name} - ${labels[profile.member_type]}`,
    description: profile.bio || `${profile.full_name} — ${labels[profile.member_type]} معتمد للظهور في مجتمع منصة روافد، مع توضيح جهة التدريب أو التطوع ومجالات الاهتمام دون صفة علاجية.` ,
    path: `/community/${profile.slug}`,
    index: true,
    type: 'profile',
    keywords: [profile.full_name, labels[profile.member_type], ...(profile.skills ?? []).slice(0, 5)],
  });
}

export default async function CommunityProfilePage({ params }: { params: Params }) {
  const { slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) notFound();
  const location = [profile.city, profile.region, profile.country].filter(Boolean).join('، ');
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'المتدربون والمتطوعون', path: '/community' },
    { name: profile.full_name, path: `/community/${profile.slug}` },
  ]);
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.full_name,
    description: profile.bio || undefined,
    url: `${SITE_URL}/community/${profile.slug}`,
    homeLocation: location || undefined,
    affiliation: profile.organization ? { '@type': 'Organization', name: profile.organization } : undefined,
    knowsAbout: [...(profile.skills ?? []), ...(profile.interests ?? [])].slice(0, 20),
  };

  return (
    <>
      <SiteHeader />
      <main className="profile-shell community-profile-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, personSchema]).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/community">المتدربون والمتطوعون</Link><span>/</span><span aria-current="page">{profile.full_name}</span></nav>
        <section className="profile-hero community-profile-hero">
          <div className="profile-avatar" aria-hidden="true">{profile.full_name.slice(0, 1)}</div>
          <div className="profile-title-block"><span className={`community-badge ${profile.member_type}`}>{labels[profile.member_type]}</span><h1>{profile.full_name}</h1>{profile.headline && <p>{profile.headline}</p>}{location && <span>{location}</span>}</div>
        </section>
        <div className="profile-layout">
          <article className="profile-main">
            {profile.bio && <section><h2>نبذة</h2><p className="profile-bio">{profile.bio}</p></section>}
            <section><h2>الصفة والإشراف</h2><div className="community-facts">
              <div><strong>الصفة</strong><span>{labels[profile.member_type]}</span></div>
              {profile.training_institution && <div><strong>جهة التدريب</strong><span>{profile.training_institution}</span></div>}
              {profile.supervisor_name && <div><strong>المشرف</strong><span>{profile.supervisor_name}</span></div>}
              {profile.organization && <div><strong>الجهة/المبادرة</strong><span>{profile.organization}</span></div>}
              {profile.availability && <div><strong>التوفر</strong><span>{profile.availability}</span></div>}
            </div></section>
            {(profile.skills?.length ?? 0) > 0 && <section><h2>المهارات</h2><div className="tag-list">{profile.skills.map((item) => <span key={item}>{item}</span>)}</div></section>}
            {(profile.interests?.length ?? 0) > 0 && <section><h2>مجالات الاهتمام</h2><div className="tag-list">{profile.interests.map((item) => <span key={item}>{item}</span>)}</div></section>}
          </article>
          <aside className="profile-sidebar">
            <div className="trust-card"><strong>حالة الملف</strong><span>تمت مراجعة واعتماد الملف للظهور في قسم المجتمع.</span></div>
            <div className="portal-notice warning"><strong>تنبيه مهم</strong><span>هذه الصفحة لا تمنح صاحبها صفة مختص مرخص ولا تعني أهليته للتشخيص أو العلاج. المختصون المرخصون يظهرون في دليل منفصل.</span></div>
            <Link className="button" href="/community">العودة إلى الدليل</Link>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
