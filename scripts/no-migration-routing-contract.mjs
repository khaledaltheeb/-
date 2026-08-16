import fs from 'node:fs';
const read=(path)=>fs.readFileSync(path,'utf8');
let bad=false;
const fail=(message)=>{console.error(`NO MIGRATION ROUTING CONTRACT FAILED: ${message}`);bad=true;};
const config=read('next.config.ts');
if(!/async redirects\(\)[\s\S]*?return \[\];/.test(config))fail('redirects() must remain empty for migrated content');
if(!/async rewrites\(\)[\s\S]*?return \[\];/.test(config))fail('rewrites() must remain empty for migrated content');
const publicMigrationRoutes=[
 'app/[...legacyPath]/page.tsx','app/daily-tools/page.tsx','app/daily-tools/[slug]/page.tsx',
 'app/cognitive-lab/associative-context-binding/page.tsx','app/cognitive-lab/prospective-memory-cues/page.tsx',
 'app/hubs/page.tsx','app/hubs/[slug]/page.tsx','app/resources/[slug]/page.tsx',
 'app/encyclopedia/[slug]/page.tsx','app/quick-info/[slug]/page.tsx','app/sections/[slug]/page.tsx',
 'app/sectors/[slug]/page.tsx','app/capabilities/[slug]/page.tsx','app/comparisons/[slug]/page.tsx',
 'app/evidence-guides/[slug]/page.tsx','app/magazine/[slug]/page.tsx','app/care-guides/[...slug]/page.tsx',
 'app/addiction/[...segments]/page.tsx','app/family-guide/[...segments]/page.tsx',
 'app/specialists-partners/contact.html/page.tsx','app/specialists-partners/join.html/page.tsx'
];
for(const path of publicMigrationRoutes){
 if(!fs.existsSync(path)){fail(`real route missing: ${path}`);continue;}
 const text=read(path);
 if(/\bpermanentRedirect\b|\bredirect\s*\(/.test(text))fail(`migration redirect forbidden in ${path}`);
}
if(bad)process.exit(1);
console.log('Migration routing contract passed: no migration redirects/rewrites; preserved public routes render in place.');