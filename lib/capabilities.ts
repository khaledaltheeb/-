import { createClient } from '@/lib/supabase/server';

type JsonRecord = Record<string, unknown>;

export type CapabilityReference = {
  title?: string;
  url?: string;
  publisher?: string;
  year?: string | number;
};

export type CapabilityFaq = { question: string; answer: string };

export type CapabilityRegistryItem = {
  rank: number;
  slug: string;
  title: string;
  titleEn: string;
  href: string;
  category: string;
  categoryKey: string;
  evidenceRoute: string;
  evidenceRouteKey: string;
};

export type CapabilityRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_json: unknown;
  body_text: string | null;
  content_type: string;
  audience: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  published_at: string | null;
  updated_at: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  semantic_terms: string[] | null;
  author_display_name: string | null;
  reviewer_display_name: string | null;
  reviewer_credentials: string | null;
  last_reviewed_at: string | null;
  references_json: unknown;
  medical_disclaimer: string | null;
  schema_json: unknown;
};

const CATEGORY_LABELS: Record<string, string> = {
  'neurodevelopmental-learning': 'النمو العصبي والتعلم والتواصل',
  'genetic-metabolic': 'المتلازمات الجينية والكروموسومية والاستقلابية',
  'motor-neurological': 'الحركة والأعصاب والإصابات',
  'sensory-communication': 'الحواس والوصول والتواصل',
  'chronic-health': 'الحالات الصحية المزمنة والمتقطعة',
  'progressive-psychosocial': 'الحالات التقدمية والنفسية ذات الأثر الوظيفي',
};

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

const DROP_READER_TEXT = [
  'كانت هذه الحالة موجودة في مكتبة v254 التي استخدمها مولّد قسم القدرات v280 كمرجع مباشر للحالة.',
  'Canonical وOpen Graph وSchema وBreadcrumbs وبيانات المؤلف والمراجعة مهيأة للنظام الجديد.',
];

const READER_REPLACEMENTS: Array<[RegExp, string]> = [
  [/ما الذي حفظناه من النسخة التاريخية v254[؟?]/gu, 'مسارات تطبيقية إضافية'],
  [/محاور التركيز التي سُجلت في v254/gu, 'محاور التركيز العملية'],
  [/عناصر تقييم إضافية من السجل السابق/gu, 'عناصر تقييم إضافية'],
  [/الهدف الوظيفي الذي وثقته النسخة السابقة/gu, 'هدف وظيفي تطبيقي'],
  [/ملاحظة الانتشار في سجل v254/gu, 'الانتشار والسياق'],
  [/ثلاثة مسارات تطبيقية محفوظة من v254/gu, 'ثلاثة مسارات تطبيقية'],
  [/العلاقة بالدليل كما وردت في v254:/gu, 'صلة الإجراء بالدليل:'],
  [/التواتر أو مدة التجربة كما وُثقت في v254:/gu, 'مدة التجربة المقترحة:'],
  [/القياس المقترح في v254:/gu, 'مؤشرات القياس:'],
  [/كما وردت في v254:/gu, ''],
  [/كما وُثقت في v254:/gu, ''],
  [/محفوظة من v254/gu, ''],
  [/قاعدة التوقف في المسار التاريخي/gu, 'قاعدة التوقف'],
  [/فئة الانتشار التخطيطية في النسخة السابقة:\s*[A-Z]\.?(?=\s|$)/gu, ''],
  [/20\. منع تضارب الكلمات المفتاحية والصفحات المتشابهة/gu, '20. منع التكرار وتضارب الصفحات'],
  [/FAQ يجيب عن أسئلة واقعية ويظهر نص الإجابات في الصفحة، لا Schema مخفي فقط\./gu, 'الأسئلة الشائعة تجيب عن أسئلة واقعية وتعرض الإجابات بوضوح داخل الصفحة.'],
  [/صفحة Canonical واحدة لكل نية بحثية وعدم تكرار slugs أو canonicals\./gu, 'صفحة مرجعية واحدة لكل موضوع، مع تجنب إنشاء نسخ متكررة للمعلومة نفسها.'],
  [/بعد اجتياز بوابات المحتوى والمراجع وFAQ وCanonical وSEO وإتاحة الهاتف وعدم التكرار، ثم تظل المراجعة البشرية المتخصصة مطلوبة عند الادعاءات السريرية الحساسة\./gu, 'لا تُعتمد المادة قبل التحقق من جودة المحتوى والمراجع وسهولة القراءة وعدم التكرار، وتظل المراجعة البشرية المتخصصة مطلوبة عند الادعاءات السريرية الحساسة.'],
  [/لكل حالة صفحة Canonical واحدة داخل هذا القسم مخصصة لسؤال القدرات والوصول\./gu, 'لكل حالة صفحة مرجعية واحدة داخل هذا القطاع مخصصة لسؤال القدرات والوصول.'],
  [/صفحة Canonical مختلفة/gu, 'صفحة مرجعية مختلفة'],
  [/صفحة Canonical واحدة/gu, 'صفحة مرجعية واحدة'],
  [/مسار Canonical واحد/gu, 'مسار مرجعي واحد'],
  [/داخل صفحة Canonical واحدة/gu, 'داخل صفحة مرجعية واحدة'],
  [/Canonical مركزي واحد/gu, 'مرجع مركزي واحد'],
  [/داخل صفحة Canonical/gu, 'داخل صفحة مرجعية'],
  [/صفحة Canonical/gu, 'صفحة مرجعية'],
  [/نية مستقلة فعلًا/gu, 'حاجة مستقلة فعلًا'],
  [/\bv254\b/gu, ''],
  [/\bv280\b/gu, ''],
];

