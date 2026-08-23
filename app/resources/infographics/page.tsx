import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { infographics, resourceSafetyNote } from '@/lib/practical-resources';
import { buildSeoMetadata } from '@/lib/seo';
import '../practical-resources.css';

export const metadata = buildSeoMetadata({
  title: 'إنفوجرافيك الصحة النفسية',
  description: 'مواد تثقيفية عربية عالية التباين وقابلة للطباعة حول حدود التشخيص ودعم السلوك وفحص موثوقية المحتوى النفسي بصياغة قابلة للقراءة.',
  path: '/resources/infographics',
  index: true,
  follow: true,
  keywords: ['إنفوجرافيك الصحة النفسية', 'دعم السلوك', 'التثقيف النفسي', 'محتوى نفسي موثوق', 'روافد'],
});

export default function InfographicsPage() {
  return <><SiteHeader/><main className="resource-page"><section className="resource-hero"><div className="resource-shell"><span className="resource-eyebrow">مواد بصرية نصية قابلة للوصول</span><h1>إنفوجرافيك الصحة النفسية</h1><p>مواد عالية التباين تعمل على الهاتف والطباعة وتعرض الفكرة كنص قابل للقراءة بقارئ الشاشة بدل حبس المعلومة داخل صورة فقط.</p></div></section><section className="resource-shell resource-section"><div className="resource-grid">{infographics.map((item)=><Link className="resource-card" href={`/resources/infographics/${item.slug}`} key={item.slug}><h2>{item.title}</h2><p>{item.summary}</p><span className="resource-link">فتح المادة</span></Link>)}</div><div className="resource-safety">{resourceSafetyNote}</div></section></main><SiteFooter/></>;
}
