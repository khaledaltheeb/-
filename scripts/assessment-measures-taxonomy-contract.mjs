import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const read=(path)=>fs.readFileSync(path,'utf8');
let failed=false;
const fail=(message)=>{console.error(`ASSESSMENT MEASURES TAXONOMY CONTRACT FAILED: ${message}`);failed=true;};

const taxonomy=read('lib/assessment-measure-taxonomy.ts');
const compare=read('app/assessment-measures/compare/page.tsx');
const detail=read('app/assessment-measures/[slug]/page.tsx');

for(const coa of ["'prom'","'clinro'","'obsro'","'perfo'"]){
  if(!taxonomy.includes(coa))fail(`missing COA type ${coa}`);
}
if(taxonomy.includes("| 'structured-interview'\n  | 'clinical-classification'")){
  fail('structured interview must not be modeled as a COA/object kind');
}
for(const marker of ['AdministrationFormatTag','structured-interview','coaTypeFor','measurementAdministrationLabels']){
  if(!taxonomy.includes(marker))fail(`missing administration/type separation marker: ${marker}`);
}
if(/if \(tags\.size === 0\).*outcome-monitoring/.test(taxonomy)){
  fail('taxonomy must not invent outcome-monitoring when use evidence is absent');
}
for(const slug of [
  'karnofsky-performance-scale','eastern-cooperative-oncology-group-performance-status','glasgow-outcome-scale-extended',
  'modified-rankin-scale','glasgow-coma-scale-ninds','timed-up-and-go','10-meter-walk-test','6-minute-walk-test',
  'berg-balance-scale','patient-health-questionnaire-2','patient-health-questionnaire-9','generalized-anxiety-disorder-7','heaviness-of-smoking-index',
]){
  if(!taxonomy.includes(`'${slug}'`))fail(`high-impact explicit classification missing: ${slug}`);
}
for(const marker of ['classifyAssessmentMeasure','نوع أداة القياس','استخدامات القياس','نوع الأداة» ليس هو «الاستخدام']){
  if(!compare.includes(marker))fail(`comparison page missing taxonomy marker: ${marker}`);
}
for(const marker of ['classifyAssessmentMeasure','نوع أداة القياس وسياق استخدامها','نوع COA','فصل منهجي','التصنيف يحتاج مراجعة صريحة']){
  if(!detail.includes(marker))fail(`detail page missing taxonomy marker: ${marker}`);
}
if(!taxonomy.includes("other: 'أداة قياس خارج التصنيف الحالي — تتطلب مراجعة صريحة قبل اعتماد النوع'")){
  fail('unclassified object kind must be visibly review-required');
}
if(!fs.existsSync('scripts/assessment-measures-taxonomy-inventory.mjs')) fail('taxonomy inventory report is missing');
if(failed)process.exit(1);

execFileSync(process.execPath,['scripts/assessment-measures-taxonomy-inventory.mjs','--require-all-explicit'],{stdio:'inherit'});
console.log('Assessment Measures taxonomy contract passed: all published measures have explicit reviewed object-type decisions; FDA-aligned COA types remain separated from administration format and intended use.');
