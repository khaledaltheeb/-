#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_SOURCE_TYPES = new Set([
  'official-definition',
  'guideline',
  'systematic-review',
  'primary-research',
  'consensus',
  'institutional',
  'book',
]);
const ALLOWED_AUTHORITY_TIERS = new Set(['primary', 'authoritative', 'scholarly']);
const FILLER_PATTERNS = [
  /ملاحظة\s+(?:للمحرر|تحريرية)/u,
  /(?:TODO|FIXME|placeholder|lorem ipsum)/iu,
  /(?:الثيم|القالب)\s+(?:الخاص|الحالي|الجديد|المستخدم)/u,
  /(?:خطتنا|خططنا)\s+(?:الخاصة|التحريرية|للموقع)/u,
  /يجب\s+(?:إضافة|توسيع|مراجعة)\s+(?:هذا|هذه|المحتوى|القسم)/u,
  /كلمات\s+مفتاحية\s+(?:مقترحة|للسيو|SEO)/iu,
  /نص\s+(?:تجريبي|مؤقت|افتراضي)/u,
];
const WARNING_TEXT_RE = /(?:تنبيه|تحذير|إخلاء\s+المسؤولية)/u;
const SHA256_RE = /^[0-9a-f]{64}$/;
const ISBN_RE = /^(?:97[89])?[0-9]{9}[0-9X]$/i;

function arabicWords(value) {
  return String(value || '').match(/[\p{Script=Arabic}][\p{Script=Arabic}\p{M}]*/gu) || [];
}

