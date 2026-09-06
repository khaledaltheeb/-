import { mkdir, writeFile } from 'node:fs/promises';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';
const strictCritical = process.argv.includes('--strict-critical') || process.argv.includes('--strict-all');
const strictAll = process.argv.includes('--strict-all');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Magazine audit requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  process.exit(2);
}

const params = new URLSearchParams();
params.set('select', 'id,canonical_url,title,excerpt,body_text,body_json,references_json,schema_json,seo_title,seo_description,medical_disclaimer,last_reviewed_at,status,content_type');
params.set('canonical_url', 'like./magazine/*');
params.set('status', 'eq.published');
params.set('limit', '1000');

const response = await fetch(`${SUPABASE_URL}/rest/v1/content?${params}`, {
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Accept: 'application/json',
  },
});

if (!response.ok) {
  console.error(`Magazine audit query failed: HTTP ${response.status}`);
  console.error(await response.text());
  process.exit(2);
}

const rows = await response.json();

function blocksOf(row) {
  return Array.isArray(row?.body_json?.blocks) ? row.body_json.blocks : [];
}

function collectText(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectText(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectText(item, out));
  return out;
}

function normalizedText(row) {
  return [row.body_text || '', ...collectText(row.body_json)].join('\n').replace(/\s+/g, ' ').trim();
}

function wordCount(value) {
  if (typeof value !== 'string' || !value.trim()) return 0;
  return value.match(/[\p{L}\p{N}]+/gu)?.length || 0;
}

function usefulWordCount(row) {
  const bodyWords = wordCount(row.body_text || '');
  const structuredWords = wordCount(collectText(row.body_json).join(' '));
  return Math.max(bodyWords, structuredWords);
}

function containsAny(text, patterns) {
  const lower = String(text || '').toLocaleLowerCase('ar');
  return patterns.some((pattern) => lower.includes(pattern.toLocaleLowerCase('ar')));
}

function validHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function canonicalizeUrl(value) {
  if (!validHttpUrl(value)) return '';
  const url = new URL(value);
  url.hash = '';
  return url.toString().replace(/\/$/, '').toLowerCase();
}

function refUrls(row) {
  return Array.isArray(row.references_json)
    ? row.references_json.map((ref) => ref?.url).filter(validHttpUrl)
    : [];
}

function duplicateTextBlocks(blocks) {
  const seen = new Map();
  const duplicates = [];
  for (const block of blocks) {
    if (!block || !['paragraph', 'callout'].includes(block.type) || typeof block.text !== 'string') continue;
    const key = block.text.replace(/\s+/g, ' ').trim().toLowerCase();
    if (key.length < 90) continue;
    const count = (seen.get(key) || 0) + 1;
    seen.set(key, count);
    if (count === 2) duplicates.push(block.text.slice(0, 90));
  }
  return duplicates;
}

function highStakesPage(row, evidence) {
  if (String(row.canonical_url || '').startsWith('/magazine/pediatric-oncology/')) return true;
  const marker = [row.title || '', row.canonical_url || '', evidence || ''].join(' ');
  return containsAny(marker, [
    'سرطان', 'ورم', 'انتحار', 'إيذاء النفس', 'جرعة زائدة', 'أفيون', 'opioid',
    'كحول', 'اضطراب استخدام', 'دواء', 'دوائي', 'pharmac', 'ssri', 'رعاية تلطيفية',
  ]);
}

