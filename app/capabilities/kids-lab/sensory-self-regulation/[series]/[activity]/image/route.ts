import { NextResponse } from 'next/server';
import { getSensorySelfActivity } from '@/lib/capabilities/sensory-self-regulation-lab';
import { renderSensorySelfSvg } from '@/lib/capabilities/sensory-self-regulation-svg';
type Ctx={params:Promise<{series:string;activity:string}>};
export async function GET(_:Request,{params}:Ctx){const p=await params;const a=getSensorySelfActivity(p.series,p.activity);if(!a)return new NextResponse('Not found',{status:404});return new NextResponse(renderSensorySelfSvg(a),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=86400, s-maxage=604800'}})}
