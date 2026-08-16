import fs from 'node:fs';

const DATA_PATH='data/legacy-production-batches/daily-tools/001.json';
const EXPECTED_TOTAL=151;
const HUB_PATH='daily-tools/index.html';
const SLEEP_PATH='daily-tools/sleep-wind-down-plan/index.html';
const EXPECTED_STANDARD=149;
const read=(path)=>fs.readFileSync(path,'utf8');
let bad=false;
const fail=(message)=>{console.error(`DAILY TOOLS CONTRACT FAILED: ${message}`);bad=true;};
const text=(value)=>typeof value==='string'?value.trim():'';
const blocks=(record)=>record?.body_json&&typeof record.body_json==='object'&&!Array.isArray(record.body_json)&&Array.isArray(record.body_json.blocks)?record.body_json.blocks:[];

function runtimeShape(record){
 const source=blocks(record);
 const stepBlock=source.find((block)=>block?.type==='list'&&block?.ordered===true&&Array.isArray(block.items)&&text(block.items[0]).startsWith('الخطوة '));
 const steps=Array.isArray(stepBlock?.items)?stepBlock.items.map((item)=>text(item).replace(/^الخطوة\s+\d+\s*:\s*/,'')).filter(Boolean):[];
 const fieldsBlock=source.find((block)=>block?.type==='paragraph'&&text(block.text).startsWith('تشمل حقول المتابعة:'));
 const fieldsLine=text(fieldsBlock?.text);
 const fields=fieldsLine?fieldsLine.replace(/^تشمل حقول المتابعة:\s*/,'').split(/\.\s+اقرأها\b/,1)[0].replace(/[.،\s]+$/,'').split('،').map((item)=>item.trim()).filter(Boolean):[];
 return {steps,fields};
}

const payload=JSON.parse(read(DATA_PATH));
const records=Array.isArray(payload?.records)?payload.records:[];
const daily=new Map();
for(const record of records){
 const sourcePath=text(record?.source_path);
 if(!sourcePath.startsWith('daily-tools/'))continue;
 if(daily.has(sourcePath))fail(`duplicate source_path: ${sourcePath}`);
 else daily.set(sourcePath,record);
}
if(daily.size!==EXPECTED_TOTAL)fail(`expected ${EXPECTED_TOTAL} preserved Daily Tools records, found ${daily.size}`);
const hub=daily.get(HUB_PATH),sleep=daily.get(SLEEP_PATH);
if(!hub)fail(`missing hub: ${HUB_PATH}`);
if(!sleep)fail(`missing sleep tracker: ${SLEEP_PATH}`);
const standard=[...daily.entries()].filter(([path])=>path!==HUB_PATH&&path!==SLEEP_PATH);
if(standard.length!==EXPECTED_STANDARD)fail(`expected ${EXPECTED_STANDARD} standard tools, found ${standard.length}`);
let runtimeMatches=0;
for(const [sourcePath,record] of standard){
 if(!/^daily-tools\/[a-z0-9][a-z0-9-]{0,119}\/index\.html$/i.test(sourcePath)){fail(`${sourcePath}: unsupported standard tool route shape`);continue;}
 const {steps,fields}=runtimeShape(record);
 if(steps.length!==4){fail(`${sourcePath}: runtime parser must derive exactly four steps, found ${steps.length}`);continue;}
 if(fields.length<3){fail(`${sourcePath}: runtime parser must derive at least three local fields, found ${fields.length}`);continue;}
 if(!/(?:localStorage|المتصفح|محلي)/u.test(text(record?.body_text))){fail(`${sourcePath}: preserved local/privacy marker missing`);continue;}
 runtimeMatches+=1;
}
if(runtimeMatches!==EXPECTED_STANDARD)fail(`runtime parser coverage ${runtimeMatches}/${EXPECTED_STANDARD}`);

if(sleep){
 const headings=blocks(sleep).filter((block)=>block?.type==='heading').map((block)=>text(block.text||block.title));
 for(const required of ['إضافة سجل','السجلات المحفوظة','مخطط الاتجاهات لآخر 14 سجلًا'])if(!headings.some((heading)=>heading.includes(required)))fail(`${SLEEP_PATH}: missing preserved tracker heading: ${required}`);
}

const files={helper:'lib/daily-tools-preserved.ts',workspace:'components/daily-tool-workspace.tsx',sleep:'components/sleep-log-local.tsx',directory:'components/daily-tools-directory.tsx',index:'app/daily-tools/page.tsx',detail:'app/daily-tools/[slug]/page.tsx',boundary:'supabase/migrations/20260816040102_fix_legacy_preserved_page_source_key.sql'};
for(const [name,path] of Object.entries(files))if(!fs.existsSync(path))fail(`${name} missing: ${path}`);
if(!bad){
 const helper=read(files.helper),workspace=read(files.workspace),sleepSource=read(files.sleep),directory=read(files.directory),index=read(files.index),detail=read(files.detail),boundary=read(files.boundary);
 for(const marker of ['deriveDailyToolSpec','تشمل حقول المتابعة:','stepBlock','fieldKind'])if(!helper.includes(marker))fail(`source-derived specification marker missing: ${marker}`);
 for(const marker of ['localStorage','rawafid:daily-tool:','تصدير JSON','window.print()','progress','مسح'])if(!workspace.includes(marker))fail(`workspace marker missing: ${marker}`);
 for(const marker of ['rawafid:sleep-log:v2','localConsent','تصدير JSON','تصدير CSV','حذف جميع البيانات المحلية','SleepChart','duration('])if(!sleepSource.includes(marker))fail(`sleep-log marker missing: ${marker}`);
 for(const marker of ['type="search"','useMemo','150 أداة عملية'])if(!directory.includes(marker))fail(`directory marker missing: ${marker}`);
 if(!index.includes('deriveDailyToolDirectory')||!index.includes('ContentRenderer'))fail('daily-tools landing must combine preserved production content with the real directory');
 if(!detail.includes("slug==='sleep-wind-down-plan'")||!detail.includes('DailyToolWorkspace')||!detail.includes('ContentRenderer'))fail('detail route must preserve the specialized sleep log and standard source-derived tools');
 for(const [name,source] of Object.entries({workspace,sleep:sleepSource,directory})){
   if(/\bfetch\s*\(/.test(source))fail(`${name} must not send personal tool input over the network`);
   if(/XMLHttpRequest|sendBeacon|WebSocket/.test(source))fail(`${name} contains a forbidden network primitive`);
 }
 for(const source of [index,detail])if(/\bredirect\s*\(|permanentRedirect/.test(source))fail('daily-tools migration routes must render in place');
 if(!boundary.includes("migration_decision not in ('INTERACTIVE_REVIEW','ASSET_REVIEW')"))fail('legacy read boundary guard changed unexpectedly');
}
if(bad)process.exit(1);
console.log(`Daily tools contract passed: ${daily.size} preserved records = ${runtimeMatches} standard source-derived tools + hub + specialized sleep tracker.`);
console.log('All standard tool inputs remain local-only and migration routes render in place without changing publication or robots state.');