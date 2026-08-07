import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('sectors').select('id', { count: 'exact', head: true });
    if (error) {
      return NextResponse.json(
        { status: 'degraded', app: 'ok', database: 'unavailable', supabase: 'unavailable' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    return NextResponse.json(
      { status: 'ok', app: 'ok', database: 'ok', supabase: 'ok', response_ms: Date.now() - started },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json(
      { status: 'degraded', app: 'ok', database: 'unavailable', supabase: 'unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
