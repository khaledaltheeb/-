import fs from 'node:fs';
const page=fs.readFileSync('app/accessibility/audit/page.tsx','utf8');
const sitemap=fs.readFileSync('app/sitemaps/static.xml/route.ts','utf8');
for(const phrase of ['لوحة المفاتيح','قارئ الشاشة','لا نعتمد على اللون وحده','نص الرابط يصف الوجهة','PDF','WCAG 2.2 AA','Sightsavers — Accessibility Pack','لا تعني مراجعة Sightsavers']) if(!page.includes(phrase)) throw new Error(`missing accessibility safeguard: ${phrase}`);
if(!page.includes('https://www.sightsavers.org/brand-book/accessibility-pack/')) throw new Error('Sightsavers canonical source missing');
if(!page.includes('https://www.w3.org/WAI/standards-guidelines/wcag/')) throw new Error('WCAG canonical source missing');
if(!sitemap.includes("'/accessibility/audit/'")) throw new Error('accessibility audit missing from static sitemap');
console.log('Sightsavers-informed accessibility audit contract passed');
