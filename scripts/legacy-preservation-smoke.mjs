const base=process.env.SMOKE_BASE_URL||'http://127.0.0.1:3000';
const preservedRoutes=[
  ['/hubs/','من السؤال إلى مسار معرفة وخدمة متكامل',true,false],
  ['/hubs/angle-001/','القلق: التعريف والمفهوم',true,false],
  ['/encyclopedia/concept-0001/','القلق: ما هو؟ ومتى يتحول من استجابة طبيعية إلى مشكلة تحتاج تقييمًا؟',true,true],
  ['/addiction/protocol-atlas/','أطلس علاج اضطرابات الإدمان: كيف تُبنى الخطة من التقييم إلى التعافي؟',true,true],
  ['/family-guide/tools/behavior-log/','سجل السلوك والسياق الوظيفي',true,true],
];
const upgradedRoutes=[
  ['/quick-info/accountability-vs-self-blame/','تحمل مسؤولية أم جلد ذات'],
  ['/addiction/','منظومة عربية مؤسسية للإدمان: من الطوارئ إلى التعافي الوظيفي'],
];
let failed=false;
for(const [route,marker,requiresPreservedBanner,expectsIndexable] of preservedRoutes){
  try{
    const response=await fetch(`${base}${route}`,{redirect:'manual'});
    const location=response.headers.get('location')||'';
    const body=await response.text();
    if(response.status!==200||location){console.error(`LEGACY_PRESERVED ${route}: expected real 200 without Location, got ${response.status} ${location}`);failed=true;continue;}
    if(!body.includes(marker)){console.error(`LEGACY_PRESERVED ${route}: original production marker missing`);failed=true;continue;}
    if(requiresPreservedBanner&&!body.includes('نسخة إنتاجية محفوظة')){console.error(`LEGACY_PRESERVED ${route}: fallback preservation status missing`);failed=true;continue;}
    const hasNoindex=/noindex/i.test(body);
    if(expectsIndexable&&hasNoindex){console.error(`LEGACY_PRESERVED ${route}: published preserved route unexpectedly remained noindex`);failed=true;continue;}
    if(!expectsIndexable&&!hasNoindex){console.error(`LEGACY_PRESERVED ${route}: non-published preserved route unexpectedly became indexable`);failed=true;continue;}
    console.log(`LEGACY_PRESERVED ${route}: real content 200 + ${expectsIndexable?'indexable published-content':'noindex preserved snapshot'} verified`);
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
console.log('Legacy preservation runtime smoke passed: published fallback content is indexable, preserved snapshots keep noindex, reviewed current routes render directly, and invented routes return true 404 responses.');
