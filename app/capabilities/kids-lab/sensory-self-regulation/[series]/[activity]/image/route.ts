import { NextResponse } from 'next/server';
import { getSensorySelfActivity, sensorySelfActivities } from '@/lib/capabilities/sensory-self-regulation-lab';
import { renderSensorySelfSvg } from '@/lib/capabilities/sensory-self-regulation-svg';
import { normalizeKidsLabSvgText } from '@/lib/capabilities/kids-lab-svg-polish';
type Ctx={params:Promise<{series:string;activity:string}>};
export function generateStaticParams(){return sensorySelfActivities.map((item)=>({series:item.seriesSlug,activity:item.slug}));}
export async function GET(_:Request,{params}:Ctx){const p=await params;const a=getSensorySelfActivity(p.series,p.activity);if(!a)return new NextResponse('Not found',{status:404});return new NextResponse(normalizeKidsLabSvgText(renderSensorySelfSvg(a)),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'}})}
