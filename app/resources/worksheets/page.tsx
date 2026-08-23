import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { worksheets, resourceSafetyNote } from '@/lib/practical-resources';
import { buildSeoMetadata } from '@/lib/seo';
import '../practical-resources.css';

export const metadata = buildSeoMetadata({
  title: 'أوراق عمل الصحة النفسية والدعم',
  description: 'أوراق عمل عربية قابلة للطباعة لتنظيم الملاحظة والأسئلة والدعم الأسري والصفي والدراسي ومراجعة المحتوى دون درجات أو تشخيص ذاتي.',
  path: '/resources/worksheets',
  index: true,
  follow: true,
  keywords: ['أوراق عمل الصحة النفسية', 'دعم الأسرة', 'دعم صفي', 'نماذج قابلة للطباعة', 'روافد'],
});

export default function WorksheetsPage() {
  return <><SiteHeader/><main className="resource-page"><section className="resource-hero"><div className="resource-shell"><span className="resource-eyebrow">نماذج عملية قابلة للطباعة</span><h1>أوراق عمل الصحة النفسية والدعم</h1><p>نماذج عملية تعمل على الهاتف والطباعة وتساعد على تنظيم الملاحظة والأسئلة والدعم من دون حفظ تلقائي للإجابات أو تحويلها إلى تشخيص.</p></div></section><section className="resource-shell resource-section"><div className="resource-grid">{worksheets.map((item)=><Link className="resource-card" href={`/resources/worksheets/${item.slug}`} key={item.slug}><span className="resource-eyebrow">{item.audience}</span><h2>{item.title}</h2><p>{item.purpose}</p><span className="resource-link">فتح الورقة</span></Link>)}</div><div className="resource-safety">{resourceSafetyNote}</div></section></main><SiteFooter/></>;
}