function auditRow(row) {
  const blocks = blocksOf(row);
  const text = normalizedText(row);
  const words = usefulWordCount(row);
  const refs = refUrls(row);
  const source = row?.schema_json?.source_url || '';
  const evidence = String(row?.schema_json?.evidence_kind || '').trim();
  const legacy = Boolean(row?.schema_json?.legacy_source_html);
  const critical = [];
  const warnings = [];

  if (!row.title?.trim()) critical.push('missing title');
  if (!row.canonical_url?.startsWith('/magazine/')) critical.push('invalid magazine canonical');
  if (!text || words < 120) critical.push(`empty/thin rendered content (${words} words)`);
  if (blocks.length < 8 && words < 900) critical.push(`too little structured depth (${blocks.length} blocks; ${words} words)`);
  if (!validHttpUrl(source)) critical.push('missing/invalid primary source URL');
  if (!refs.length) critical.push('no valid reference URLs');
  if (!row.seo_title?.trim()) critical.push('missing SEO title');
  if (!row.seo_description?.trim()) critical.push('missing SEO description');

  if (validHttpUrl(source) && refs.length) {
    const sourceKey = canonicalizeUrl(source);
    const sourceHost = new URL(source).hostname.replace(/^www\./, '');
    const sourcePresent = refs.some((ref) => {
      const key = canonicalizeUrl(ref);
      if (key === sourceKey) return true;
      try {
        const host = new URL(ref).hostname.replace(/^www\./, '');
        return sourceHost === 'doi.org' && (host === 'doi.org' || key.includes(source.split('doi.org/')[1]?.toLowerCase() || '__none__'));
      } catch {
        return false;
      }
    });
    if (!sourcePresent) warnings.push('primary source not represented clearly in references');
  }

  if (refs.length < 3) warnings.push(`fewer than 3 source records (${refs.length})`);
  if (blocks.length < 20 && words < 1200) warnings.push(`short structured article (${blocks.length} blocks; ${words} words)`);
  if (!row.excerpt?.trim()) warnings.push('missing excerpt');
  if (highStakesPage(row, evidence) && !row.medical_disclaimer?.trim()) warnings.push('missing high-stakes health disclaimer');
  if (!evidence) warnings.push('missing evidence classification');
  if (['مراجعة بحثية', 'دراسة بحثية'].includes(evidence)) warnings.push(`generic evidence classification: ${evidence}`);

  if (!containsAny(text, ['ما السؤال', 'سؤال البحث', 'السؤال البحثي', 'ماذا بحثت', 'ماذا اختبرت', 'ما الذي اختبر', 'هدف الدراسة', 'هدف البحث', 'الغرض', 'هدفت', 'سعى'])) warnings.push('research question/aim not explicit');
  if (!containsAny(text, ['المنهج', 'المنهجية', 'كيف بُنيت', 'كيف بنيت', 'كيف جُمعت', 'كيف جمعت', 'كيف أُجريت', 'كيف أجريت', 'طريقة البحث', 'تصميم الدراسة', 'تصميم التجربة', 'التصميم'])) warnings.push('methods/design not explicit');
  if (!containsAny(text, ['حدود', 'قيود', 'محدودية', 'limitations'])) warnings.push('limitations not explicit');
  if (!containsAny(text, ['ما الذي لا تثبت', 'ما الذي لا يثبت', 'لا تثبت', 'لا يثبت', 'لا تعني', 'لا يعني', 'لا تسمح', 'لا يمكن استنتاج', 'لا يمكن أن نستنتج'])) warnings.push('anti-overclaim section not explicit');
  if (!containsAny(text, ['الدلالة', 'التطبيق', 'عملي', 'قائمة تدقيق', 'ماذا يعني ذلك', 'ماذا تعني', 'للمؤسسات', 'للمدارس', 'للأسر', 'القرار', 'توصيات'])) warnings.push('practical interpretation not explicit');
  if (!containsAny(text, ['أسئلة شائعة']) && !blocks.some((b) => b?.type === 'faq')) warnings.push('FAQ absent');
  if (!containsAny(text, ['المصدر الأصلي', 'المقال الأصلي', 'الورقة الأصلية', 'بيانات التوثيق', 'doi', 'pmid', 'المراجع'])) warnings.push('primary-source section not explicit');

  // Evidence-specific rules must be derived from the page classification, not from
  // incidental mentions of other study types in background text or references.
  const isProtocol = /بروتوكول|protocol/i.test(evidence);
  const isMeta = !/دون\s+تحليل\s+تلوي|without\s+(a\s+)?meta[- ]?analysis/i.test(evidence) && /تلوي|meta/i.test(evidence);
  const isNetworkMeta = isMeta && /شبكي|network/i.test(evidence);
  const isSystematic = /منهجي|systematic/i.test(evidence);
  const isScoping = /نطاقي|scoping/i.test(evidence);
  const isTrial = !isProtocol && !isSystematic && !isMeta && !isScoping && /عشوائي|random|trial/i.test(evidence);
  const isObservational = /أتراب|مقطعي|حالات وشواهد|رصد|سجلي|cohort|cross-sectional|case-control|observational|registry/i.test(evidence);

  if ((isSystematic || isMeta || isScoping) && !containsAny(text, ['قاعدة', 'قواعد', 'pubmed', 'medline', 'embase', 'cinahl', 'scopus', 'cochrane', 'بحثت', 'بُحثت', 'البحث في', 'مصادر البحث'])) warnings.push('review search scope/databases not explicit');
  if (isMeta && !containsAny(text, ['فاصل ثقة', 'فاصل مصداقية', '95%', 'ci ', 'cri '])) warnings.push('meta-analysis uncertainty interval not explicit');
  if (isMeta && !containsAny(text, ['i²', 'i2', 'عدم التجانس', 'التباين بين الدراسات', 'heterogeneity', 'عدم الاتساق', 'inconsistency', 'transitivity', 'الاتساق الشبكي'])) warnings.push(isNetworkMeta ? 'network meta-analysis heterogeneity/inconsistency not explicit' : 'meta-analysis heterogeneity not explicit');
  if (isMeta && !containsAny(text, ['تحيز', 'risk of bias', 'grade', 'يقين', 'جودة الدليل', 'certainty'])) warnings.push('meta-analysis bias/certainty not explicit');
  if (isTrial && !containsAny(text, ['مجموعة', 'ضابط', 'الرعاية المعتادة', 'مقارنة', 'مقارن', 'control', 'comparator'])) warnings.push('trial comparator not explicit');
  if (isTrial && !containsAny(text, ['متابعة', 'أسبوع', 'شهر', 'follow-up', 'follow up', 'نقطة زمنية'])) warnings.push('trial follow-up/time point not explicit');
  if (isObservational && !containsAny(text, ['لا تثبت السببية', 'لا يثبت السببية', 'لا تثبت أن', 'ارتباط', 'association', 'caus'])) warnings.push('observational causality boundary not explicit');
  if (isScoping && containsAny(text, ['الأفضل', 'الأكثر فعالية', 'يتفوق']) && !containsAny(text, ['لا تثبت', 'لا يعني', 'لا تعني', 'لا يمكن'])) warnings.push('scoping review may imply comparative effectiveness');

  const duplicates = duplicateTextBlocks(blocks);
  if (duplicates.length) warnings.push(`duplicate long blocks (${duplicates.length})`);

  const riskyClaims = ['يعالج نهائيًا', 'يشفي نهائيًا', 'مضمون 100%', 'يضمن العلاج', 'يمنع تمامًا'];
  if (containsAny(text, riskyClaims)) critical.push('unsafe/absolute health claim detected');

  const score = Math.max(0, 100 - critical.length * 20 - warnings.length * 4);
  return {
    id: row.id,
    canonical_url: row.canonical_url,
    title: row.title,
    evidence_kind: evidence,
    legacy,
    block_count: blocks.length,
    word_count: words,
    reference_count: refs.length,
    last_reviewed_at: row.last_reviewed_at,
    score,
    critical,
    warnings,
  };
}

