import fs from 'node:fs';const read=p=>fs.readFileSync(p,'utf8');let bad=false;const fail=m=>{console.error(`HISTORICAL PARITY CONTRACT FAILED: ${m}`);bad=true;};
const required=['lib/historical-assessments.ts','components/historical-assessment-runner.tsx','app/assessments/page.tsx','app/assessments/[slug]/page.tsx','lib/historical-cognitive-tests.ts','app/cognitive-tests/page.tsx','app/cognitive-tests/[slug]/page.tsx'];for(const p of required)if(!fs.existsSync(p))fail(`missing ${p}`);
if(!bad){const a=read(required[0]),r=read(required[1]),m=read(required[4]),cp=read(required[6]);
 for(const slug of ["'gad-7'","'phq-9'","'who-5'"])if(!a.includes(slug))fail(`assessment missing ${slug}`);
 if((a.match(/sourceUrl:\s*['"]https:\/\//g)||[]).length!==3)fail('each assessment needs an authoritative HTTPS source');
 if(/scoreNote\s*:\s*\(/.test(a))fail('assessment definitions passed to client must not contain functions');
 for(const marker of ["scoreDirection:'higher-more-symptoms'","scoreDirection:'higher-better-wellbeing'"])if(!a.includes(marker))fail(`serializable score model missing ${marker}`);
 for(const marker of ['لا تُرسل الإجابات','window.print()','مسح الإجابات','scoreText'])if(!r.includes(marker))fail(`assessment local-safety/result marker missing: ${marker}`);
 if(/fetch\s*\(|localStorage|sessionStorage|sendBeacon|XMLHttpRequest/.test(r))fail('assessment answers must not be transmitted or persisted');
 const mappings=['digit-span-forward','matrix-patterns','two-back','number-series','simple-reaction','mental-rotation','stroop-basic','verbal-analogy'];for(const value of mappings)if(!m.includes(value))fail(`cognitive mapping missing ${value}`);
 if(!cp.includes('CognitiveLabRunner')||!cp.includes('ContentRenderer'))fail('historical cognitive route must run the real task and preserve original text');
 for(const p of ['app/assessments/page.tsx','app/assessments/[slug]/page.tsx','app/cognitive-tests/page.tsx','app/cognitive-tests/[slug]/page.tsx'])if(/permanentRedirect|\bredirect\s*\(/.test(read(p)))fail(`redirect forbidden: ${p}`);
}
if(bad)process.exit(1);console.log('Historical functional parity contract passed: 3 serializable local-only assessments and 8 cognitive tasks restored in place.');
