const base=process.env.SMOKE_BASE_URL||'http://127.0.0.1:3000';
const preservedRoutes=[
  ['/hubs/','من السؤال إلى مسار معرفة وخدمة متكامل'],
  ['/hubs/angle-001/','القلق: التعريف والمفهوم'],
  ['/encyclopedia/concept-0001/','تعريف دقيق وسياق الاستخدام'],
  ['/quick-info/accountability-vs-self-blame/','تحمل مسؤولية أم جلد ذات'],
  ['/addiction/protocol-atlas/','أطلس البروتوكولات العلاجية للإدمان'],
  ['/family-guide/tools/behavior-log/','سجل السلوك والسياق الوظيفي'],
];
let failed=false;
for(const [route,marker] of preservedRoutes){
  try{
    const response=await fetch(`${base}${route}`,{redirect:'manual'});
    const location=response.headers.get('location')||'';
    const body=await response.text();
    if(response.status!==200||location){console.error(`LEGACY_PRESERVED ${route}: expected real 200 without Location, got ${response.status} ${location}`);failed=true;continue;}
    if(!body.includes(marker)||!body.includes('نسخة إنتاجية محفوظة')){console.error(`LEGACY_PRESERVED ${route}: original production marker or preservation status missing`);failed=true;continue;}
    if(!/noindex/i.test(body)){console.error(`LEGACY_PRESERVED ${route}: preserved page must remain noindex until current review`);failed=true;continue;}
    console.log(`LEGACY_PRESERVED ${route}: real content 200 + noindex verified`);
  }catch(error){console.error(`LEGACY_PRESERVED ${route}:`,error);failed=true;}
}
try{
  const unknownPath='/__legacy_preservation_route_that_never_existed__/';
  const canonicalPath=unknownPath.replace(/\/+$/,'');
  const response=await fetch(`${base}${unknownPath}`,{redirect:'manual'});
  if(response.status===404){
    console.log('LEGACY_PRESERVED_UNKNOWN: direct 404 verified');
  }else if(response.status===308){
    const location=response.headers.get('location')||'';
    const target=new URL(location,base);
    const expectedBase=new URL(base);
    if(target.origin!==expectedBase.origin||target.pathname!==canonicalPath||target.search||target.hash){
      console.error(`LEGACY_PRESERVED_UNKNOWN: unexpected normalization target ${location}`);failed=true;
    }else{
      const canonicalResponse=await fetch(target,{redirect:'manual'});
      if(canonicalResponse.status!==404){console.error(`LEGACY_PRESERVED_UNKNOWN: normalized target expected 404, got ${canonicalResponse.status}`);failed=true;}
      else console.log('LEGACY_PRESERVED_UNKNOWN: 308 canonical normalization + final 404 verified');
    }
  }else{
    console.error(`LEGACY_PRESERVED_UNKNOWN: expected 404 or canonical 308, got ${response.status}`);failed=true;
  }
}catch(error){console.error('LEGACY_PRESERVED_UNKNOWN:',error);failed=true;}
if(failed)process.exit(1);
console.log('Legacy preservation runtime smoke passed.');
