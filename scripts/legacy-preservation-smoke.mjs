const base=process.env.SMOKE_BASE_URL||'http://127.0.0.1:3000';
const preservedRoutes=[
  ['/hubs/','من السؤال إلى مسار معرفة وخدمة متكامل',true],
  ['/hubs/angle-001/','القلق: التعريف والمفهوم',true],
  ['/encyclopedia/concept-0001/','تعريف دقيق وسياق الاستخدام',true],
  ['/addiction/','منظومة عربية مؤسسية للإدمان: من الطوارئ إلى التعافي الوظيفي',false],
  ['/addiction/protocol-atlas/','أطلس البروتوكولات العلاجية للإدمان',true],
  ['/family-guide/tools/behavior-log/','سجل السلوك والسياق الوظيفي',true],
];
const upgradedRoutes=[
  ['/quick-info/accountability-vs-self-blame/','تحمل مسؤولية أم جلد ذات'],
];
let failed=false;
for(const [route,marker,requiresPreservedBanner] of preservedRoutes){
  try{
    const response=await fetch(`${base}${route}`,{redirect:'manual'});
    const location=response.headers.get('location')||'';
    const body=await response.text();
    if(response.status!==200||location){console.error(`LEGACY_PRESERVED ${route}: expected real 200 without Location, got ${response.status} ${location}`);failed=true;continue;}
    if(!body.includes(marker)){console.error(`LEGACY_PRESERVED ${route}: original production marker missing`);failed=true;continue;}
    if(requiresPreservedBanner&&!body.includes('نسخة إنتاجية محفوظة')){console.error(`LEGACY_PRESERVED ${route}: fallback preservation status missing`);failed=true;continue;}
    if(!/noindex/i.test(body)){console.error(`LEGACY_PRESERVED ${route}: migrated route must remain noindex until its current review permits indexing`);failed=true;continue;}
    console.log(`LEGACY_PRESERVED ${route}: real content 200 + noindex verified`);
  }catch(error){console.error(`LEGACY_PRESERVED ${route}:`,error);failed=true;}
}
for(const [route,marker] of upgradedRoutes){
  try{
    const response=await fetch(`${base}${route}`,{redirect:'manual'});
    const location=response.headers.get('location')||'';
    const body=await response.text();
    if(response.status!==200||location){console.error(`LEGACY_UPGRADED ${route}: expected real 200 without Location, got ${response.status} ${location}`);failed=true;continue;}
    if(!body.includes(marker)){console.error(`LEGACY_UPGRADED ${route}: reviewed current-content marker missing`);failed=true;continue;}
    if(body.includes('نسخة إنتاجية محفوظة')){console.error(`LEGACY_UPGRADED ${route}: stale fallback preservation banner rendered after reviewed migration`);failed=true;continue;}
    if(/noindex/i.test(body)){console.error(`LEGACY_UPGRADED ${route}: reviewed published route unexpectedly remained noindex`);failed=true;continue;}
    console.log(`LEGACY_UPGRADED ${route}: reviewed current content 200 + indexable verified`);
  }catch(error){console.error(`LEGACY_UPGRADED ${route}:`,error);failed=true;}
}
for(const unknownPath of ['/__legacy_preservation_route_that_never_existed__','/special-needs/__legacy_preservation_route_that_never_existed__']){
  try{
    const response=await fetch(`${base}${unknownPath}`,{redirect:'manual'});
    const body=await response.text();
    if(response.status!==404||!body.includes('الصفحة غير موجودة')){
      console.error(`LEGACY_PRESERVED_UNKNOWN ${unknownPath}: expected direct branded 404, got ${response.status} ${response.headers.get('location')||''}`);failed=true;
    }else console.log(`LEGACY_PRESERVED_UNKNOWN ${unknownPath}: direct branded 404 verified`);
  }catch(error){console.error(`LEGACY_PRESERVED_UNKNOWN ${unknownPath}:`,error);failed=true;}
}
if(failed)process.exit(1);
console.log('Legacy preservation runtime smoke passed: upgraded and fallback production routes render directly, invented routes return true 404 responses.');
