import type { Metadata } from 'next';
import CognitiveToolPage from '../[slug]/page';
import { getCognitiveTool } from '@/lib/cognitive-lab/catalog';
import { buildSeoMetadata } from '@/lib/seo';

const canonicalSlug='prospective-memory';
const tool=getCognitiveTool(canonicalSlug);
export const metadata:Metadata=buildSeoMetadata({title:tool?.title??'الذاكرة المستقبلية',description:tool?.summary??'نشاط تعليمي غير تشخيصي في مختبر القدرات.',path:`/cognitive-lab/${canonicalSlug}`,index:false,follow:true,type:'article',keywords:[tool?.title??'الذاكرة المستقبلية','مختبر القدرات','تدريب معرفي']});
export default function LegacyProspectiveMemoryCuesPage(){return CognitiveToolPage({params:Promise.resolve({slug:canonicalSlug})})}