function wordCount(value) {
  return arabicWords(value).length;
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeSentence(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[0-9٠-٩]+/g, '#')
    .replace(/[^\p{Script=Arabic}\p{L}\p{N}#]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function blockText(block) {
  const row = asObject(block);
  const type = String(row.type || '');
  if (['paragraph', 'heading', 'quote', 'callout'].includes(type)) return String(row.text || '');
  if (type === 'list') return asArray(row.items).join(' ');
  if (type === 'table') return [...asArray(row.headers), ...asArray(row.rows).flat()].join(' ');
  if (type === 'resource') return `${row.label || ''} ${row.description || ''}`;
  if (type === 'image') return `${row.alt || ''} ${row.caption || ''}`;
  if (type === 'faq') {
    return asArray(row.items).map((item) => {
      const entry = asObject(item);
      return `${entry.question || ''} ${entry.answer || ''}`;
    }).join(' ');
  }
  return '';
}

function renderedText(blocks) {
  return blocks.map(blockText).filter(Boolean).join('\n');
}

function sentences(value) {
  return String(value || '').split(/[.!؟!\n]+/u).map(normalizeSentence).filter((item) => wordCount(item) >= 14);
}

function issue(code, message, details = {}) {
  return { code, message, ...details };
}

function taxonomyIndex(taxonomy) {
  return {
    sectors: new Set(asArray(taxonomy.sectors).map((row) => String(row.slug || ''))),
    categories: new Map(asArray(taxonomy.categories).map((row) => [String(row.slug || ''), String(row.sector_slug || '')])),
  };
}

function referenceKey(reference) {
  const row = asObject(reference);
  return String(row.url || row.isbn || row.id || '').trim().toLowerCase();
}

function interactiveQualityPass(schema) {
  const quality = asObject(schema.interactive_quality);
  return (
    Number(quality.contract_version || 0) >= 1
    && quality.engine_tested === true
    && Number(quality.generated_trials || 0) >= 1000
    && Number(quality.accepted_correct_answers || 0) > 0
    && Number(quality.rejected_wrong_answers || 0) > 0
    && Number(quality.error_count || -1) === 0
    && ['local-only', 'anonymous-no-storage'].includes(String(quality.privacy_mode || ''))
  );
}

export function auditRecord(record, taxonomy) {
  const errors = [];
  const schema = asObject(record.schema_json);
  const body = asObject(record.body_json);
  const blocks = asArray(body.blocks).map(asObject);
  const text = renderedText(blocks);
  const type = String(record.content_type || '');
  const pageKind = String(schema.page_kind || 'editorial');
  const interactive = pageKind === 'interactive' && ['assessment', 'resource', 'tool'].includes(type);
  const strategic = String(schema.strategic_scientific_value || 'standard') === 'high';
  const minimumReferences = interactive ? 2 : strategic ? 8 : 5;
  const minimumClaims = interactive ? 2 : strategic ? 8 : 5;
  const identity = String(record.source_path || record.canonical_url || record.slug || 'unknown');

  if (Number(schema.content_contract_version || 0) < 6) {
    errors.push(issue('contract-version', 'content_contract_version must be at least 6'));
  }
  if (!String(record.slug || '').trim() || !String(record.title || '').trim() || !String(record.canonical_url || '').startsWith('/')) {
    errors.push(issue('identity', 'slug, title and a root-relative canonical are required'));
  }
  if (!blocks.length) errors.push(issue('empty-blocks', 'body_json.blocks must not be empty'));
  if (blocks.some((block) => block.type === 'heading' && Number(block.level) === 1)) {
    errors.push(issue('body-h1', 'H1 belongs to the page title and is forbidden inside content blocks'));
  }
  const h2 = blocks.filter((block) => block.type === 'heading' && Number(block.level) === 2).length;
  const h3 = blocks.filter((block) => block.type === 'heading' && Number(block.level) === 3).length;
  if (!interactive && h2 < 8) errors.push(issue('h2-depth', 'editorial pages require at least 8 useful H2 sections', { actual: h2 }));
  if (!interactive && h3 < 4) errors.push(issue('h3-depth', 'editorial pages require at least 4 useful H3 subsections', { actual: h3 }));

  const visibleWords = wordCount(text);
  if (!interactive && visibleWords < 2500) {
    errors.push(issue('minimum-words', 'editorial pages require at least 2500 visible Arabic words', { actual: visibleWords }));
  }
  if (interactive && !interactiveQualityPass(schema)) {
    errors.push(issue('interactive-quality', 'interactive exemption requires tested capacity, answer and privacy metrics'));
  }
  const bodyWords = wordCount(record.body_text);
  if (blocks.length && bodyWords && (bodyWords < visibleWords * 0.85 || bodyWords > visibleWords * 1.15)) {
    errors.push(issue('body-alignment', 'body_text and rendered blocks differ by more than 15%', { body_words: bodyWords, visible_words: visibleWords }));
  }

  const headings = blocks.filter((block) => block.type === 'heading').map((block) => normalizeSentence(block.text));
  if (new Set(headings).size !== headings.length) errors.push(issue('duplicate-headings', 'headings must be unique inside the page'));
  const sentenceList = sentences(text);
  const sentenceCounts = new Map();
  for (const sentence of sentenceList) sentenceCounts.set(sentence, (sentenceCounts.get(sentence) || 0) + 1);
  const repeated = [...sentenceCounts.entries()].filter(([, count]) => count > 1);
  if (repeated.length) errors.push(issue('repeated-sentences', 'long sentences are repeated inside the page', { repeated: repeated.length }));
  for (const pattern of FILLER_PATTERNS) {
    if (pattern.test(text)) errors.push(issue('editorial-leakage', 'editor-only or filler language is visible to readers', { pattern: String(pattern) }));
  }
  if (WARNING_TEXT_RE.test(text)) errors.push(issue('inline-warning-language', 'warning/disclaimer language belongs on the central disclaimer page'));
  if (blocks.some((block) => block.type === 'callout' && ['warning', 'danger'].includes(String(block.tone || '')))) {
    errors.push(issue('warning-callout', 'warning and danger callouts are forbidden in V6 content'));
  }
  if (String(record.medical_disclaimer || '').trim()) {
    errors.push(issue('inline-disclaimer-field', 'medical_disclaimer must be empty; the site renders one central link'));
  }
  if (schema.disclaimer_url !== '/disclaimer' || schema.disclaimer_label !== 'إخلاء المسؤولية والتنبيهات') {
    errors.push(issue('central-disclaimer', 'the exact central disclaimer route and label are required'));
  }

  const faqItems = blocks
    .filter((block) => block.type === 'faq')
    .flatMap((block) => asArray(block.items).map(asObject));
  if (!interactive && faqItems.length < 6) errors.push(issue('faq-count', 'at least 6 search-intent FAQ items are required', { actual: faqItems.length }));
  faqItems.forEach((item, index) => {
    if (wordCount(item.question) < 4 || wordCount(item.answer) < 30) {
      errors.push(issue('faq-depth', 'FAQ questions need at least 4 words and answers at least 30 words', { index }));
    }
  });
  const searchQuestions = asArray(schema.search_intent_questions).map(String).filter(Boolean);
  if (!interactive && searchQuestions.length < 8) {
    errors.push(issue('search-intents', 'at least 8 explicit search-intent questions are required', { actual: searchQuestions.length }));
  }
  if (searchQuestions.some((question) => wordCount(question) < 4)) {
    errors.push(issue('search-intent-depth', 'search-intent questions must contain at least 4 Arabic words'));
  }
  if (!String(record.search_intent || '').trim() || !String(record.primary_keyword || '').trim()) {
    errors.push(issue('search-metadata', 'search_intent and primary_keyword are required'));
  }
  if (!interactive && asArray(record.secondary_keywords).length < 5) {
    errors.push(issue('secondary-keywords', 'at least 5 focused secondary queries are required'));
  }
  if (!interactive && asArray(record.semantic_terms).length < 8) {
    errors.push(issue('semantic-terms', 'at least 8 useful semantic terms are required'));
  }

  const references = asArray(record.references_json).map(asObject);
  const referenceKeys = references.map(referenceKey).filter(Boolean);
  if (references.length < minimumReferences) {
    errors.push(issue('reference-count', `at least ${minimumReferences} important references are required`, { actual: references.length }));
  }
  if (new Set(referenceKeys).size !== referenceKeys.length) errors.push(issue('duplicate-references', 'references must be unique'));
  const referenceIds = new Set();
  let primaryReferences = 0;
  references.forEach((reference, index) => {
    const id = String(reference.id || '').trim();
    if (!id || referenceIds.has(id)) errors.push(issue('reference-id', 'every reference needs a unique stable id', { index }));
    referenceIds.add(id);
    const sourceType = String(reference.source_type || '');
    const authorityTier = String(reference.authority_tier || '');
    if (!ALLOWED_SOURCE_TYPES.has(sourceType) || !ALLOWED_AUTHORITY_TIERS.has(authorityTier)) {
      errors.push(issue('reference-provenance', 'each reference needs an approved source_type and authority_tier', { index }));
    }
    if (authorityTier === 'primary' || ['official-definition', 'guideline', 'systematic-review'].includes(sourceType)) primaryReferences += 1;
    const url = String(reference.url || '');
    const isbn = String(reference.isbn || '').replace(/[-\s]/g, '');
    if (sourceType === 'book') {
      if (!ISBN_RE.test(isbn) || !String(reference.publisher || '').trim() || !String(reference.year || '').trim()) {
        errors.push(issue('book-reference', 'book references require ISBN, publisher and year', { index }));
      }
    } else if (!url.startsWith('https://')) {
      errors.push(issue('reference-url', 'non-book references require an HTTPS URL', { index }));
    }
  });
  if (primaryReferences < (interactive ? 1 : 2)) {
    errors.push(issue('primary-references', 'the page needs enough primary, official, guideline or systematic-review sources', { actual: primaryReferences }));
  }

  const claimMap = asArray(schema.claim_source_map).map(asObject);
  if (claimMap.length < minimumClaims) errors.push(issue('claim-source-map', `at least ${minimumClaims} important claims must map to sources`, { actual: claimMap.length }));
  claimMap.forEach((entry, index) => {
    const ids = asArray(entry.reference_ids).map(String);
    if (wordCount(entry.claim) < 10 || !ids.length || ids.some((id) => !referenceIds.has(id))) {
      errors.push(issue('claim-source-entry', 'each substantial claim needs valid reference ids', { index }));
    }
  });

  const versions = asArray(schema.source_versions_reviewed).map(asObject);
  if (!versions.length) errors.push(issue('source-versions', 'all discovered source versions must be listed and reviewed'));
  versions.forEach((version, index) => {
    if (!String(version.path || '').trim() || !SHA256_RE.test(String(version.sha256 || '')) || !String(version.decision || '').trim()) {
      errors.push(issue('source-version-entry', 'every source version needs path, SHA-256 and a review decision', { index }));
    }
  });
  const mechanism = asObject(schema.page_mechanism);
  for (const field of ['purpose', 'audience', 'interaction_model', 'content_model']) {
    if (wordCount(mechanism[field]) < 5) errors.push(issue('page-mechanism', `page_mechanism.${field} needs a meaningful explanation`));
  }
  if (schema.rewrite_method !== 'evidence-led-rewrite') {
    errors.push(issue('rewrite-method', 'rewrite_method must be evidence-led-rewrite'));
  }
  const originality = asObject(schema.originality_report);
  if (
    originality.passed !== true
    || Number(originality.longest_verbatim_run_words ?? 999) > 25
    || Number(originality.legacy_sentence_reuse_ratio ?? 1) > 0.08
  ) {
    errors.push(issue('originality', 'originality report must pass the verbatim-run and sentence-reuse limits'));
  }

  const taxonomyMap = taxonomyIndex(taxonomy);
  const sector = String(record.sector_slug || '');
  const category = String(record.category_slug || '');
  if (!taxonomyMap.sectors.has(sector) || taxonomyMap.categories.get(category) !== sector) {
    errors.push(issue('taxonomy', 'sector and category must exist and match exactly', { sector, category }));
  }
  if (schema.taxonomy_reviewed !== true || Number(schema.classification_confidence || 0) < 0.9 || wordCount(schema.classification_rationale) < 25) {
    errors.push(issue('taxonomy-review', 'classification needs human review, confidence >= 0.9 and a 25-word rationale'));
  }

  if (strategic && (wordCount(schema.uniqueness_rationale) < 40 || references.length < 8 || claimMap.length < 8)) {
    errors.push(issue('strategic-depth', 'high strategic/scientific value pages require a 40-word uniqueness rationale, 8 references and 8 sourced claims'));
  }
  const encyclopediaRoute = ['/encyclopedia/', '/terms/', '/hubs/']
    .some((prefix) => String(record.canonical_url || '').startsWith(prefix));
  if (encyclopediaRoute && (
    schema.migration_phase !== 'encyclopedia-last'
    || schema.encyclopedia_release_authorized !== true
  )) {
    errors.push(issue('encyclopedia-order', 'encyclopedia pages require the final migration phase and explicit release authorization'));
  }

  return {
    identity,
    release_ready: errors.length === 0,
    metrics: {
      visible_arabic_words: visibleWords,
      h2,
      h3,
      faq_items: faqItems.length,
      search_intent_questions: searchQuestions.length,
      references: references.length,
      sourced_claims: claimMap.length,
      source_versions_reviewed: versions.length,
      interactive,
      strategic,
    },
    errors,
    sentence_signatures: sentenceList,
  };
}

export function auditEnvelope(envelope, taxonomy) {
  const records = asArray(envelope.records);
  const rows = records.map((record) => auditRecord(asObject(record), taxonomy));
  const globalIssues = [];
  for (const field of ['slug', 'title', 'canonical_url']) {
    const seen = new Map();
    records.forEach((record, index) => {
      const value = normalizeSentence(record[field]);
      if (!value) return;
      const previous = seen.get(value);
      if (previous !== undefined) globalIssues.push(issue('duplicate-identity', `duplicate ${field}`, { indexes: [previous, index], value }));
      else seen.set(value, index);
    });
  }
  const crossPage = new Map();
  rows.forEach((row, index) => {
    for (const signature of new Set(row.sentence_signatures)) {
      const locations = crossPage.get(signature) || [];
      locations.push(index);
      crossPage.set(signature, locations);
    }
  });
  for (const [signature, locations] of crossPage) {
    if (locations.length >= 3) {
      globalIssues.push(issue('cross-page-repetition', 'a long sentence appears in at least three pages', { pages: locations.length, signature }));
    }
  }
  const errorCount = rows.reduce((sum, row) => sum + row.errors.length, 0) + globalIssues.length;
  return {
    contract_version: 6,
    status: errorCount ? 'blocked' : 'passed',
    records: records.length,
    release_ready: rows.filter((row) => row.release_ready).length,
    blocked: rows.filter((row) => !row.release_ready).length,
    error_count: errorCount,
    global_issues: globalIssues,
    rows: rows.map(({ identity, release_ready, metrics, errors }) => ({ identity, release_ready, metrics, errors })),
  };
}

function fixedDescription() {
  const seed = 'دليل عربي موسع يشرح الموضوع بمنهج علمي واضح، ويربط التعريف بالأدلة والتطبيق والأسئلة الشائعة والمراجع الرسمية دون تكرار أو حشو، ضمن تصنيف دقيق يسهل الوصول إليه. ';
  return seed.repeat(2).slice(0, 155);
}

function fixtureParagraph(topic, offset) {
  const words = ['المنهج', 'الدليل', 'السياق', 'التطبيق', 'القياس', 'المقارنة', 'الخبرة', 'المصدر', 'النتيجة', 'الحدود', 'الاحتمال', 'التفسير', 'الممارسة', 'القارئ', 'القرار', 'المعرفة', 'المتابعة', 'السؤال', 'الإجابة', 'الوضوح', 'الترابط', 'الدقة', 'الفائدة', 'التحليل', 'الاختيار', 'الواقع', 'المثال', 'التقييم', 'التكامل', 'المراجعة', 'التعلم', 'التوثيق'];
  return Array.from({ length: 9 }, (_, sentenceIndex) => {
    const rotated = words.map((_, index) => words[(index + sentenceIndex + offset) % words.length]);
    return `${topic} يشرح ${rotated.join(' ')} بصورة عملية متوازنة تساعد على فهم العلاقة بين المعلومة والاحتياج الفعلي`;
  }).join('. ') + '.';
}

function validFixture() {
  const topics = ['التعريف الرسمي', 'حدود المفهوم', 'الصورة الوظيفية', 'عوامل الاختلاف', 'منهج التقييم', 'التطبيق اليومي', 'مقارنة البدائل', 'قياس التقدم', 'الأسئلة العملية'];
  const blocks = topics.flatMap((topic, index) => [
    { type: 'heading', level: 2, text: topic },
    ...(index < 5 ? [{ type: 'heading', level: 3, text: `تفصيل ${topic}` }] : []),
    { type: 'paragraph', text: fixtureParagraph(topic, index) },
  ]);
  blocks.push({
    type: 'faq',
    items: Array.from({ length: 6 }, (_, index) => ({
      question: `كيف نفهم السؤال العملي رقم ${index + 1} بدقة؟`,
      answer: fixtureParagraph(`الإجابة العملية ${index + 1}`, index).split('. ').slice(0, 2).join('. '),
    })),
  });
  const refs = [
    ['who', 'https://www.who.int/publications', 'official-definition', 'primary'],
    ['nice', 'https://www.nice.org.uk/guidance', 'guideline', 'primary'],
    ['cochrane', 'https://www.cochranelibrary.com/', 'systematic-review', 'authoritative'],
    ['nih', 'https://pubmed.ncbi.nlm.nih.gov/', 'primary-research', 'scholarly'],
    ['apa', 'https://www.apa.org/topics', 'institutional', 'authoritative'],
  ].map(([id, url, source_type, authority_tier]) => ({ id, title: `مرجع ${id}`, url, publisher: id, year: 2026, source_type, authority_tier }));
  const bodyText = renderedText(blocks);
  return {
    source_path: '/evidence-guides/fixture/',
    slug: 'fixture',
    title: 'صفحة اختبار عقد المحتوى السادس',
    content_type: 'guide',
    canonical_url: '/evidence-guides/fixture/',
    sector_slug: 'knowledge',
    category_slug: 'research-evidence-learning',
    body_json: { blocks },
    body_text: bodyText,
    seo_title: 'اختبار عقد المحتوى السادس',
    seo_description: fixedDescription(),
    primary_keyword: 'عقد المحتوى العلمي',
    secondary_keywords: ['منهج المحتوى', 'المصادر الرسمية', 'الأسئلة الشائعة', 'التصنيف الدقيق', 'الكتابة العربية'],
    semantic_terms: ['منهجية', 'دليل', 'مصدر', 'تعريف', 'تصنيف', 'سؤال', 'إجابة', 'مراجعة'],
    search_intent: 'informational',
    references_json: refs,
    medical_disclaimer: null,
    schema_json: {
      content_contract_version: 6,
      page_kind: 'editorial',
      disclaimer_url: '/disclaimer',
      disclaimer_label: 'إخلاء المسؤولية والتنبيهات',
      search_intent_questions: Array.from({ length: 8 }, (_, index) => `ما الإجابة الدقيقة عن سؤال البحث رقم ${index + 1}؟`),
      claim_source_map: refs.map((reference, index) => ({
        claim: `يعرض الادعاء العلمي رقم ${index + 1} علاقة واضحة بين المصدر والسياق والتطبيق وحدود الاستدلال في الصفحة`,
        reference_ids: [reference.id],
      })),
      source_versions_reviewed: [{ path: 'legacy/example/index.html', sha256: 'a'.repeat(64), decision: 'استيعاب الحقائق والمراجع وإعادة الكتابة' }],
      page_mechanism: {
        purpose: 'تقديم شرح علمي متكامل يجيب عن حاجة معرفية محددة بوضوح',
        audience: 'القارئ العام والأسرة والمختص الذي يحتاج مرجعًا عربيًا موثقًا',
        interaction_model: 'قراءة متدرجة تبدأ بالإجابة ثم تنتقل إلى الأدلة والتطبيق والأسئلة',
        content_model: 'تعريف رسمي وأقسام مترابطة وأسئلة بحث ومراجع مرتبطة بالادعاءات',
      },
      rewrite_method: 'evidence-led-rewrite',
      originality_report: { passed: true, longest_verbatim_run_words: 12, legacy_sentence_reuse_ratio: 0.02 },
      taxonomy_reviewed: true,
      classification_confidence: 0.98,
      classification_rationale: fixtureParagraph('مبرر التصنيف', 3).split('. ').slice(0, 1).join(''),
      strategic_scientific_value: 'standard',
    },
  };
}

function selfTest() {
  const taxonomy = {
    sectors: [{ slug: 'knowledge' }],
    categories: [{ slug: 'research-evidence-learning', sector_slug: 'knowledge' }],
  };
  const good = validFixture();
  const goodAudit = auditRecord(good, taxonomy);
  if (!goodAudit.release_ready) throw new Error(`V6 valid fixture failed: ${JSON.stringify(goodAudit.errors)}`);
  const bad = structuredClone(good);
  bad.body_json = { blocks: [{ type: 'callout', tone: 'danger', title: 'تحذير', text: 'نص قصير' }] };
  bad.body_text = 'نص قصير';
  bad.schema_json = {};
  bad.references_json = [];
  bad.sector_slug = 'wrong';
  bad.category_slug = 'wrong';
  bad.medical_disclaimer = 'تنبيه';
  const badAudit = auditRecord(bad, taxonomy);
  const requiredCodes = ['minimum-words', 'warning-callout', 'contract-version', 'reference-count', 'taxonomy', 'central-disclaimer'];
  for (const code of requiredCodes) {
    if (!badAudit.errors.some((error) => error.code === code)) throw new Error(`V6 invalid fixture did not trigger ${code}`);
  }
  console.log(JSON.stringify({
    contract_version: 6,
    status: 'passed',
    valid_fixture_words: goodAudit.metrics.visible_arabic_words,
    invalid_fixture_blockers: badAudit.errors.length,
  }, null, 2));
}

function parseCli(argv) {
  if (argv.includes('--self-test')) return { selfTest: true };
  const args = { selfTest: false, payload: argv[0] || '', taxonomy: '', report: '', advisory: argv.includes('--advisory') };
  for (let index = 1; index < argv.length; index += 1) {
    if (argv[index] === '--taxonomy') args.taxonomy = argv[++index] || '';
    else if (argv[index] === '--report') args.report = argv[++index] || '';
    else if (argv[index] !== '--advisory') throw new Error(`Unknown argument: ${argv[index]}`);
  }
  if (!args.payload || !args.taxonomy) throw new Error('Usage: content-release-contract-v6.mjs <payload.json> --taxonomy <taxonomy.json> [--report <report.json>] [--advisory]');
  return args;
}

try {
  const args = parseCli(process.argv.slice(2));
  if (args.selfTest) {
    selfTest();
  } else {
    const envelope = JSON.parse(fs.readFileSync(args.payload, 'utf8'));
    const taxonomy = JSON.parse(fs.readFileSync(args.taxonomy, 'utf8'));
    const report = auditEnvelope(envelope, taxonomy);
    if (args.report) {
      fs.mkdirSync(path.dirname(args.report), { recursive: true });
      fs.writeFileSync(args.report, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    }
    console.log(JSON.stringify({
      contract_version: report.contract_version,
      status: report.status,
      records: report.records,
      release_ready: report.release_ready,
      blocked: report.blocked,
      error_count: report.error_count,
    }, null, 2));
    if (!args.advisory && report.status !== 'passed') process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
