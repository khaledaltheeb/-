import fs from 'node:fs';
const read=(path)=>fs.readFileSync(path,'utf8');
let bad=false;
const fail=(message)=>{console.error(`DAILY TOOLS CONTRACT FAILED: ${message}`);bad=true;};
const files={
 helper:'lib/daily-tools-preserved.ts',workspace:'components/daily-tool-workspace.tsx',sleep:'components/sleep-log-local.tsx',directory:'components/daily-tools-directory.tsx',index:'app/daily-tools/page.tsx',detail:'app/daily-tools/[slug]/page.tsx'
};
for(const [name,path] of Object.entries(files))if(!fs.existsSync(path))fail(`${name} missing: ${path}`);
if(!bad){
 const helper=read(files.helper),workspace=read(files.workspace),sleep=read(files.sleep),directory=read(files.directory),index=read(files.index),detail=read(files.detail);
 for(const marker of ['deriveDailyToolSpec','تشمل حقول المتابعة:','stepBlock','fieldKind'])if(!helper.includes(marker))fail(`source-derived specification marker missing: ${marker}`);
 for(const marker of ['localStorage','rawafid:daily-tool:','تصدير JSON','window.print()','progress','مسح'])if(!workspace.includes(marker))fail(`workspace marker missing: ${marker}`);
 for(const marker of ['rawafid:sleep-log:v2','localConsent','تصدير JSON','تصدير CSV','حذف جميع البيانات المحلية','SleepChart','duration('])if(!sleep.includes(marker))fail(`sleep-log marker missing: ${marker}`);
 for(const marker of ['type="search"','useMemo','150 أداة عملية'])if(!directory.includes(marker))fail(`directory marker missing: ${marker}`);
 if(!index.includes('deriveDailyToolDirectory')||!index.includes('ContentRenderer'))fail('daily-tools landing must combine the production content with the real directory');
 if(!detail.includes("slug==='sleep-wind-down-plan'")||!detail.includes('DailyToolWorkspace')||!detail.includes('ContentRenderer'))fail('detail route must preserve the specialized sleep log and standard source-derived tools');
 for(const [name,source] of Object.entries({workspace,sleep,directory})){
   if(/\bfetch\s*\(/.test(source))fail(`${name} must not send personal tool input over the network`);
   if(/XMLHttpRequest|sendBeacon|WebSocket/.test(source))fail(`${name} contains a forbidden network primitive`);
 }
 for(const source of [index,detail])if(/\bredirect\s*\(|permanentRedirect/.test(source))fail('daily-tools migration routes must render in place');
}
if(bad)process.exit(1);
console.log('Daily tools contract passed: source-specific steps/fields, searchable catalog, local-only records, specialized sleep log and no migration redirects.');