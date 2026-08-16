const base=process.env.SMOKE_BASE_URL||'http://127.0.0.1:3000';
let failed=false;
async function fetchInPlace(route,marker){
 try{
  const response=await fetch(`${base}${encodeURI(route)}`,{redirect:'manual'});
  const location=response.headers.get('location')||'';
  const body=await response.text();
  if(response.status!==200||location){console.error(`PARITY ${route}: expected direct 200, got ${response.status} ${location}`);failed=true;return;}
  if(marker&&!body.includes(marker)){console.error(`PARITY ${route}: missing functional marker ${marker}`);failed=true;return;}
  if(body.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().length<180){console.error(`PARITY ${route}: response too shallow`);failed=true;return;}
 }catch(error){console.error(`PARITY ${route}:`,error);failed=true;}
}
const index=await fetch(`${base}/daily-tools/`,{redirect:'manual'});const indexBody=await index.text();
if(index.status!==200||index.headers.get('location')){console.error(`PARITY /daily-tools/: expected direct 200, got ${index.status}`);failed=true;}
const toolRoutes=[...new Set([...indexBody.matchAll(/href=["'](\/daily-tools\/[^/"'#?]+\/)["']/g)].map(match=>match[1]))].sort();
if(toolRoutes.length!==150){console.error(`PARITY daily-tools directory: expected 150 tools, found ${toolRoutes.length}`);failed=true;}
for(let i=0;i<toolRoutes.length;i+=10){await Promise.all(toolRoutes.slice(i,i+10).map(route=>fetchInPlace(route,'أداة يومية محلية غير تشخيصية')));}
for(const route of ['/assessments/gad-7/','/assessments/phq-9/','/assessments/who-5/'])await fetchInPlace(route,'فحص ذاتي محلي');
for(const route of ['/cognitive-tests/digit-span/','/cognitive-tests/matrix-reasoning/','/cognitive-tests/n-back/','/cognitive-tests/number-series/','/cognitive-tests/reaction-time/','/cognitive-tests/spatial-rotation/','/cognitive-tests/stroop/','/cognitive-tests/verbal-analogies/'])await fetchInPlace(route,'نسخة المسار التاريخي');
if(failed)process.exit(1);
console.log(`Historical functional parity smoke passed: ${toolRoutes.length} daily tools + 3 assessments + 8 cognitive tests all render in place.`);
