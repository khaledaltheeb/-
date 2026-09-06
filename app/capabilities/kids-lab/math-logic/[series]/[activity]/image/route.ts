import { NextResponse } from 'next/server';
import { getMathLogicActivity,mathLogicActivities } from '@/lib/capabilities/math-logic-lab';
import { renderMathLogicSvg } from '@/lib/capabilities/math-logic-svg-final';
type Props={params:Promise<{series:string;activity:string}>};
export function generateStaticParams(){return mathLogicActivities.map(a=>({series:a.seriesSlug,activity:a.slug}));}
export async function GET(_:Request,{params}:Props){const {series,activity}=await params;const a=getMathLogicActivity(series,activity);if(!a)return new NextResponse('Not found',{status:404});return new NextResponse(renderMathLogicSvg(a),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=31536000, immutable'}});}
