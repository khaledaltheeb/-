const base=process.env.SMOKE_BASE_URL||'http://127.0.0.1:3000';
const repoUrl='https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit';
const toolkitPath='/open-source/arabic-rtl-a11y-toolkit';
const routes=[
  {
    path:'/open-source',
    title:'المصدر المفتوح',
    canonical:'https://healthrenewal.org/open-source',
    markers:['Health Renewal / Rawafid','Health Renewal Arabic/RTL Accessibility & Localization Toolkit',toolkitPath,repoUrl],
    schemaTypes:['CollectionPage','BreadcrumbList','ItemList'],
  },
  {
    path:toolkitPath,
    title:'أداة روافد المفتوحة للعربية وRTL والوصولية والتوطين',
    canonical:'https://healthrenewal.org/open-source/arabic-rtl-a11y-toolkit',
    markers:['Rawafid Arabic/RTL Accessibility & Localization Toolkit','@rawafid/arabic-rtl-a11y-toolkit',repoUrl,'Apache-2.0'],
    schemaTypes:['SoftwareSourceCode','BreadcrumbList'],
  },
];
let failed=false;
for(const spec of routes){
  let routeFailed=false;
  const failRoute=(message)=>{console.error(`OPEN_SOURCE ${spec.path}: ${message}`);routeFailed=true;failed=true;};
  try{
    const response=await fetch(`${base}${spec.path}`,{redirect:'manual'});
    const body=await response.text();
    const location=response.headers.get('location')||'';
    if(response.status!==200||location){failRoute(`expected direct 200, got ${response.status} ${location}`);continue;}
    if(/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(body)||String(response.headers.get('x-robots-tag')||'').toLowerCase().includes('noindex')){
      failRoute('canonical project route unexpectedly noindex');
    }
    if(!body.includes(`<link rel="canonical" href="${spec.canonical}"`)&&!body.includes(`<link href="${spec.canonical}" rel="canonical"`)){
      failRoute('canonical link missing or incorrect');
    }
    if(!body.includes(spec.title))failRoute('title marker missing');
    for(const marker of spec.markers){if(!body.includes(marker))failRoute(`required identity marker missing: ${marker}`);}
    for(const type of spec.schemaTypes){if(!body.includes(`\"@type\":\"${type}\"`)&&!body.includes(`&quot;@type&quot;:&quot;${type}&quot;`))failRoute(`JSON-LD type missing: ${type}`);}
    if(!routeFailed)console.log(`OPEN_SOURCE ${spec.path}: 200 + indexable + canonical + identity + JSON-LD verified`);
  }catch(error){failRoute(error?.message||String(error));}
}
if(failed)process.exit(1);
console.log('Health Renewal / Rawafid open-source identity runtime contract passed.');
