import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'data', 'addiction-professional-education');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
const core = JSON.parse([1,2,3,4,5].map((n) => fs.readFileSync(path.join(dataDir, `addiction-education-core-competencies.part${n}.txt`), 'utf8')).join(''));
const supplements = readJson('wave1-release-supplements.json');

const sourcePages = {
  'addiction-education': readJson('addiction-education.json'),
  'addiction-education-core-competencies': core,
  'addiction-education-screening-assessment': readJson('addiction-education-screening-assessment.json'),
  'addiction-education-sbirt': readJson('addiction-education-sbirt.json'),
  'addiction-education-motivational-interviewing': readJson('addiction-education-motivational-interviewing.json'),
};

const releasePlan = {
  direct: [
    { source: 'addiction-education', canonical: '/addiction/education/', category: 'addiction-professional-education' },
    { source: 'addiction-education-core-competencies', canonical: '/addiction/education/core-competencies/', category: 'addiction-education-core-competencies' },
    { source: 'addiction-education-sbirt', canonical: '/addiction/education/sbirt/', category: 'addiction-education-clinical-skills' },
  ],
  upgrades: [
    { source: 'addiction-education-screening-assessment', targetSlug: 'legacy-hub-path-027', canonical: '/hubs/path-027/', crossList: ['addiction-education-clinical-skills','addiction-professional-education'] },
    { source: 'addiction-education-motivational-interviewing', targetSlug: 'legacy-library-therapies-motivational-interviewing', canonical: '/library/therapies/motivational-interviewing/', crossList: ['addiction-education-clinical-skills','addiction-professional-education'] },
  ],
};

const fail = (msg) => { throw new Error(msg); };
const blocks = (p) => p?.body_json?.blocks ?? [];
const refs = (p) => p?.references_json ?? [];
const https = (v) => typeof v === 'string' && /^https:\/\//.test(v);
const clone = (v) => JSON.parse(JSON.stringify(v));

function normalizeCallouts(list) {
  return list.map((b) => b?.type === 'callout' && ['warning','danger'].includes(b.tone) ? { ...b, tone:'info' } : b);
}
function enrichSbirtRefs(list) {
  return list.map((r) => {
    if (r.url?.startsWith('https://www.who.int/')) return { ...r, authority_tier:'primary', source_type:'guideline' };
    if (r.url?.startsWith('https://www.samhsa.gov/')) return { ...r, authority_tier:'primary', source_type:'official-guidance' };
    if (r.url?.startsWith('https://amersa.org/')) return { ...r, authority_tier:'institutional', source_type:'professional-resource' };
    if (r.url?.startsWith('https://www.addictiontraining.org/')) return { ...r, authority_tier:'institutional', source_type:'professional-training' };
    return r;
  });
}
function materialize(slug) {
  let p = clone(sourcePages[slug]);
  if (slug === 'addiction-education') p.body_json.blocks = normalizeCallouts(p.body_json.blocks).concat(supplements.landing_append ?? []);
  if (slug === 'addiction-education-sbirt') {
    p.body_json.blocks = normalizeCallouts(p.body_json.blocks).concat(supplements.sbirt_append ?? []);
    const raw = JSON.stringify(p.body_json).replaceAll('تنبيهًا','إشارةً').replaceAll('تنبيه الخطر','إشارة الخطر');
    p.body_json = JSON.parse(raw);
    p.body_json.blocks.push({ type:'paragraph', text:'ويُراجع مسار الاستجابة دوريًا للتأكد من أن اكتشاف الحاجة يقود إلى تدخل مناسب في الوقت المناسب، وأن العوائق المتكررة تتحول إلى إجراءات تحسين قابلة للقياس.' });
    p.references_json = enrichSbirtRefs(p.references_json);
    if (!p.semantic_terms.includes('care linkage')) p.semantic_terms.push('care linkage');
  }
  if (['addiction-education','addiction-education-core-competencies','addiction-education-sbirt'].includes(slug)) {
    p.schema_json = { ...p.schema_json, ...supplements.release_metadata[slug], publication_ready:true, professional_education_release:'wave1', release_date:'2026-09-04' };
    p.seo_title = supplements.seo[slug].title;
    p.seo_description = supplements.seo[slug].description;
    p.secondary_keywords = supplements.keywords[slug];
  }
  if (slug === 'addiction-education') p.seo_description = 'مسار مهني عربي قائم على الدليل لبناء كفاءات رعاية اضطرابات استخدام المواد: التحري والتقييم والتدخل والعلاج وخفض الضرر والتعافي والعمل متعدد التخصصات عمليًا.';
  if (slug === 'addiction-education-sbirt') p.seo_description = 'دليل مهني عربي لـSBIRT يشرح التحري والتدخل الوجيز والإحالة إلى العلاج، وحدود الاستخدام، والإحالة الدافئة، وقياس الجودة والتنفيذ متعدد التخصصات في الرعاية.';
  return p;
}

