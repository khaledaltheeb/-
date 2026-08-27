const base=process.env.SMOKE_BASE_URL||'http://127.0.0.1:3000';
const preservedRoutes=[
  ['/hubs/','من السؤال إلى مسار معرفة وخدمة متكامل',true],
  ['/hubs/angle-001/','القلق: التعريف والمفهوم',true],
];
const upgradedRoutes=[
  ['/quick-info/accountability-vs-self-blame/','تحمل مسؤولية أم جلد ذات'],
  ['/addiction/','منظومة عربية مؤسسية للإدمان: من الطوارئ إلى التعافي الوظيفي'],
  ['/encyclopedia/concept-0001/','القلق: ما هو؟ ومتى يتحول من استجابة طبيعية إلى مشكلة تحتاج تقييمًا؟'],
  ['/addiction/protocol-atlas/','أطلس علاج اضطرابات الإدمان: كيف تُبنى الخطة من التقييم إلى التعافي؟'],
  ['/family-guide/tools/behavior-log/','سجل السلوك والسياق الوظيفي'],
];
const exactCanonicalRoutes=[
  ['/sections/research-evidence-learning/diagnostic-accuracy-advanced/','قراءة متقدمة: دقة الاختبارات التشخيصية'],
  ['/sections/research-evidence-learning/reliability-application/','التطبيق في الواقع: الثبات'],
  ['/sections/research-evidence-learning/validity-advanced/','قراءة متقدمة: الصدق'],
  ['/specialists-partners/verification.html','سياسة التحقق من المختصين والمراكز'],
];
const linkAttr=(html,rel)=>{
  for(const tag of html.match(/<link\b[^>]*>/gi)||[]){
    const relMatch=tag.match(/\srel\s*=\s*(["'])(.*?)\1/i);
    if(!relMatch||!relMatch[2].toLowerCase().split(/\s+/).includes(rel))continue;
    const hrefMatch=tag.match(/\shref\s*=\s*(["'])(.*?)\1/i);
    if(hrefMatch)return hrefMatch[2].trim();
  }
  return '';
};
const normalizedPath=(value)=>{try{const url=new URL(value,base);if(url.pathname==='/')return '/';return url.pathname.toLowerCase().endsWith('.html')?url.pathname:`${url.pathname.replace(/\/+$/,'')}/`;}catch{return '';}};
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
for(const [route,marker] of exactCanonicalRoutes){
  try{
    const response=await fetch(`${base}${route}`,{redirect:'manual'});
    const location=response.headers.get('location')||'';
    const body=await response.text();
    const canonical=linkAttr(body,'canonical');
    if(response.status!==200||location){console.error(`LEGACY_CANONICAL ${route}: expected real 200 without Location, got ${response.status} ${location}`);failed=true;continue;}
    if(!body.includes(marker)){console.error(`LEGACY_CANONICAL ${route}: expected current record marker missing`);failed=true;continue;}
    if(body.includes('نسخة إنتاجية محفوظة')){console.error(`LEGACY_CANONICAL ${route}: stale fallback preservation banner rendered`);failed=true;continue;}
    if(/noindex/i.test(body)){console.error(`LEGACY_CANONICAL ${route}: reviewed published route unexpectedly noindex`);failed=true;continue;}
    if(normalizedPath(canonical)!==route){console.error(`LEGACY_CANONICAL ${route}: canonical mismatch ${canonical||'(missing)'}`);failed=true;continue;}
    console.log(`LEGACY_CANONICAL ${route}: exact published record + self canonical verified`);
  }catch(error){console.error(`LEGACY_CANONICAL ${route}:`,error);failed=true;}
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
console.log('Legacy preservation runtime smoke passed: reviewed canonical takeovers are indexable and self-canonical, unreviewed fallbacks stay noindex, and invented routes return true 404 responses.');
