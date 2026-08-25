const base = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const canonicalOrigin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://healthrenewal.org').replace(/\/$/, '');

const pages = [
  {
    route: '/care-guides/suicide-risk-conversation-safety-plan/',
    title: 'دليل الحوار عند الاشتباه بخطر الانتحار وبناء خطة أمان',
    markers: [
      'لا تختزل القرار في تصنيف',
      'ما الذي تنقله إلى الطبيب أو فريق الطوارئ؟',
      'راجع خطة الأمان بعد كل أزمة أو تغير مهم',
    ],
  },
  {
    route: '/care-guides/self-harm-family-safety-support/',
    title: 'دليل الأسرة عند إيذاء النفس: استجابة آمنة دون وصم',
    markers: [
      'بعد إيذاء النفس افصل بين ثلاثة أسئلة مختلفة',
      'ما الذي يجب أن تنتظره الأسرة من التقييم النفسي الاجتماعي؟',
      'إذا تكرر إيذاء النفس أو لم تنجح الخطة الحالية',
    ],
  },
];

const removedTemplateMarker = 'إطار التنفيذ والمتابعة الموسّع';
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

for (const page of pages) {
  try {
    const response = await fetch(`${base}${page.route}`, { redirect: 'manual' });
    const location = response.headers.get('location') || '';
    const html = await response.text();

    if (response.status !== 200 || location) {
      console.error(`V7_CRITICAL ${page.route}: expected direct 200, got ${response.status} ${location}`);
      failed = true;
      continue;
    }
    if (html.length < 8000 || !html.includes(page.title)) {
      console.error(`V7_CRITICAL ${page.route}: rendered body/title marker missing or too small (${html.length})`);
      failed = true;
    }

    const robots = metaContent(html, 'robots').toLowerCase().replace(/\s+/g, '');
    if (!robots.includes('index') || !robots.includes('follow') || robots.includes('noindex') || robots.includes('nofollow')) {
      console.error(`V7_CRITICAL ${page.route}: expected robots index,follow without noindex/nofollow; got ${robots || 'missing'}`);
      failed = true;
    }

    const canonical = canonicalHref(html);
    let canonicalOk = false;
    try {
      const actual = new URL(canonical);
      const expected = new URL(`${canonicalOrigin}${page.route}`);
      canonicalOk = actual.origin === expected.origin && actual.pathname === expected.pathname;
    } catch {}
    if (!canonicalOk) {
      console.error(`V7_CRITICAL ${page.route}: unexpected canonical ${canonical || 'missing'}`);
      failed = true;
    }

    if (!html.includes('href="/disclaimer"') || !html.includes('إخلاء المسؤولية')) {
      console.error(`V7_CRITICAL ${page.route}: central disclaimer link missing`);
      failed = true;
    }
    if (!html.includes('المصادر والمراجع')) {
      console.error(`V7_CRITICAL ${page.route}: references section missing`);
      failed = true;
    }
    for (const marker of page.markers) {
      if (!html.includes(marker)) {
        console.error(`V7_CRITICAL ${page.route}: topic-specific rewrite marker missing: ${marker}`);
        failed = true;
      }
    }
    if (html.includes(removedTemplateMarker)) {
      console.error(`V7_CRITICAL ${page.route}: removed generic V7 template marker is still rendered`);
      failed = true;
    }

    if (!html.includes('"lastReviewed"') || !html.includes('"reviewedBy"') || !html.includes('فريق روافد')) {
      console.error(`V7_CRITICAL ${page.route}: structured review provenance missing from JSON-LD`);
      failed = true;
    }

    const visibleHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    if (visibleHtml.includes('آخر مراجعة') || visibleHtml.includes('تمت المراجعة بواسطة') || visibleHtml.includes('مراجع</strong> من فريق روافد')) {
      console.error(`V7_CRITICAL ${page.route}: metadata-only review provenance leaked into the visible page`);
      failed = true;
    }

    console.log(`V7_CRITICAL ${page.route}: 200 + index,follow + canonical + structured review + visual parity verified`);
  } catch (error) {
    console.error(`V7_CRITICAL ${page.route}:`, error);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`V7 critical rewrite rendered smoke passed for ${pages.length} reviewed indexable pages with metadata-only review provenance.`);
