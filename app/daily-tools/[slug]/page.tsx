import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import DailyToolResources from '@/components/daily-tool-resources';
import DailyToolWorkspace from '@/components/daily-tool-workspace';
import SleepLogLocal from '@/components/sleep-log-local';
import { deriveDailyToolSpec } from '@/lib/daily-tools-preserved';
import { dailyToolMetadata, getDailyToolPage } from '@/lib/daily-tools-catalog';

// Dynamic rendering is intentional on Cloudflare. The tool corpus is still immutable,
// repository-backed and served through the ASSETS binding, but dynamic [slug] SSG output
// was returning edge 500s for valid generated pages. SSR avoids that OpenNext cache-path
// failure without changing, hiding or redirecting any public Daily Tools URL.
export const dynamic = 'force-dynamic';
export const revalidate = 3600;
type Params = Promise<{ slug: string }>;
const routeFor = (slug: string) => `/daily-tools/${slug}/`;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const route = routeFor(slug);
  return dailyToolMetadata(await getDailyToolPage(route), route);
}

export default async function DailyToolPage({ params }: { params: Params }) {
  const { slug } = await params;
  const route = routeFor(slug);
  const page = await getDailyToolPage(route);
  if (!page) notFound();
  const title = page.h1 || page.title || slug;
  const spec = deriveDailyToolSpec(page);
  const interactive = slug === 'sleep-wind-down-plan'
    ? <SleepLogLocal />
    : spec
      ? <DailyToolWorkspace slug={slug} title={title} spec={spec} />
      : null;
  if (!interactive) notFound();

  return <>
    <SiteHeader />
    <main className="article-shell">
      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link href="/">الرئيسية</Link><span>/</span>
        <Link href="/daily-tools/">الأدوات اليومية</Link><span>/</span>
        <span aria-current="page">{title}</span>
      </nav>
      <article>
        <header className="article-hero">
          <span className="eyebrow">أداة يومية محلية غير تشخيصية</span>
          <h1>{title}</h1>
          {page.meta_description ? <p>{page.meta_description}</p> : null}
          <p>تعمل الأداة داخل متصفحك. لا تُرسل المدخلات الشخصية إلى خادم روافد، ويمكنك مسح البيانات المحلية من الأداة متى شئت.</p>
        </header>
        {interactive}
        <div className="article-body">
          <ContentRenderer bodyJson={page.body_json} bodyText={page.body_text} recordId={page.source_path} />
        </div>
        <DailyToolResources page={page} route={route} />
      </article>
    </main>
    <SiteFooter />
  </>;
}
