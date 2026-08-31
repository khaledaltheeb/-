import fs from 'node:fs';
const page=fs.readFileSync('app/evidence-guides/als-mnd/[[...slug]]/page.tsx','utf8');
const sitemap=fs.readFileSync('app/sitemaps/als-mnd.xml/route.ts','utf8');
const failures=[];
for(const token of ['فهم ALS/MND','العيش مع ALS/MND','العلاج والرعاية','اتخاذ إجراء','https://www.als-mnd.org/about-us/als-mnd-health-literacy-map/','https://www.als-mnd.org/find-als-mnd-association/','لا يعني أن Alliance راجعته أو اعتمدته']) if(!page.includes(token)) failures.push(`missing: ${token}`);
for(const path of ['/evidence-guides/als-mnd/','/evidence-guides/als-mnd/understanding/','/evidence-guides/als-mnd/living/','/evidence-guides/als-mnd/treatment/','/evidence-guides/als-mnd/action/']) if(!sitemap.includes(path)) failures.push(`sitemap missing: ${path}`);
if(!page.includes("buildSeoMetadata")) failures.push('central SEO metadata contract missing');
if(!page.includes('/content/palliative-care-als-motor-neuron-disease')) failures.push('existing palliative-care content must be reused rather than duplicated');
if(!page.includes('/capabilities/amyotrophic-lateral-sclerosis/')) failures.push('existing capabilities content must be reused rather than duplicated');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('ALS/MND health-literacy contract: PASS');