export function sanitizeCapabilityText(value: string) {
  let text = value;
  for (const drop of DROP_READER_TEXT) text = text.replaceAll(drop, '');
  for (const [pattern, replacement] of READER_REPLACEMENTS) text = text.replace(pattern, replacement);
  text = text
    .replace(/\s*و?ما الذي لا يدعمه[؟?]\s*$/u, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([،؛:.])/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text;
}

function sanitizeCapabilityValue(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeCapabilityText(value);
  if (Array.isArray(value)) {
    return value
      .map(sanitizeCapabilityValue)
      .filter((item) => !(typeof item === 'string' && item.trim().length === 0));
  }
  const row = asRecord(value);
  if (!row) return value;
  const next: JsonRecord = {};
  for (const [key, item] of Object.entries(row)) next[key] = sanitizeCapabilityValue(item);
  const text = typeof next.text === 'string' ? next.text.trim() : null;
  if (text === '' && ['paragraph', 'heading', 'callout'].includes(String(next.type || ''))) return null;
  return next;
}

export function sanitizeCapabilityBody(value: unknown) {
  const root = sanitizeCapabilityValue(value);
  const row = asRecord(root);
  if (!row || !Array.isArray(row.blocks)) return root;
  return { ...row, blocks: row.blocks.filter(Boolean) };
}

function inferredPublisher(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host === 'medlineplus.gov') return 'MedlinePlus / U.S. National Library of Medicine';
    if (host.endsWith('cdc.gov')) return 'Centers for Disease Control and Prevention (CDC)';
    if (host.endsWith('who.int')) return 'World Health Organization';
    if (host.endsWith('asha.org')) return 'American Speech-Language-Hearing Association (ASHA)';
    if (host.endsWith('canchild.ca')) return 'CanChild Centre for Childhood Disability Research';
    if (host.endsWith('aaidd.org')) return 'AAIDD';
    if (host.endsWith('ies.ed.gov')) return 'Institute of Education Sciences';
    if (host.endsWith('nidcd.nih.gov')) return 'NIDCD / NIH';
    if (host.endsWith('aota.org')) return 'American Occupational Therapy Association';
    if (host.endsWith('amputee-coalition.org')) return 'Amputee Coalition';
    if (host.endsWith('rarediseases.info.nih.gov')) return 'NIH Genetic and Rare Diseases Information Center';
  } catch {
    return '';
  }
  return '';
}

export function capabilityContentSlug(routeSlug?: string) {
  return routeSlug ? `capabilities-${routeSlug}` : 'capabilities-hub';
}

export async function getCapabilityRecord(routeSlug?: string): Promise<CapabilityRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select(
      'id,slug,title,excerpt,body_json,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json',
    )
    .eq('slug', capabilityContentSlug(routeSlug))
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  return (data as CapabilityRecord | null) ?? null;
}

