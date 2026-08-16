const base=process.env.SMOKE_BASE_URL||'http://127.0.0.1:3000';
const landings=[
 '/', '/about/', '/accessibility-statement/', '/accessibility/', '/assessments/', '/audiences/',
 '/capabilities/expanded/', '/categories/%D8%A7%D9%84%D8%AF%D8%A7%D9%81%D8%B9%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%B3%D9%84%D9%88%D9%83/',
 '/cochrane/evidence-academy/', '/cochrane/', '/cognitive-tests/', '/en/', '/encyclopedia/all/', '/encyclopedia/', '/es/', '/family/',
 '/iris/cited-guides/', '/iris/', '/learning-paths/', '/library/', '/magazine/', '/outside-the-box/', '/quick-info/', '/schools/', '/sections/',
 '/sectors/all-pages/', '/sectors/calendars/', '/sectors/home/', '/sectors/', '/sectors/women/', '/sectors/youth/', '/services/', '/source-registry/',
 '/specialists-partners/', '/start-here/', '/terms/', '/tips/', '/trust/', '/verified-resources/'
];
let failed=false;
if(landings.length!==39){console.error(`LANDING_SMOKE: expected 39 routes, got ${landings.length}`);failed=true;}
for(const route of landings){
 try{
  const response=await fetch(`${base}${route}`,{redirect:'manual'});
  const location=response.headers.get('location')||'';
  const body=await response.text();
  if(response.status!==200||location){console.error(`LANDING ${route}: expected direct 200 with no Location, got ${response.status} ${location}`);failed=true;continue;}
  if(body.length<600||!/<h1[\s>]/i.test(body)){console.error(`LANDING ${route}: body too shallow or missing h1 (${body.length})`);failed=true;continue;}
  console.log(`LANDING ${route}: direct 200 content verified (${body.length})`);
 }catch(error){console.error(`LANDING ${route}:`,error);failed=true;}
}
if(failed)process.exit(1);
console.log('All 39 historical landing routes render real content in place with no migration redirect.');
