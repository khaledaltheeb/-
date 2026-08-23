import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import DailyToolsDirectory from '@/components/daily-tools-directory';
import { deriveDailyToolDirectory } from '@/lib/daily-tools-preserved';
import { DAILY_TOOLS_HUB_ROUTE, dailyToolMetadata, getDailyToolPage } from '@/lib/daily-tools-catalog';

export const dynamic = 'force-static';
export const revalidate = false;
const route = DAILY_TOOLS_HUB_ROUTE;

export async function generateMetadata(): Promise<Metadata> {
  return dailyToolMetadata(await getDailyToolPage(route), route);
}

export default async function DailyToolsPage() {
  const page = await getDailyToolPage(route);
  if (!page) notFound();
  const items = deriveDailyToolDirectory(page);
  return <>
    <SiteHeader />
    <main className="article-shell">
      <article>
        <header className="article-hero">
          <span className="eyebrow">مكتبة أدوات عملية غير تشخيصية</span>
          <h1>{page.h1 || page.title || 'الأدوات اليومية'}</h1>
          {page.meta_description ? <p>{page.meta_description}</p> : null}
          <p><strong>{items.length.toLocaleString('ar')} أداة</strong> تعمل داخل المتصفح، مع حفظ محلي للمدخلات في الأدوات التي تدعم التسجيل، ودون إرسال إجاباتك الشخصية إلى الخادم.</p>
        </header>
        <DailyToolsDirectory items={items} />
        <div className="article-body">
          <ContentRenderer bodyJson={page.body_json} bodyText={page.body_text} recordId={page.source_path} />
        </div>
      </article>
    </main>
    <SiteFooter />
  </>;
}
