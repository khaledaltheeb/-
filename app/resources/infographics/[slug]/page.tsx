import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PrintResourceButton from '@/components/print-resource-button';
import { findInfographic, infographics, resourceSafetyNote } from '@/lib/practical-resources';
import { buildSeoMetadata } from '@/lib/seo';
import '../../practical-resources.css';

type Params = Promise<{ slug: string }>;
export const dynamicParams = false;
export function generateStaticParams() { return infographics.map((item) => ({ slug: item.slug })); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const item = findInfographic(slug);
  if (!item) return {};
  return buildSeoMetadata({
    title: item.title,
    description: item.summary,
    path: `/resources/infographics/${slug}`,
    index: true,
    follow: true,
    type: 'article',
    keywords: [item.title, 'إنفوجرافيك الصحة النفسية', 'التثقيف النفسي', 'روافد'],
  });
}

export default async function InfographicPage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = findInfographic(slug);
  if (!item) notFound();
  return <><SiteHeader/><main className="resource-page"><section className="resource-hero"><div className="resource-shell"><span className="resource-eyebrow">إنفوجرافيك نصي قابل للطباعة</span><h1>{item.title}</h1><p>{item.summary}</p><PrintResourceButton/></div></section><section className="resource-shell resource-section"><article className="resource-infographic"><ol>{item.items.map((text)=><li key={text}>{text}</li>)}</ol><div className="resource-safety">{resourceSafetyNote}</div></article></section></main><SiteFooter/></>;
}
