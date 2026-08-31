import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const LEGACY_SHA = '6911d5ee75bd6fc2dfa12f394d61efe46e87df17';
const LEGACY_REPOSITORY = 'khaledaltheeb/healthrenewal.org';
const EXPECTED_PAGE_COUNT = 56; // hub + 55 guides

const PISRS_URL = 'https://pisrs.si/pregledPredpisa?id=DRUG4023';
const FSD_SLOVENE_URL = 'https://www.fsd.uni-lj.si/mma/-/2016091213042605/';
const FSD_ENGLISH_URL = 'https://www.fsd.uni-lj.si/mma/monografija_ang_elektronska_verzija/2017092010392030/';

const legacyRoot = path.resolve(process.argv[2] || '/tmp/legacy/evidence-guides/social-work');
const outRoot = path.join(ROOT, 'data', 'social-work-recovery');
const outHtmlRoot = path.join(outRoot, 'html');
const generatedModule = path.join(ROOT, 'lib', 'social-work-pages.generated.ts');

function fail(message) {
  throw new Error(`SOCIAL WORK RECOVERY FAILED: ${message}`);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function stripTags(value) {
  return String(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function routeForKey(key) {
  return key ? `/evidence-guides/social-work/${key}/` : '/evidence-guides/social-work/';
}

function sourceFitForKey(key) {
  if (!key) {
    return 'صفحة القطاع تنظّم المراجع المهنية والبحثية وتوضح حدود استخدامها في الأدلة العربية.';
  }
  if (/(ethics|privacy|involuntary|participation|voice|decision|disagreement|non-stigmatizing|advocacy)/.test(key)) {
    return 'يرتبط هذا الدليل مباشرة بمحور الحقوق والأخلاقيات والاستقلال المهني وحدود السلطة، مع الاستفادة من نموذج التشارك الأسري حيث يلزم.';
  }
  if (/(physical-activity|public-transport)/.test(key)) {
    return 'يرتبط هذا الدليل بفصول تطبيقية محددة في منشورات كلية العمل الاجتماعي بجامعة ليوبليانا، مع إبقاء القرارات الصحية أو الهندسية ضمن اختصاصاتها المهنية.';
  }
  if (/(co-created|working-relationship|desired-outcomes|strengths|multi-challenged|community-help|synergetic|family|home-based|collaborative|support-network|service-coordination|referral|progress|help-plan)/.test(key)) {
    return 'يرتبط هذا الدليل مباشرة بنموذج العمل التشاركي مع الأسرة والمجتمع، وبناء علاقة عمل ومشروع مساعدة ونتائج مرغوبة قابلة للمراجعة.';
  }
  return 'يستخدم هذا الدليل المصدرين كإطار أخلاقي ومهني مؤسس، ويحتفظ بالمراجع التخصصية الإضافية للموضوع عندما يتجاوز نطاقهما المباشر.';
}

function auditSection(key) {
  const fit = sourceFitForKey(key);
  return `<!-- RAWAFID_SOCIAL_WORK_SOURCE_AUDIT_V2_START -->
<section class="source-audit" data-source-audit="slovenia-social-work-2026">
  <h2>تتبّع المصدر وحدود الاستدلال</h2>
  <p><strong>صلة هذا الدليل بالمصادر:</strong> ${escapeHtml(fit)}</p>
  <div class="source-audit-grid">
    <article>
      <h3>1) مدونة المبادئ الأخلاقية في الرعاية الاجتماعية — سلوفينيا</h3>
      <p>مرجع رسمي صادر عن Social Chamber of Slovenia. نستخدمه لتأطير الكرامة وحقوق المستخدم والاستقلال المهني والمسؤولية وحدود استخدام السلطة، ولا ننقل منه التزامات قانونية إلى دولة عربية من دون الرجوع إلى القانون المحلي.</p>
      <p><a href="${PISRS_URL}" target="_blank" rel="noopener noreferrer">PISRS — Kodeks etičnih načel v socialnem varstvu (ID: DRUG4023)</a></p>
    </article>
    <article>
      <h3>2) الأسر متعددة التحديات: التشارك في بناء المساعدة داخل المجتمع</h3>
      <p>منشور أكاديمي من Faculty of Social Work, University of Ljubljana (2016). نستخدمه لفهم علاقة العمل التشاركية، مشروع المساعدة، النتائج المرغوبة، موارد الأسرة والمجتمع، والتنسيق عبر التحديات المتداخلة.</p>
      <p><a href="${FSD_SLOVENE_URL}" target="_blank" rel="noopener noreferrer">University of Ljubljana — Družine s številnimi izzivi: soustvarjanje pomoči v skupnosti</a></p>
      <p><a href="${FSD_ENGLISH_URL}" target="_blank" rel="noopener noreferrer">University of Ljubljana — Co-creating Processes of Help: Collaboration with Families in the Community</a></p>
    </article>
  </div>
  <div class="source-audit-note">
    <h3>كيف حررنا الصفحة؟</h3>
    <ul>
      <li>نحافظ على الفصل بين ما يورده المصدر، وما هو تنظيم أو تكييف عملي عربي من روافد.</li>
      <li>لا نعرض توصية مهنية أو قانونية محلية على أنها صادرة عن الجهة السلوفينية.</li>
      <li>إذا تجاوز الموضوع نطاق المصدرين، تبقى المراجع التخصصية الأصلية للصفحة جزءًا من سلسلة الاستدلال.</li>
      <li>ذكر الجهة أو المصدر لا يعني اعتمادًا أو شراكة أو مصادقة على محتوى روافد.</li>
    </ul>
  </div>
</section>
<!-- RAWAFID_SOCIAL_WORK_SOURCE_AUDIT_V2_END -->`;
}

function enhanceHtml(raw, key) {
  let html = raw.replace(/<!-- RAWAFID_SOCIAL_WORK_SOURCE_AUDIT_V2_START -->[\s\S]*?<!-- RAWAFID_SOCIAL_WORK_SOURCE_AUDIT_V2_END -->/g, '');
  const route = routeForKey(key);
  const canonical = `https://healthrenewal.org${route}`;

  if (!/<html\b[^>]*\blang=["']ar["'][^>]*\bdir=["']rtl["']/i.test(html)) {
    html = html.replace(/<html\b[^>]*>/i, '<html lang="ar" dir="rtl">');
  }

  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}">`);
  } else {
    html = html.replace(/<\/head>/i, `<link rel="canonical" href="${canonical}"></head>`);
  }

  if (/<meta\s+name=["']robots["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">');
  } else {
    html = html.replace(/<\/head>/i, '<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"></head>');
  }

  if (/<meta\s+property=["']og:url["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}">`);
  }

  const css = `.source-audit{background:#fff;border:1px solid #b8d6cc;border-radius:18px;padding:1.2rem;margin:1rem 0}.source-audit h2,.source-audit h3{color:#075d4d}.source-audit-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.9rem}.source-audit-grid article,.source-audit-note{background:#f7fbf9;border:1px solid #d4e6df;border-radius:14px;padding:1rem}.source-audit-note{margin-top:.9rem}.source-audit a{overflow-wrap:anywhere}`;
  if (/<\/style>/i.test(html) && !html.includes('.source-audit{')) {
    html = html.replace(/<\/style>/i, `${css}</style>`);
  }

  if (!/<main\b/i.test(html) || !/<\/main>/i.test(html)) fail(`missing <main> in ${route}`);
  html = html.replace(/<\/main>/i, `${auditSection(key)}</main>`);

  return html;
}

function discoverPages() {
  if (!fs.existsSync(legacyRoot)) fail(`legacy source directory missing: ${legacyRoot}`);
  const files = [];
  for (const entry of fs.readdirSync(legacyRoot, { withFileTypes: true })) {
    if (entry.isFile() && entry.name === 'index.html') files.push(path.join(legacyRoot, entry.name));
    if (!entry.isDirectory()) continue;
    const child = path.join(legacyRoot, entry.name, 'index.html');
    if (fs.existsSync(child)) files.push(child);
  }
  files.sort();
  if (files.length !== EXPECTED_PAGE_COUNT) fail(`expected ${EXPECTED_PAGE_COUNT} index.html pages, found ${files.length}`);
  return files;
}

fs.rmSync(outRoot, { recursive: true, force: true });
fs.mkdirSync(outHtmlRoot, { recursive: true });
fs.mkdirSync(path.dirname(generatedModule), { recursive: true });

const pages = {};
const manifestPages = [];
for (const file of discoverPages()) {
  const relative = path.relative(legacyRoot, file).replaceAll(path.sep, '/');
  const key = relative === 'index.html' ? '' : relative.replace(/\/index\.html$/, '');
  const route = routeForKey(key);
  const raw = fs.readFileSync(file, 'utf8');
  const enhanced = enhanceHtml(raw, key);
  const text = stripTags(enhanced);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 120) fail(`content too thin after recovery (${wordCount} words): ${route}`);
  if (!enhanced.includes('DRUG4023')) fail(`PISRS source missing after recovery: ${route}`);
  if (!enhanced.includes('2016091213042605')) fail(`University of Ljubljana source missing after recovery: ${route}`);
  if (!enhanced.includes('RAWAFID_SOCIAL_WORK_SOURCE_AUDIT_V2_START')) fail(`source audit marker missing: ${route}`);

  const outFile = key ? path.join(outHtmlRoot, key, 'index.html') : path.join(outHtmlRoot, 'index.html');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, enhanced);
  pages[key] = enhanced;
  manifestPages.push({
    key,
    route,
    source_path: `evidence-guides/social-work/${relative}`,
    original_sha256: sha256(raw),
    recovered_sha256: sha256(enhanced),
    word_count: wordCount,
  });
}

const manifest = {
  version: 2,
  generated_at: new Date().toISOString(),
  source: {
    repository: LEGACY_REPOSITORY,
    commit: LEGACY_SHA,
    directory: 'evidence-guides/social-work',
  },
  expected_page_count: EXPECTED_PAGE_COUNT,
  actual_page_count: manifestPages.length,
  institutional_sources: [
    { id: 'slovenia-social-care-ethics-drug4023', title: 'Kodeks etičnih načel v socialnem varstvu', publisher: 'Social Chamber of Slovenia', url: PISRS_URL },
    { id: 'ljubljana-families-multiple-challenges-2016', title: 'Družine s številnimi izzivi: soustvarjanje pomoči v skupnosti', publisher: 'Faculty of Social Work, University of Ljubljana', url: FSD_SLOVENE_URL },
    { id: 'ljubljana-co-creating-processes-2016-en', title: 'Co-creating Processes of Help: Collaboration with Families in the Community', publisher: 'Faculty of Social Work, University of Ljubljana', url: FSD_ENGLISH_URL },
  ],
  pages: manifestPages,
};
fs.writeFileSync(path.join(outRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const moduleText = `// AUTO-GENERATED by scripts/recover-social-work-sector.mjs\n// Source: ${LEGACY_REPOSITORY}@${LEGACY_SHA}\n// Do not edit by hand.\nexport const SOCIAL_WORK_SOURCE_SHA = ${JSON.stringify(LEGACY_SHA)} as const;\nexport const SOCIAL_WORK_PAGES: Record<string, string> = ${JSON.stringify(pages, null, 2)};\nexport const SOCIAL_WORK_SLUGS = Object.keys(SOCIAL_WORK_PAGES).sort();\n`;
fs.writeFileSync(generatedModule, moduleText);

console.log(`Recovered ${manifestPages.length} Social Work URLs from ${LEGACY_REPOSITORY}@${LEGACY_SHA}.`);
console.log(`Output: ${path.relative(ROOT, outRoot)} and ${path.relative(ROOT, generatedModule)}`);
