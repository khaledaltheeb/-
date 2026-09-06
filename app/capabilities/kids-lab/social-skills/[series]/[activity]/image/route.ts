import { NextResponse } from 'next/server';
import { getSocialActivity } from '@/lib/capabilities/social-skills-lab';
import { renderSocialSvg } from '@/lib/capabilities/social-skills-svg';

type Props={params:Promise<{series:string;activity:string}>};
export async function GET(_:Request,{params}:Props){const {series,activity}=await params;const item=getSocialActivity(series,activity);if(!item)return new NextResponse('Not found',{status:404});const svg=renderSocialSvg(item);return new NextResponse(svg,{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=3600, s-maxage=86400','Content-Disposition':`inline; filename="${series}-${activity}.svg"`}});}
