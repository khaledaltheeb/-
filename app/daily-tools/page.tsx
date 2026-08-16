import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import DailyToolsDirectory from '@/components/daily-tools-directory';
import { deriveDailyToolDirectory } from '@/lib/daily-tools-preserved';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';

export const dynamic='force-dynamic';
const route='/daily-tools/';
export async function generateMetadata():Promise<Metadata>{return legacyPreservedMetadata(await getLegacyPreservedPage(route),route);}
export default async function DailyToolsPage(){
 const page=await getLegacyPreservedPage(route);if(!page)notFound();const items=deriveDailyToolDirectory(page);
 return <><SiteHeader/><main className="article-shell"><article><header className="article-hero"><span className="eyebrow">أدوات يومية غير تشخيصية</span><h1>{page.h1||page.title||'الأدوات اليومية'}</h1>{page.meta_description?<p>{page.meta_description}</p>:null}</header><DailyToolsDirectory items={items}/><div className="article-body"><ContentRenderer bodyJson={page.body_json} bodyText={page.body_text} recordId={page.source_path}/></div></article></main><SiteFooter/></>;
}