const audits = rows.map(auditRow).sort((a, b) => a.score - b.score || a.canonical_url.localeCompare(b.canonical_url));
const criticalPages = audits.filter((item) => item.critical.length);
const warningPages = audits.filter((item) => item.warnings.length);
const legacyPages = audits.filter((item) => item.legacy);
const scores = audits.map((item) => item.score);
const summary = {
  generated_at: new Date().toISOString(),
  published_pages: audits.length,
  legacy_pages: legacyPages.length,
  critical_pages: criticalPages.length,
  warning_pages: warningPages.length,
  pages_at_100: audits.filter((item) => item.score === 100).length,
  minimum_score: scores.length ? Math.min(...scores) : 0,
  average_score: scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0,
};

await mkdir('artifacts', { recursive: true });
await writeFile('artifacts/magazine-quality-audit.json', JSON.stringify({ summary, audits }, null, 2) + '\n');

const md = [
  '# Magazine Quality Audit',
  '',
  `Generated: ${summary.generated_at}`,
  '',
  `- Published pages: **${summary.published_pages}**`,
  `- Legacy pages: **${summary.legacy_pages}**`,
  `- Critical pages: **${summary.critical_pages}**`,
  `- Pages with warnings: **${summary.warning_pages}**`,
  `- Pages at 100 heuristic score: **${summary.pages_at_100}**`,
  `- Average score: **${summary.average_score}**`,
  `- Minimum score: **${summary.minimum_score}**`,
  '',
  '## Highest-priority pages',
  '',
  '| Score | Page | Evidence | Critical | Warnings |',
  '| ---: | --- | --- | ---: | ---: |',
  ...audits.slice(0, 80).map((item) => `| ${item.score} | ${item.canonical_url} | ${item.evidence_kind || '—'} | ${item.critical.length} | ${item.warnings.length} |`),
  '',
  '## Notes',
  '',
  '- Depth is assessed from both structured block count and useful word count; a long, information-dense block is not treated as thin merely because block count is low.',
  '- Evidence-specific rules are derived from the explicit evidence classification, not incidental mentions in references or background text.',
  '- This is a structural/provenance safety audit, not a substitute for reading the primary paper.',
  '- A page can score highly and still contain a scientific error; source-level verification remains mandatory.',
  '- A warning is a queue signal, not proof that the page is wrong.',
  '',
].join('\n');
await writeFile('artifacts/magazine-quality-audit.md', md);

console.log(JSON.stringify(summary, null, 2));
if (criticalPages.length) {
  console.error('\nCritical magazine pages:');
  for (const item of criticalPages.slice(0, 30)) console.error(`- ${item.canonical_url}: ${item.critical.join('; ')}`);
}
if (strictAll && warningPages.length) process.exit(1);
if (strictCritical && criticalPages.length) process.exit(1);
