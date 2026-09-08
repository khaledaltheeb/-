import { NextRequest, NextResponse } from 'next/server';
import { cleanPhenotypes } from '@/lib/rare-phenotype';

export const dynamic = 'force-dynamic';

const MONARCH_ENDPOINT = 'https://api-v3.monarchinitiative.org/v3/api/semsim/search';
const ALLOWED_GROUPS = new Set(['Human Diseases', 'Human Genes']);

type Body = {
  phenotypes?: string[];
  group?: string;
  limit?: number;
};

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = await request.json() as Body;
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  }

  const phenotypes = cleanPhenotypes(body.phenotypes, 30);
  const group = ALLOWED_GROUPS.has(body.group ?? '') ? body.group! : 'Human Diseases';
  const limit = Math.min(20, Math.max(1, Number(body.limit ?? 10) || 10));
  if (!phenotypes.length) return NextResponse.json({ error: 'أضف نمطًا ظاهريًا واحدًا على الأقل.' }, { status: 400 });

  try {
    const response = await fetch(MONARCH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        termset: phenotypes,
        group,
        metric: 'ancestor_information_content',
        directionality: 'bidirectional',
        limit,
      }),
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'خدمة المطابقة الدلالية غير متاحة مؤقتًا.', upstream_status: response.status }, { status: 502 });
    }
    const results = await response.json();
    return NextResponse.json({
      phenotypes,
      group,
      metric: 'ancestor_information_content',
      results,
      source: 'Monarch Initiative v3 semantic similarity',
      source_url: 'https://api-v3.monarchinitiative.org/v3/docs',
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'تعذر الاتصال بخدمة المطابقة الدلالية.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