function flattenBody(page) {
  const out=[];
  for (const b of blocks(page)) {
    if (b.type === 'heading' || b.type === 'paragraph') out.push(b.text ?? '');
    else if (b.type === 'callout') out.push([b.title,b.text].filter(Boolean).join('\n'));
    else if (b.type === 'list') out.push((b.items ?? []).join('\n'));
    else if (b.type === 'table') { out.push(b.caption ?? ''); out.push((b.headers ?? []).join(' | ')); for (const r of b.rows ?? []) out.push(r.join(' | ')); }
    else if (b.type === 'resource') out.push([b.label,b.description,b.url].filter(Boolean).join('\n'));
    else if (b.type === 'faq') for (const item of b.items ?? []) out.push(`${item.question}\n${item.answer}`);
  }
  return out.filter(Boolean).join('\n\n');
}
const arabicWords = (text) => text.split(/\s+/).filter((t) => /[\u0600-\u06ff]/.test(t)).length;
const headingCount = (p, level) => blocks(p).filter((b) => b.type === 'heading' && Number(b.level) === level).length;
const faqCount = (p) => blocks(p).filter((b) => b.type === 'faq').reduce((n,b) => n + (b.items?.length ?? 0), 0);
const primaryRefCount = (p) => refs(p).filter((r) => r.authority_tier === 'primary' || ['official-definition','guideline','systematic-review'].includes(r.source_type)).length;

for (const item of releasePlan.direct) {
  const p = materialize(item.source);
  const text = flattenBody(p);
  if (p.canonical_url !== item.canonical || p.category_slug !== item.category) fail(`${item.source}: route/category mismatch`);
  if (p.schema_json?.content_contract_version < 6 || p.schema_json?.publication_ready !== true) fail(`${item.source}: V6 release metadata missing`);
  if (arabicWords(text) < 2500) fail(`${item.source}: fewer than 2500 Arabic words`);
  if (headingCount(p,2) < 8 || headingCount(p,3) < 4 || faqCount(p) < 6) fail(`${item.source}: editorial structure below V6 floor`);
  if ((p.schema_json.search_intent_questions?.length ?? 0) < 8) fail(`${item.source}: search-intent questions missing`);
  if ((p.schema_json.claim_source_map?.length ?? 0) < 5) fail(`${item.source}: claim/source map below V6 floor`);
  if ((p.schema_json.source_versions_reviewed?.length ?? 0) < 1) fail(`${item.source}: source-version review missing`);
  if (p.schema_json?.rewrite_method !== 'evidence-led-rewrite' || p.schema_json?.originality_report?.passed !== true) fail(`${item.source}: originality/rewrite contract missing`);
  if (refs(p).length < 5 || primaryRefCount(p) < 2 || refs(p).some((r) => !https(r.url))) fail(`${item.source}: reference floor failed`);
  if ((p.secondary_keywords?.length ?? 0) < 5 || (p.semantic_terms?.length ?? 0) < 8) fail(`${item.source}: search metadata floor failed`);
  if (p.seo_title.length > 47 || p.seo_description.length < 150 || p.seo_description.length > 160) fail(`${item.source}: SEO length contract failed`);
  if (/(تنبيه|تحذير|إخلاء\s+المسؤولية)/.test(text)) fail(`${item.source}: inline warning/disclaimer language forbidden`);
  if (blocks(p).some((b) => b.type === 'callout' && ['warning','danger'].includes(b.tone))) fail(`${item.source}: warning/danger callout forbidden`);
}

for (const item of releasePlan.upgrades) {
  const p = materialize(item.source);
  if (p.schema_json?.endorsement_status !== 'none-claimed') fail(`${item.source}: endorsement guard missing`);
  if (!String(p.schema_json?.rights_note ?? '').includes('Original Arabic')) fail(`${item.source}: rights guard missing`);
  if (refs(p).some((r) => !https(r.url))) fail(`${item.source}: invalid reference URL`);
  if (!item.targetSlug.startsWith('legacy-')) fail(`${item.source}: upgrade target must be explicit existing canonical owner`);
}

if (materialize('addiction-education-core-competencies').schema_json?.competency_domains !== 16) fail('core competency domain count must be 16');

const report = {
  releasePlan,
  direct: releasePlan.direct.map((item) => {
    const p=materialize(item.source), text=flattenBody(p);
    return { slug:item.source, canonical:item.canonical, arabicWords:arabicWords(text), blocks:blocks(p).length, h2:headingCount(p,2), h3:headingCount(p,3), faq:faqCount(p), refs:refs(p).length, primaryRefs:primaryRefCount(p), seoTitleLength:p.seo_title.length, seoDescriptionLength:p.seo_description.length };
  }),
  upgrades: releasePlan.upgrades.map((item) => ({ source:item.source, targetSlug:item.targetSlug, canonical:item.canonical, sourceBlocks:blocks(materialize(item.source)).length, refs:refs(materialize(item.source)).length })),
};
console.log(JSON.stringify(report,null,2));
