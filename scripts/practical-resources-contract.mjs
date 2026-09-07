import fs from 'node:fs';

const read=(p)=>fs.readFileSync(p,'utf8');
let bad=false;
const fail=(m)=>{console.error(`PRACTICAL RESOURCES CONTRACT FAILED: ${m}`);bad=true};
const data=read('lib/practical-resources.ts');
const form=read('components/worksheet-form.tsx');
const info=read('app/resources/infographics/[slug]/page.tsx');
const work=read('app/resources/worksheets/[slug]/page.tsx');
const resource=read('app/resources/[slug]/page.tsx');
const materializer=read('scripts/materialize-practical-resources-static-html.mjs');
const toolkit=read('app/evidence-guides/dyslexia-norway-school-observation-toolkit/page.tsx');

const legacySlugs=[
 'education-not-diagnosis','support-before-judgment','reliable-mental-health-page',
 'personal-preparation','family-support-plan','classroom-support-observation',
 'student-support-preparation','professional-content-review'
];
const dyslexiaSlugs=[
 'dyslexia-reading-observation','dyscalculia-math-observation','dld-language-observation',
 'learning-support-four-week-log','learning-referral-evidence-pack','family-school-learning-communication'
];
for(const slug of [...legacySlugs,...dyslexiaSlugs]) if(!data.includes(slug)) fail(`missing ${slug}`);
for(const slug of dyslexiaSlugs) if(!materializer.includes(slug)) fail(`static materializer missing ${slug}`);
for(const prompt of ['ما أكثر شيء يزعجني الآن؟','ما الاحتياج الذي نحاول دعمه؟','ما المهمة المحددة ومتى ظهرت الصعوبة؟','في أي مادة أو موقف تظهر الصعوبة أكثر؟','هل العنوان والوصف يطابقان المحتوى فعلًا؟']) if(!data.includes(prompt)) fail(`original prompt missing: ${prompt}`);
if(form.includes('localStorage')||form.includes('fetch(')) fail('worksheet answers must not persist or transmit automatically');
if(!form.includes('window.print')&&!read('components/print-resource-button.tsx').includes('window.print')) fail('print workflow missing');
if(!info.includes('resourceSafetyNote')||!work.includes('resourceSafetyNote')) fail('safety boundary missing');
for(const marker of ['canonicalPath','base.alternates?.canonical','/resources/${slug}/','if(canonical===resourcePath)return base','robots:{index:false']) if(!resource.includes(marker)) fail(`resource canonical/indexing guard missing: ${marker}`);
for(const marker of ["dynamic='force-static'",'dyslexia-norway-school-observation-toolkit','ContentRenderer','NEXT_PUBLIC_SUPABASE_URL']) if(!toolkit.includes(marker)) fail(`static toolkit route missing: ${marker}`);
for(const marker of ['.next','server','app','resources','worksheets','index.html','index.rsc']) if(!materializer.includes(marker)) fail(`materializer contract missing: ${marker}`);
if(bad) process.exit(1);
console.log('Practical resources contract passed: Dyslexia Norway worksheets are present, printable, statically staged for Cloudflare, and the school toolkit has a dedicated static route.');
