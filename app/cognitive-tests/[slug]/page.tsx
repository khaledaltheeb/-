import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import CognitiveLabRunner from '@/components/cognitive-lab-runner';
import {getCognitiveTool} from '@/lib/cognitive-lab/catalog';
import {currentCognitiveSlug} from '@/lib/historical-cognitive-tests';
import {getLegacyPreservedPage} from '@/lib/legacy-preserved-page';
import {buildSeoMetadata} from '@/lib/seo';

export const dynamic='force-dynamic';
type Params=Promise<{slug:string}>;
const routeFor=(slug:string)=>`/cognitive-tests/${slug}/`;

export async function generateMetadata({params}:{params:Params}):Promise<Metadata>{
  const {slug}=await params;
  const mapped=currentCognitiveSlug(slug);
  if(!mapped)return {};
  const tool=getCognitiveTool(mapped);
  if(!tool)return {};
  return buildSeoMetadata({
    title:`${tool.title} — المسار التاريخي`,
    description:`مسار تاريخي محفوظ يشغّل نفس نشاط ${tool.title} الموجود في Cognitive Lab. النشاط تعليمي وصفي، وليس اختبار ذكاء أو أداة تشخيصية.`,
    path:`/cognitive-lab/${mapped}`,
    index:true,
    follow:true,
    type:'article',
  });
}

export default async function HistoricalCognitiveTestPage({params}:{params:Params}){
  const {slug}=await params;
  const mapped=currentCognitiveSlug(slug);
  if(!mapped)notFound();
  const tool=getCognitiveTool(mapped);
  if(!tool)notFound();
  const route=routeFor(slug);
  const page=await getLegacyPreservedPage(route);
  if(!page)notFound();
  return <>
    <SiteHeader/>
    <main className="cognitive-lab-page cognitive-tool-page">
      <section className="cognitive-tool-hero">
        <div className="cognitive-shell">
          <span className="cognitive-kicker">مسار تاريخي محفوظ · تعليمي غير تشخيصي</span>
          <h1>{page.h1||page.title||tool.title}</h1>
          <p>{page.meta_description||tool.summary}</p>
          <div className="cognitive-tool-badges">
            <span>المهمة الفعلية مفعّلة</span>
            <span>لا توجد درجة ذكاء</span>
            <span>لا يوجد تشخيص</span>
            <span>المرجع الحالي: Cognitive Lab</span>
          </div>
          <p><Link href={`/cognitive-lab/${mapped}`}>فتح الصفحة المرجعية الحالية لهذه المهمة ←</Link></p>
        </div>
      </section>
      <div className="cognitive-shell cognitive-runner-wrap"><CognitiveLabRunner tool={tool}/></div>
      <section className="cognitive-shell cognitive-reading">
        <div className="article-body"><ContentRenderer bodyJson={page.body_json} bodyText={page.body_text} recordId={page.source_path}/></div>
      </section>
    </main>
    <SiteFooter/>
  </>;
}
