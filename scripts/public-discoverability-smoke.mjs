const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
let failed = false;
const fail = (message) => { console.error(`PUBLIC DISCOVERABILITY SMOKE FAILED: ${message}`); failed = true; };

async function html(path) {
  const response = await fetch(`${base}${path}`, { redirect: 'manual' });
  const body = await response.text();
  if (response.status !== 200) fail(`${path} expected 200, got ${response.status}`);
  return { response, body };
}

try {
  const index = await html('/all-pages');
  for (const marker of ['كل سجلات المحتوى المنشورة', 'فهرس وصول مستقل', 'فهرس المحتوى المنشور']) {
    if (!index.body.includes(marker)) fail(`/all-pages missing ${marker}`);
  }
  if (!/rel=["']canonical["'][^>]+\/all-pages|href=["'][^"']*\/all-pages[^"']*["'][^>]+rel=["']canonical["']/i.test(index.body)) {
    fail('/all-pages missing canonical metadata');
  }

  const searched = await html('/all-pages?q=%D8%A7%D9%84%D8%AF%D8%B9%D9%85');
  if (!searched.body.toLowerCase().includes('noindex')) fail('/all-pages search results must remain noindex');

  const specialists = await html('/specialists?page=2');
  if (!specialists.body.includes('دليل المختصين') || !specialists.body.includes('تطبيق الفلاتر')) fail('/specialists pagination view missing directory controls');

  const centers = await html('/centers?page=2');
  if (!centers.body.includes('دليل المراكز') || !centers.body.includes('تطبيق الفلاتر')) fail('/centers pagination view missing directory controls');

  const sitemap = await html('/sitemaps/static.xml');
  if (!sitemap.body.includes('/all-pages')) fail('/sitemaps/static.xml must advertise /all-pages');
} catch (error) {
  console.error('PUBLIC DISCOVERABILITY SMOKE ERROR:', error);
  failed = true;
}

if (failed) process.exit(1);
console.log('Public discoverability smoke passed: published-content index, noindex search state, directory pagination views, and static sitemap resolve correctly.');
