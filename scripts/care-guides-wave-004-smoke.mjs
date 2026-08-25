const base = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const canonicalOrigin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://healthrenewal.org').replace(/\/$/, '');

const reviewedPublished = [
  ['/care-guides/care-guide-dual-task-attention-limit/', 'تعدد المهام وحدود الانتباه'],
  ['/care-guides/cognitive-flexibility-switching-plan/', 'المرونة المعرفية وتبديل المهام'],
  ['/care-guides/cognitive-load-instruction-audit/', 'الحمل المعرفي في التعليمات'],
  ['/care-guides/inhibitory-control-pause-plan/', 'التوقف قبل الاستجابة'],
  ['/care-guides/metacognition-study-review-card/', 'ما وراء المعرفة في المذاكرة'],
  ['/care-guides/processing-speed-accuracy-balance/', 'سرعة المعالجة أم الدقة؟'],
  ['/care-guides/prospective-memory-external-cues/', 'تذكر ما يجب فعله لاحقًا'],
  ['/care-guides/retrieval-practice-study-plan/', 'الاسترجاع النشط للمذاكرة'],
  ['/care-guides/selective-attention-distraction-audit/', 'ما الذي يسرق الانتباه؟'],
  ['/care-guides/spaced-practice-study-calendar/', 'الممارسة المتباعدة'],
  ['/care-guides/sustained-attention-work-interval/', 'الانتباه المستمر'],
  ['/care-guides/working-memory-task-breakdown/', 'الذاكرة العاملة والمهام الطويلة'],
];

const disclaimerLabel = 'إخلاء المسؤولية والتنبيهات';
let failed = false;

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'));
  return match?.[1] || '';
}

function metaContent(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const tag = tags.find((candidate) => attr(candidate, 'name').toLowerCase() === name.toLowerCase());
  return tag ? attr(tag, 'content') : '';
}

function canonicalHref(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  const tag = tags.find((candidate) => attr(candidate, 'rel').toLowerCase().split(/\s+/).includes('canonical'));
  return tag ? attr(tag, 'href') : '';
}

async function verifyReviewedPublishedRoute(route, titleMarker) {
  try {
    const response = await fetch(`${base}${route}`, { redirect: 'manual' });
    const location = response.headers.get('location') || '';
    const html = await response.text();

    if (response.status !== 200 || location) {
      console.error(`WAVE004 ${route}: expected direct 200, got ${response.status} ${location}`);
      failed = true;
      return;
    }
    if (html.length < 5000 || !html.includes(titleMarker)) {
      console.error(`WAVE004 ${route}: rendered body/title marker missing or too small (${html.length})`);
      failed = true;
    }

    const robots = metaContent(html, 'robots').toLowerCase().replace(/\s+/g, '');
    if (!robots.includes('index') || !robots.includes('follow') || robots.includes('noindex') || robots.includes('nofollow')) {
      console.error(`WAVE004 ${route}: reviewed publication must render index,follow without noindex/nofollow; got ${robots || 'missing'}`);
      failed = true;
    }

    const canonical = canonicalHref(html);
    let canonicalOk = false;
    try {
      const parsed = new URL(canonical);
      const expected = new URL(`${canonicalOrigin}${route}`);
      canonicalOk = parsed.origin === expected.origin && parsed.pathname === expected.pathname;
    } catch {}
    if (!canonicalOk) {
      console.error(`WAVE004 ${route}: unexpected canonical ${canonical || 'missing'}`);
      failed = true;
    }

    if (!html.includes('href="/disclaimer"') || !html.includes(disclaimerLabel)) {
      console.error(`WAVE004 ${route}: visible central disclaimer contract missing`);
      failed = true;
    }
    if (!html.includes('المصادر والمراجع')) {
      console.error(`WAVE004 ${route}: references section missing`);
      failed = true;
    }

    console.log(`WAVE004 ${route}: reviewed 200 + index,follow + canonical + disclaimer + references checked`);
  } catch (error) {
    console.error(`WAVE004 ${route}:`, error);
    failed = true;
  }
}

for (const [route, titleMarker] of reviewedPublished) {
  await verifyReviewedPublishedRoute(route, titleMarker);
}

if (failed) process.exit(1);
console.log(`Wave 004 rendered smoke passed for ${reviewedPublished.length} reviewed, publication-ready, indexable pages.`);
