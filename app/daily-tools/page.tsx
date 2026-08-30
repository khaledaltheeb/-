import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
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
    <main className="article-shell daily-tools-hub">
      <article>
        <header className="article-hero daily-tools-hero">
          <span className="eyebrow">مكتبة أدوات عملية غير تشخيصية</span>
          <h1>{page.h1 || page.title || 'الأدوات اليومية'}</h1>
          {page.meta_description ? <p>{page.meta_description}</p> : null}
          <div className="daily-tools-hero-stats" aria-label="مزايا مكتبة الأدوات">
            <span><strong>{items.length.toLocaleString('ar')}</strong> أداة</span>
            <span><strong>محلي</strong> قدر الإمكان</span>
            <span><strong>بدون تسجيل</strong> للاستخدام الأساسي</span>
          </div>
        </header>
        <DailyToolsDirectory items={items} />
      </article>
    </main>
    <SiteFooter />
  </>;
}
