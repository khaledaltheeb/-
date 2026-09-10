import Link from 'next/link';
import {notFound} from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import {historicalCognitiveTestMap} from '@/lib/historical-cognitive-tests';
import {getCognitiveTool} from '@/lib/cognitive-lab/catalog';
import {getLegacyPreservedPage} from '@/lib/legacy-preserved-page';
import {buildSeoMetadata} from '@/lib/seo';

export const dynamic='force-dynamic';

export const metadata=buildSeoMetadata({
  title:'الاختبارات المعرفية — المسارات التاريخية المحفوظة',
  description:'بوابة توافق تحفظ المسارات التاريخية لثماني مهام معرفية وتربط كل مسار بالتمثيل الحالي داخل Cognitive Lab دون تشخيص أو درجة ذكاء.',
  path:'/cognitive-lab',
  index:true,
  follow:true,
});

export default async function CognitiveTestsLanding(){
  const page=await getLegacyPreservedPage('/cognitive-tests/');
  if(!page)notFound();
  const items=Object.entries(historicalCognitiveTestMap)
    .map(([legacy,current])=>({legacy,current,tool:getCognitiveTool(current)}))
    .filter(item=>item.tool);
  return <>
    <SiteHeader/>
    <main className="article-shell">
      <article>
        <header className="article-hero">
          <span className="eyebrow">مسارات تاريخية محفوظة · المرجع الحالي Cognitive Lab</span>
          <h1>ثماني مهام معرفية قديمة محفوظة دون إنشاء مكتبة موازية</h1>
          <p>كل رابط تاريخي ما زال يعمل ويشغّل المهمة الفعلية نفسها، لكن الصفحة المرجعية والفهرسية الحالية موجودة داخل Cognitive Lab. لا نحول الدقة أو الزمن إلى معدل ذكاء أو تشخيص أو معيار سكاني غير موثق.</p>
          <p><Link href="/cognitive-lab">فتح Cognitive Lab الكامل ←</Link></p>
        </header>
        <section className="section" aria-labelledby="historical-cognitive-title">
          <div className="section-heading">
            <h2 id="historical-cognitive-title">المسارات الثمانية المحفوظة</h2>
            <p>المسار القديم يبقى متاحًا للتوافق، بينما يشير canonical إلى النسخة الحالية نفسها في Cognitive Lab لتجنب ازدواج المحتوى.</p>
          </div>
          <div className="related-content-grid">
            {items.map(({legacy,current,tool})=><article key={legacy}>
              <h3><Link href={`/cognitive-tests/${legacy}/`}>{tool!.title}</Link></h3>
              <p>{tool!.summary}</p>
              <p><Link href={`/cognitive-tests/${legacy}/`}>فتح المسار التاريخي ←</Link></p>
              <p><Link href={`/cognitive-lab/${current}`}>فتح الصفحة الحالية ←</Link></p>
            </article>)}
          </div>
        </section>
        <div className="article-body"><ContentRenderer bodyJson={page.body_json} bodyText={page.body_text} recordId={page.source_path}/></div>
      </article>
    </main>
    <SiteFooter/>
  </>;
}
