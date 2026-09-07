import { NextResponse } from 'next/server';
import { getSocialActivity, socialActivities } from '@/lib/capabilities/social-skills-lab';
import { renderSocialSvg } from '@/lib/capabilities/social-skills-svg';

type Props={params:Promise<{series:string;activity:string}>};
export function generateStaticParams(){return socialActivities.map((item)=>({series:item.seriesSlug,activity:item.slug}));}
export async function GET(_:Request,{params}:Props){const {series,activity}=await params;const item=getSocialActivity(series,activity);if(!item)return new NextResponse('Not found',{status:404});const svg=renderSocialSvg(item);return new NextResponse(svg,{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=31536000, immutable','Content-Disposition':`inline; filename="${series}-${activity}.svg"`}});}
