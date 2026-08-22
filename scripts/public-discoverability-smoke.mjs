const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';

const checks = [
  {
    route: '/all-pages',
    markers: ['كل الصفحات المنشورة', 'فهرس وصول مستقل', 'public-pagination'],
    minimumCards: 20,
  },
  {
    route: '/all-pages?page=2',
    markers: ['كل الصفحات المنشورة', 'public-pagination', 'aria-current="page"'],
    minimumCards: 20,
  },
  {
    route: '/sections/cognitive-terms-processes?page=2',
    markers: ['المصطلحات والعمليات المعرفية', 'public-pagination', 'aria-current="page"'],
  },
  {
    route: '/sectors/knowledge?page=2',
    markers: ['المعرفة والموسوعة', 'public-pagination', 'aria-current="page"'],
  },
  {
    route: `/all-pages?q=${encodeURIComponent('التوحد')}`,
    markers: ['كل الصفحات المنشورة', 'نتائج «التوحد»'],
  },
];

let failed = false;

for (const check of checks) {
  try {
    const response = await fetch(`${base}${check.route}`, { redirect: 'manual' });
    const body = await response.text();
    if (response.status !== 200) {
      console.error(`DISCOVERABILITY ${check.route}: expected 200, got ${response.status}`);
      failed = true;
      continue;
    }
    for (const marker of check.markers) {
      if (!body.includes(marker)) {
        console.error(`DISCOVERABILITY ${check.route}: missing marker ${marker}`);
        failed = true;
      }
    }
    if (check.minimumCards) {
      const cards = (body.match(/content-index-card/g) || []).length;
      if (cards < check.minimumCards) {
        console.error(`DISCOVERABILITY ${check.route}: expected at least ${check.minimumCards} indexed cards, got ${cards}`);
        failed = true;
      }
    }
    if (!failed) console.log(`DISCOVERABILITY ${check.route}: pagination/index markers verified`);
  } catch (error) {
    console.error(`DISCOVERABILITY ${check.route}:`, error);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('Rawafid public discoverability HTTP smoke checks passed.');
