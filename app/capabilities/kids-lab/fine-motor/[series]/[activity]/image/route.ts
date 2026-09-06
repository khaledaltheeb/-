import { notFound } from 'next/navigation';
import { getFineMotorActivity } from '@/lib/capabilities/fine-motor-lab';
import { renderFineMotorWorksheet } from '@/lib/capabilities/fine-motor-svg';

type Params=Promise<{series:string;activity:string}>;
export async function GET(_:Request,{params}:{params:Params}){const {series,activity}=await params;const item=getFineMotorActivity(series,activity);if(!item)notFound();return new Response(renderFineMotorWorksheet(item),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000','Content-Disposition':`inline; filename="fine-motor-${series}-${activity}.svg"`}});}
