import { mkdir, writeFile } from 'node:fs/promises';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';
const strictCritical = process.argv.includes('--strict-critical') || process.argv.includes('--strict-all');
const strictAll = process.argv.includes('--strict-all');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Encyclopedia audit requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  process.exit(2);
}

const PAGE_SIZE = 1000;
const rows = [];
for (let offset = 0; offset < 6000; offset += PAGE_SIZE) {
  const params = new URLSearchParams();
  params.set('select', 'id,slug,title,excerpt,body_text,body_json,references_json,schema_json,seo_title,seo_description,medical_disclaimer,last_reviewed_at,reviewer_display_name,status,content_type,canonical_url');
  params.set('canonical_url', 'like./encyclopedia/*');
  params.set('status', 'eq.published');
  params.set('robots_index', 'eq.true');
  params.set('order', 'canonical_url.asc');
  params.set('limit', String(PAGE_SIZE));
  params.set('offset', String(offset));

  const response = await fetch(`${SUPABASE_URL}/rest/v1/content?${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    console.error(`Encyclopedia audit query failed: HTTP ${response.status}`);
    console.error(await response.text());
    process.exit(2);
  }
  const page = await response.json();
  rows.push(...page);
  if (page.length < PAGE_SIZE) break;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function collectText(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectText(item, out));
  else if (isObject(value)) Object.values(value).forEach((item) => collectText(item, out));
  return out;
}

function blocksOf(row) {
  return Array.isArray(row?.body_json?.blocks) ? row.body_json.blocks : [];
}

function wordCount(value) {
  if (typeof value !== 'string' || !value.trim()) return 0;
  return value.match(/[\p{L}\p{N}]+/gu)?.length || 0;
}

function usefulWordCount(row) {
  const body = wordCount(row.body_text || '');
  const structured = wordCount(collectText(row.body_json).join(' '));
  return Math.max(body, structured);
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

function referencesOf(row) {
  return Array.isArray(row.references_json)
    ? row.references_json.filter((ref) => isObject(ref) && validHttpUrl(ref.url))
    : [];
}

function claimMapOf(row) {
  return Array.isArray(row?.schema_json?.claim_source_map)
    ? row.schema_json.claim_source_map.filter((item) => isObject(item) && typeof item.claim === 'string' && Array.isArray(item.reference_ids) && item.reference_ids.length)
    : [];
}

function goldMarker(row) {
  const marker = row?.schema_json?.encyclopedia_gold_standard;
  return isObject(marker) ? marker : null;
}

function containsAny(text, patterns) {
  const haystack = String(text || '').toLocaleLowerCase('ar');
  return patterns.some((pattern) => haystack.includes(pattern.toLocaleLowerCase('ar')));
}

function normalizedText(row) {
  return [row.body_text || '', ...collectText(row.body_json)].join(' ').replace(/\s+/g, ' ').trim();
}

function duplicateLongBlocks(blocks) {
  const seen = new Set();
  const duplicate = [];
  for (const block of blocks) {
    if (!isObject(block) || typeof block.text !== 'string') continue;
    const normalized = block.text.replace(/\s+/g, ' ').trim().toLocaleLowerCase('ar');
    if (normalized.length < 120) continue;
    if (seen.has(normalized)) duplicate.push(block.text.slice(0, 100));
    seen.add(normalized);
  }
  return duplicate;
}

function recentReferenceCount(refs) {
  return refs.filter((ref) => {
    const raw = Number(ref.year || ref.publication_year || 0);
    return Number.isFinite(raw) && raw >= 2024;
  }).length;
}

function authoritativeReferenceCount(refs) {
  return refs.filter((ref) => {
    const publisher = String(ref.publisher || '').toLowerCase();
    const tier = String(ref.authority_tier || '').toLowerCase();
    const type = String(ref.source_type || '').toLowerCase();
    return tier === 'primary'
      || /gene(reviews)?|ncbi|nih|nice|who|cdc|clingen|orphanet|cochrane|guideline|consensus/.test(`${publisher} ${type}`);
  }).length;
}

function auditRow(row) {
  const blocks = blocksOf(row);
  const text = normalizedText(row);
  const words = usefulWordCount(row);
  const refs = referencesOf(row);
  const claims = claimMapOf(row);
  const gold = goldMarker(row);
  const strict = Boolean(gold && Number(gold.version || 0) >= 1);
  const evidenceLimited = Boolean(gold?.evidence_limited);
  const critical = [];
  const warnings = [];

  if (!row.title?.trim()) critical.push('missing title');
  if (!/^\/encyclopedia\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(String(row.canonical_url || ''))) critical.push('invalid encyclopedia canonical');
  if (!['condition', 'glossary_term'].includes(row.content_type)) warnings.push(`unexpected encyclopedia content_type: ${row.content_type}`);
  if (!refs.length) critical.push('no valid reference URLs');
  if (!row.seo_title?.trim()) warnings.push('missing SEO title');
  if (!row.seo_description?.trim()) warnings.push('missing SEO description');

  const unsafe = [
    'يعالج نهائيًا', 'يشفي نهائيًا', 'شفاء مضمون', 'مضمون 100%', 'يضمن العلاج', 'يمنع تمامًا',
    'توقف عن الدواء', 'أوقف الدواء', 'غيّر الجرعة بنفسك', 'لا تحتاج إلى طبيب',
  ];
  if (containsAny(text, unsafe)) critical.push('unsafe or absolute medical claim detected');

  const duplicates = duplicateLongBlocks(blocks);
  if (duplicates.length) warnings.push(`duplicate long blocks (${duplicates.length})`);

  if (!strict) {
    if (row.content_type === 'condition' && words < 500) warnings.push(`legacy condition needs enrichment (${words} useful words)`);
    if (row.content_type === 'glossary_term' && words < 250) warnings.push(`legacy glossary term is very concise (${words} useful words)`);
    if (claims.length < 3) warnings.push(`claim-source mapping is sparse (${claims.length})`);
    if (!row.last_reviewed_at) warnings.push('missing review timestamp');
    if (refs.some((ref) => !ref.publisher || !(ref.year || ref.publication_year) || !ref.source_type || !ref.authority_tier)) {
      warnings.push('reference metadata incomplete');
    }
  }

  if (strict) {
    const condition = row.content_type === 'condition';
    const floor = condition ? (evidenceLimited ? 650 : 1200) : (evidenceLimited ? 220 : 350);
    if (words < floor) critical.push(`gold-standard content below depth floor (${words}/${floor} useful words)`);
    if (condition && blocks.length < (evidenceLimited ? 14 : 20)) critical.push(`gold-standard condition lacks structured depth (${blocks.length} blocks)`);
    if (!condition && blocks.length < 8) warnings.push(`gold-standard glossary structure is sparse (${blocks.length} blocks)`);

    const refFloor = evidenceLimited ? 2 : (condition ? 4 : 2);
    if (refs.length < refFloor) critical.push(`gold-standard references below floor (${refs.length}/${refFloor})`);
    if (authoritativeReferenceCount(refs) < 1) critical.push('gold-standard page lacks an authoritative source');
    if (recentReferenceCount(refs) < 1 && !gold?.recent_source_unavailable) warnings.push('no 2024+ source registered; verify whether a recent relevant source exists');

    const claimFloor = condition ? 4 : 2;
    if (claims.length < claimFloor) critical.push(`gold-standard claim-source map below floor (${claims.length}/${claimFloor})`);
    if (!row.last_reviewed_at) critical.push('gold-standard page has no review timestamp');

    if (condition) {
      if (!containsAny(text, ['التشخيص', 'اختبار جيني', 'الفحص الجيني', 'التحليل الجيني', 'التقييم التشخيصي'])) critical.push('diagnosis/testing boundary is not explicit');
      if (!containsAny(text, ['المتابعة', 'إعادة التقييم', 'المراقبة', 'surveillance'])) critical.push('surveillance/reassessment is not explicit');
      if (!containsAny(text, ['العلاج', 'التدبير', 'الدعم', 'الإدارة', 'التدخل'])) critical.push('management/support is not explicit');
      if (!containsAny(text, ['يختلف', 'متباين', 'ليس لدى جميع', 'لا تظهر جميع', 'لا يعني أن كل'])) warnings.push('phenotypic variability boundary is not explicit');
      if (!containsAny(text, ['حدود الدليل', 'حدود المعرفة', 'الأدلة محدودة', 'المعرفة ما تزال', 'لا يمكن التنبؤ', 'لا توجد إرشادات خاصة'])) warnings.push('evidence-limit/anti-overclaim section is not explicit');
      if (!containsAny(text, ['التواصل', 'التعلم', 'المشاركة', 'الاستقلال', 'الوصول', 'المدرسة', 'التعليم'])) warnings.push('functional/participation interpretation is not explicit');
    }
  }

  const score = Math.max(0, 100 - critical.length * 18 - warnings.length * 4);
  const priority = critical.length * 1000
    + Math.max(0, 1200 - words)
    + Math.max(0, 4 - refs.length) * 80
    + Math.max(0, 4 - claims.length) * 60
    + (row.content_type === 'condition' ? 200 : 0);

  return {
    id: row.id,
    slug: row.slug,
    canonical_url: row.canonical_url,
    title: row.title,
    content_type: row.content_type,
    gold_standard: strict,
    evidence_limited: evidenceLimited,
    useful_word_count: words,
    block_count: blocks.length,
    reference_count: refs.length,
    recent_reference_count: recentReferenceCount(refs),
    claim_source_count: claims.length,
    last_reviewed_at: row.last_reviewed_at,
    score,
    priority,
    critical,
    warnings,
  };
}

const audits = rows.map(auditRow).sort((a, b) => b.priority - a.priority || a.canonical_url.localeCompare(b.canonical_url));
const criticalPages = audits.filter((item) => item.critical.length);
const warningPages = audits.filter((item) => item.warnings.length);
const goldPages = audits.filter((item) => item.gold_standard);
const legacyPages = audits.filter((item) => !item.gold_standard);
const summary = {
  generated_at: new Date().toISOString(),
  published_pages: audits.length,
  condition_pages: audits.filter((item) => item.content_type === 'condition').length,
  glossary_pages: audits.filter((item) => item.content_type === 'glossary_term').length,
  gold_standard_pages: goldPages.length,
  backlog_pages: legacyPages.length,
  critical_pages: criticalPages.length,
  warning_pages: warningPages.length,
  gold_pages_at_100: goldPages.filter((item) => item.score === 100).length,
  gold_minimum_score: goldPages.length ? Math.min(...goldPages.map((item) => item.score)) : null,
  gold_average_score: goldPages.length ? Number((goldPages.reduce((sum, item) => sum + item.score, 0) / goldPages.length).toFixed(1)) : null,
};

await mkdir('artifacts', { recursive: true });
await writeFile('artifacts/encyclopedia-quality-audit.json', JSON.stringify({ summary, audits }, null, 2) + '\n');

const md = [
  '# Encyclopedia Quality Audit',
  '',
  `Generated: ${summary.generated_at}`,
  '',
  `- Published encyclopedia pages: **${summary.published_pages}**`,
  `- Conditions: **${summary.condition_pages}**`,
  `- Glossary terms: **${summary.glossary_pages}**`,
  `- Gold-standard pages: **${summary.gold_standard_pages}**`,
  `- Upgrade backlog: **${summary.backlog_pages}**`,
  `- Critical pages: **${summary.critical_pages}**`,
  `- Pages with warnings: **${summary.warning_pages}**`,
  '',
  '## Highest-priority repair queue',
  '',
  '| Priority | Score | Type | Words | Refs | Claims | Gold | Page | Critical | Warnings |',
  '| ---: | ---: | --- | ---: | ---: | ---: | --- | --- | ---: | ---: |',
  ...audits.slice(0, 100).map((item) => `| ${item.priority} | ${item.score} | ${item.content_type} | ${item.useful_word_count} | ${item.reference_count} | ${item.claim_source_count} | ${item.gold_standard ? 'yes' : 'no'} | ${item.canonical_url} | ${item.critical.length} | ${item.warnings.length} |`),
  '',
  '## Interpretation',
  '',
  '- Legacy pages remain published unless they contain a safety-critical defect; warnings form the repair queue.',
  '- Gold-standard pages are held to the strict contract in `.encyclopedia-quality-standard.md`.',
  '- Useful word count uses the richer of `body_text` and all structured `body_json` text to avoid false thin-content flags.',
  '- A high score is a regression signal, not a substitute for scientific editorial review.',
  '',
].join('\n');
await writeFile('artifacts/encyclopedia-quality-audit.md', md);

console.log(JSON.stringify(summary, null, 2));
if (strictCritical && criticalPages.length) process.exit(1);
if (strictAll && warningPages.length) process.exit(1);
