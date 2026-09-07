import { notFound } from 'next/navigation';
import { fineMotorActivities, getFineMotorActivity } from '@/lib/capabilities/fine-motor-lab';
import { renderFineMotorWorksheet } from '@/lib/capabilities/fine-motor-svg-final';

type Params=Promise<{series:string;activity:string}>;
export function generateStaticParams(){return fineMotorActivities.map((item)=>({series:item.seriesSlug,activity:item.slug}));}
export async function GET(_:Request,{params}:{params:Params}){const {series,activity}=await params;const item=getFineMotorActivity(series,activity);if(!item)notFound();return new Response(renderFineMotorWorksheet(item),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=31536000, immutable','Content-Disposition':`inline; filename="fine-motor-${series}-${activity}.svg"`}});}
