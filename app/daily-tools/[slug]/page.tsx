import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import DailyToolWorkspace from '@/components/daily-tool-workspace';
import SleepLogLocal from '@/components/sleep-log-local';
import { deriveDailyToolSpec } from '@/lib/daily-tools-preserved';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';

export const dynamic='force-dynamic';
type Params=Promise<{slug:string}>;
const routeFor=(slug:string)=>`/daily-tools/${slug}/`;
export async function generateMetadata({params}:{params:Params}):Promise<Metadata>{const {slug}=await params;const route=routeFor(slug);return legacyPreservedMetadata(await getLegacyPreservedPage(route),route);}
export default async function DailyToolPage({params}:{params:Params}){
 const {slug}=await params;const route=routeFor(slug);const page=await getLegacyPreservedPage(route);if(!page)notFound();
 const title=page.h1||page.title||slug;const spec=deriveDailyToolSpec(page);
 const interactive=slug==='sleep-wind-down-plan'?<SleepLogLocal/>:spec?<DailyToolWorkspace slug={slug} title={title} spec={spec}/>:null;
 if(!interactive)notFound();
 return <><SiteHeader/><main className="article-shell"><article><header className="article-hero"><span className="eyebrow">أداة يومية محلية غير تشخيصية</span><h1>{title}</h1>{page.meta_description?<p>{page.meta_description}</p>:null}</header>{interactive}<div className="article-body"><ContentRenderer bodyJson={page.body_json} bodyText={page.body_text} recordId={page.source_path}/></div></article></main><SiteFooter/></>;
}