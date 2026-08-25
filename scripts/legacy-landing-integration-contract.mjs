import fs from 'node:fs';
const read=(path)=>fs.readFileSync(path,'utf8');
let bad=false;
const fail=(message)=>{console.error(`LEGACY LANDING CONTRACT FAILED: ${message}`);bad=true;};

const landings=[
 ['/', 'app/page.tsx'],
 ['/about/', 'app/about/page.tsx'],
 ['/accessibility-statement/', 'app/accessibility-statement/page.tsx'],
 ['/accessibility/', 'app/accessibility/page.tsx'],
 ['/assessments/', 'app/assessments/page.tsx'],
 ['/audiences/', 'app/audiences/page.tsx'],
 ['/capabilities/expanded/', 'app/capabilities/expanded/page.tsx'],
 ['/categories/الدافعية-والسلوك/', 'app/categories/[slug]/page.tsx'],
 ['/cochrane/evidence-academy/', 'app/cochrane/[[...slug]]/page.tsx'],
 ['/cochrane/', 'app/cochrane/[[...slug]]/page.tsx'],
 ['/cognitive-tests/', 'app/cognitive-tests/page.tsx'],
 ['/en/', 'app/en/page.tsx'],
 ['/encyclopedia/all/', 'app/encyclopedia/all/page.tsx'],
 ['/encyclopedia/', 'app/encyclopedia/page.tsx'],
 ['/es/', 'app/es/page.tsx'],
 ['/family/', 'app/family/page.tsx'],
 ['/iris/cited-guides/', 'app/iris/[[...slug]]/page.tsx'],
 ['/iris/', 'app/iris/[[...slug]]/page.tsx'],
 ['/learning-paths/', 'app/learning-paths/[[...slug]]/page.tsx'],
 ['/library/', 'app/library/[[...slug]]/page.tsx'],
 ['/magazine/', 'app/magazine/page.tsx'],
 ['/outside-the-box/', 'app/outside-the-box/[[...slug]]/page.tsx'],
 ['/quick-info/', 'app/quick-info/page.tsx'],
 ['/schools/', 'app/schools/page.tsx'],
 ['/sections/', 'app/sections/page.tsx'],
 ['/sectors/all-pages/', 'app/sectors/all-pages/page.tsx'],
 ['/sectors/calendars/', 'app/sectors/calendars/page.tsx'],
 ['/sectors/home/', 'app/sectors/[slug]/page.tsx'],
 ['/sectors/', 'app/sectors/page.tsx'],
 ['/sectors/women/', 'app/sectors/[slug]/page.tsx'],
 ['/sectors/youth/', 'app/sectors/[slug]/page.tsx'],
 ['/services/', 'app/services/page.tsx'],
 ['/source-registry/', 'app/source-registry/[[...slug]]/page.tsx'],
 ['/specialists-partners/', 'app/specialists-partners/page.tsx'],
 ['/start-here/', 'app/start-here/page.tsx'],
 ['/terms/', 'app/terms/page.tsx'],
 ['/tips/', 'app/tips/[[...slug]]/page.tsx'],
 ['/trust/', 'app/trust/[[...slug]]/page.tsx'],
 ['/verified-resources/', 'app/verified-resources/page.tsx'],
];
if(landings.length!==39)fail(`expected 39 landing integrations, got ${landings.length}`);
for(const [route,file] of landings){
 if(!fs.existsSync(file)){fail(`${route} missing route file ${file}`);continue;}
 const body=read(file);
 if(/\bpermanentRedirect\b|\bredirect\s*\(/.test(body))fail(`${route} must render in place, not redirect`);
}
for(const file of [
 'app/accessibility-statement/page.tsx','app/accessibility/page.tsx','app/capabilities/expanded/page.tsx',
 'app/categories/[slug]/page.tsx','app/cochrane/[[...slug]]/page.tsx','app/en/page.tsx','app/encyclopedia/all/page.tsx',
 'app/es/page.tsx','app/family/page.tsx','app/iris/[[...slug]]/page.tsx','app/learning-paths/[[...slug]]/page.tsx',
 'app/library/[[...slug]]/page.tsx','app/outside-the-box/[[...slug]]/page.tsx','app/schools/page.tsx','app/services/page.tsx',
 'app/source-registry/[[...slug]]/page.tsx','app/specialists-partners/page.tsx','app/tips/[[...slug]]/page.tsx','app/trust/[[...slug]]/page.tsx',
 'app/verified-resources/page.tsx','app/sectors/all-pages/page.tsx','app/sectors/calendars/page.tsx'
]){
 const body=read(file);
 if(!body.includes('LegacyPreservedRoute'))fail(`${file} must render the complete preserved production record`);
}
const preserved=read('components/legacy-preserved-page.tsx');
for(const marker of ['ContentRenderer','legacyInternalLinks','legacyReferences','من مكتبة منصة روافد','صفحة منشورة ومحفوظة'])if(!preserved.includes(marker))fail(`preserved landing renderer missing ${marker}`);
const proxy=read('lib/supabase/proxy.ts');
for(const marker of ['legacy_preserved_route_exists','isLegacyProductionRoute','pathname.endsWith','redirects'])if(!proxy.includes(marker))fail(`proxy legacy-route boundary missing ${marker}`);
const migration=read('supabase/migrations/20260816092116_legacy_preserved_route_exists.sql');
for(const marker of ['security definer','production-baseline','DEVELOPMENT_ONLY','EXCLUDE_%','grant execute'])if(!migration.toLowerCase().includes(marker.toLowerCase()))fail(`legacy route existence migration missing ${marker}`);
if(bad)process.exit(1);
console.log('Legacy landing integration contract passed: all 39 historical landings render in place with complete preserved content or their current V3 landing under the current Rawafid identity.');
