import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function parseAppVersion(request: NextRequest) {
  const raw = Number.parseInt(request.nextUrl.searchParams.get('appVersion') ?? '1', 10);
  return Number.isFinite(raw) && raw > 0 ? Math.min(raw, 100000) : 1;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const appVersion = parseAppVersion(request);

  const [manifestResult, toolsResult] = await Promise.all([
    supabase
      .from('mobile_app_manifest')
      .select('manifest_key,schema_version,payload,updated_at')
      .eq('manifest_key', 'home')
      .eq('is_enabled', true)
      .maybeSingle(),
    supabase
      .from('mobile_tools')
      .select('tool_id,name_ar,description_ar,icon,tool_kind,native_route,web_path,sector_slugs,category_slugs,content_types,min_app_version,sort_order,config,updated_at')
      .eq('is_enabled', true)
      .lte('min_app_version', appVersion)
      .order('sort_order')
      .order('tool_id'),
  ]);

  if (manifestResult.error || toolsResult.error || !manifestResult.data) {
    return NextResponse.json(
      { ok: false, error: 'mobile_manifest_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const tools = (toolsResult.data ?? []).map((tool) => ({
    id: tool.tool_id,
    name: tool.name_ar,
    description: tool.description_ar,
    icon: tool.icon,
    kind: tool.tool_kind,
    nativeRoute: tool.native_route,
    webPath: tool.web_path,
    sectorSlugs: tool.sector_slugs ?? [],
    categorySlugs: tool.category_slugs ?? [],
    contentTypes: tool.content_types ?? [],
    minAppVersion: tool.min_app_version,
    sortOrder: tool.sort_order,
    config: tool.config ?? {},
    updatedAt: tool.updated_at,
  }));

  const latestToolUpdate = tools.reduce<string | null>((latest, tool) => {
    if (!tool.updatedAt) return latest;
    if (!latest || tool.updatedAt > latest) return tool.updatedAt;
    return latest;
  }, null);

  return NextResponse.json(
    {
      ok: true,
      generatedAt: new Date().toISOString(),
      appVersion,
      schemaVersion: manifestResult.data.schema_version,
      manifestUpdatedAt: manifestResult.data.updated_at,
      toolsUpdatedAt: latestToolUpdate,
      manifest: manifestResult.data.payload,
      tools,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
