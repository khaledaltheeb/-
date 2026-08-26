const base=process.env.SMOKE_BASE_URL||'http://127.0.0.1:3000';
const repoUrl='https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit';
const routes=[
  {
    path:'/open-source',
    title:'المصدر المفتوح',
    canonical:'https://healthrenewal.org/open-source',
    markers:['Health Renewal · Open Source','Arabic/RTL Accessibility & Localization Toolkit',repoUrl],
    schemaTypes:['CollectionPage','SoftwareSourceCode'],
  },
  {
    path:'/open-source/arabic-rtl-a11y-toolkit',
    title:'Arabic/RTL Accessibility & Localization Toolkit',
    canonical:'https://healthrenewal.org/open-source/arabic-rtl-a11y-toolkit',
    markers:['Health Renewal Open Source','@rawafid/arabic-rtl-a11y-toolkit',repoUrl,'Apache-2.0'],
    schemaTypes:['SoftwareSourceCode','BreadcrumbList'],
  },
];
let failed=false;
for(const spec of routes){
  try{
    const response=await fetch(`${base}${spec.path}`,{redirect:'manual'});
    const body=await response.text();
    const location=response.headers.get('location')||'';
    if(response.status!==200||location){console.error(`OPEN_SOURCE ${spec.path}: expected direct 200, got ${response.status} ${location}`);failed=true;continue;}
    if(/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(body)||String(response.headers.get('x-robots-tag')||'').toLowerCase().includes('noindex')){
      console.error(`OPEN_SOURCE ${spec.path}: canonical project route unexpectedly noindex`);failed=true;
    }
    if(!body.includes(`<link rel="canonical" href="${spec.canonical}"`)&&!body.includes(`<link href="${spec.canonical}" rel="canonical"`)){
      console.error(`OPEN_SOURCE ${spec.path}: canonical link missing or incorrect`);failed=true;
    }
    if(!body.includes(spec.title)){console.error(`OPEN_SOURCE ${spec.path}: title marker missing`);failed=true;}
    for(const marker of spec.markers){if(!body.includes(marker)){console.error(`OPEN_SOURCE ${spec.path}: required identity marker missing: ${marker}`);failed=true;}}
    for(const type of spec.schemaTypes){if(!body.includes(`\"@type\":\"${type}\"`)&&!body.includes(`&quot;@type&quot;:&quot;${type}&quot;`)){console.error(`OPEN_SOURCE ${spec.path}: JSON-LD type missing: ${type}`);failed=true;}}
    console.log(`OPEN_SOURCE ${spec.path}: 200 + indexable + canonical + identity + JSON-LD verified`);
  }catch(error){console.error(`OPEN_SOURCE ${spec.path}:`,error);failed=true;}
}
if(failed)process.exit(1);
console.log('Health Renewal open-source identity runtime contract passed.');