export async function getCapabilityRegistryItems(): Promise<CapabilityRegistryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('slug,title,canonical_url,schema_json,published_at')
    .like('slug', 'capabilities-%')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .limit(200);

  const rows = Array.isArray(data) ? data : [];
  return rows
    .flatMap((row) => {
      const schema = asRecord(row.schema_json);
      const rank = Number(schema?.legacy_rank);
      if (!Number.isInteger(rank) || rank < 1 || rank > 100) return [];

      const canonical = asString(row.canonical_url);
      const rowSlug = asString(row.slug).replace(/^capabilities-/, '');
      const categoryKey = asString(schema?.legacy_category);
      const evidenceRouteKey = asString(schema?.evidence_route);
      const category = CATEGORY_LABELS[categoryKey] || categoryKey;
      const evidenceRoute = asString(schema?.evidence_route_label) || evidenceRouteKey;
      const canonicalHref = canonical || `/capabilities/${rowSlug}/`;

      const primary: CapabilityRegistryItem = {
        rank,
        slug: rowSlug,
        title: asString(row.title),
        titleEn: asString(schema?.legacy_title_en),
        href: canonicalHref,
        category,
        categoryKey,
        evidenceRoute,
        evidenceRouteKey,
      };

      const mergedRegistryEntries = Array.isArray(schema?.merged_registry_entries)
        ? schema.merged_registry_entries
        : [];

      const aliases = mergedRegistryEntries.flatMap((entry) => {
        const alias = asRecord(entry);
        if (!alias) return [];
        const aliasRank = Number(alias.rank);
        if (!Number.isInteger(aliasRank) || aliasRank < 1 || aliasRank > 100) return [];
        const aliasSlug = asString(alias.slug);
        const aliasTitle = asString(alias.title);
        if (!aliasSlug || !aliasTitle) return [];

        return [
          {
            rank: aliasRank,
            slug: aliasSlug,
            title: aliasTitle,
            titleEn: asString(alias.title_en),
            href: canonicalHref,
            category,
            categoryKey,
            evidenceRoute,
            evidenceRouteKey,
          } satisfies CapabilityRegistryItem,
        ];
      });

      return [primary, ...aliases];
    })
    .sort((a, b) => a.rank - b.rank);
}

export function safeCapabilityReferences(value: unknown): CapabilityReference[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const url = asString(row.url);
    let title = sanitizeCapabilityText(asString(row.title));
    let publisher = sanitizeCapabilityText(asString(row.publisher));
    const year = typeof row.year === 'string' || typeof row.year === 'number' ? row.year : undefined;
    if (/^مرجع الحالة في سجل v254\s*[—-]/u.test(asString(row.title))) {
      title = asString(row.title).replace(/^مرجع الحالة في سجل v254\s*[—-]\s*/u, '').trim();
    }
    if (publisher === 'مرجع الحالة المباشر في النسخة التاريخية' || /النسخة التاريخية/u.test(publisher)) {
      publisher = inferredPublisher(url) || 'مصدر مؤسسي متخصص';
    }
    if (!title && !/^https:\/\//i.test(url)) return [];
    return [{ title: title || undefined, url: /^https:\/\//i.test(url) ? url : undefined, publisher: publisher || undefined, year }];
  });
}

export function visibleCapabilityFaq(value: unknown): CapabilityFaq[] {
  const root = asRecord(sanitizeCapabilityBody(value));
  const blocks = Array.isArray(root?.blocks) ? root.blocks : [];
  return blocks
    .flatMap((block) => {
      const row = asRecord(block);
      if (!row || row.type !== 'faq' || !Array.isArray(row.items)) return [];
      return row.items.flatMap((item) => {
        const faq = asRecord(item);
        const question = asString(faq?.question).slice(0, 500);
        const answer = asString(faq?.answer).slice(0, 6000);
        return question.length >= 3 && answer.length >= 3 ? [{ question, answer }] : [];
      });
    })
    .slice(0, 40);
}

export function capabilityBodyWithoutRegistryCards(value: unknown) {
  const root = asRecord(sanitizeCapabilityBody(value));
  if (!root || !Array.isArray(root.blocks)) return root ?? value;
  return {
    ...root,
    blocks: root.blocks.filter((block) => {
      const row = asRecord(block);
      if (!row || row.type !== 'resource') return true;
      const url = asString(row.url);
      return !/^https:\/\/healthrenewal\.org\/capabilities\/[^/]+\/$/i.test(url);
    }),
  };
}
