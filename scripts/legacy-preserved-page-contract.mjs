import fs from 'node:fs';

const read=(path)=>fs.readFileSync(path,'utf8');
let failed=false;
const fail=(message)=>{console.error(`LEGACY PRESERVATION CONTRACT FAILED: ${message}`);failed=true;};

const migration=read('supabase/migrations/20260816040102_fix_legacy_preserved_page_source_key.sql');
const helper=read('lib/legacy-preserved-page.ts');
const view=read('components/legacy-preserved-page.tsx');
const routes=[
 'app/[...legacyPath]/page.tsx','app/hubs/page.tsx','app/hubs/[slug]/page.tsx','app/encyclopedia/[slug]/page.tsx',
 'app/quick-info/[slug]/page.tsx','app/sections/[slug]/page.tsx','app/sectors/[slug]/page.tsx','app/capabilities/[slug]/page.tsx',
 'app/comparisons/[slug]/page.tsx','app/evidence-guides/[slug]/page.tsx','app/magazine/[slug]/page.tsx',
 'app/care-guides/[...slug]/page.tsx','app/addiction/[...segments]/page.tsx','app/family-guide/[...segments]/page.tsx'
];

for(const marker of [
  'security definer',"set search_path = ''","source_kind='production-baseline'","migration_state,'')<>'DEVELOPMENT_ONLY'",
  "migration_decision not like 'EXCLUDE_%'","migration_decision not in ('INTERACTIVE_REVIEW','ASSET_REVIEW')",
  'order by l.source_key','revoke all on function public.get_legacy_preserved_page(text) from public',
  'grant execute on function public.get_legacy_preserved_page(text) to anon, authenticated',"v_route ~ '(^|/)\\.\\.(/|$)'"
]) if(!migration.toLowerCase().includes(marker.toLowerCase())) fail(`final read-boundary marker missing: ${marker}`);

for(const forbidden of ['service_role','secret_key']) if(helper.toLowerCase().includes(forbidden)||view.toLowerCase().includes(forbidden)) fail(`forbidden preservation secret pattern: ${forbidden}`);
for(const marker of ['get_legacy_preserved_page','legacyPreservedMetadata','index: false','noarchive: true','healthrenewal.org','decodeURIComponent',"normalize('NFC')"]) if(!helper.includes(marker)) fail(`helper marker missing: ${marker}`);
for(const marker of ['نسخة إنتاجية محفوظة','لم تُمنح هذه النسخة اعتماد دورة المراجعة العلمية الحالية','ContentRenderer','legacyInternalLinks','legacyReferences']) if(!view.includes(marker)) fail(`preserved view marker missing: ${marker}`);
for(const path of routes){
 if(!fs.existsSync(path)){fail(`preserved route missing: ${path}`);continue;}
 const source=read(path);
 if(!source.includes('getLegacyPreservedPage')) fail(`${path} does not use the preservation boundary`);
 if(!source.includes('LegacyPreservedPageView')) fail(`${path} does not render preserved production content`);
}
const encyclopedia=read('app/encyclopedia/[slug]/page.tsx');
if(!encyclopedia.includes('getEncyclopediaRecord')||!encyclopedia.includes('if (!record)')) fail('reviewed encyclopedia content must keep priority over preserved fallback');
const catchAll=read('app/[...legacyPath]/page.tsx');
if(!catchAll.includes('notFound()')) fail('unknown routes must still reach the branded 404');
for(const path of [
 'supabase/migrations/20260816035959_legacy_preserved_page_read_boundary.sql',
 'supabase/migrations/20260816040040_fix_legacy_preserved_page_read_boundary.sql',
 'supabase/migrations/20260816040102_fix_legacy_preserved_page_source_key.sql'
]) if(!fs.existsSync(path)) fail(`deployed migration history not mirrored: ${path}`);

if(failed)process.exit(1);
console.log('Legacy preservation contract passed: production HTML is available through a Unicode-safe read-only noindex boundary without migration redirects or publication-gate bypass.');
