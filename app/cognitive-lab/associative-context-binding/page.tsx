import type { Metadata } from 'next';
import CognitiveToolPage from '../[slug]/page';
import { getCognitiveTool } from '@/lib/cognitive-lab/catalog';
import { buildSeoMetadata } from '@/lib/seo';

const canonicalSlug='associative-binding';
const tool=getCognitiveTool(canonicalSlug);
export const metadata:Metadata=buildSeoMetadata({title:tool?.title??'الربط الترابطي',description:tool?.summary??'نشاط تعليمي غير تشخيصي في مختبر القدرات.',path:`/cognitive-lab/${canonicalSlug}`,index:false,follow:true,type:'article',keywords:[tool?.title??'الربط الترابطي','مختبر القدرات','تدريب معرفي']});
export default function LegacyAssociativeContextBindingPage(){return CognitiveToolPage({params:Promise.resolve({slug:canonicalSlug})})}
