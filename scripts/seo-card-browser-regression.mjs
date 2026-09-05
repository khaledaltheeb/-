#!/usr/bin/env node
import process from 'node:process';
import { chromium } from 'playwright-core';

const executablePath = process.env.VISUAL_CHROME_PATH || '';
const base = (process.env.VISUAL_BASE_URL || process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
if (!executablePath) throw new Error('VISUAL_CHROME_PATH is required for SEO card browser regression.');

const fixtures = [
  {
    name: 'long-arabic',
    title: 'دليل عربي موسع لفهم العوامل النفسية والاجتماعية والسريرية المرتبطة بالتعافي واتخاذ القرار الصحي الآمن مع معلومات عملية واضحة للأسرة والمختص',
    context: 'معرفة موثوقة · مصادر قابلة للتتبع · مسارات عملية',
  },
  {
    name: 'mixed-bidi',
    title: 'اضطراب ADHD وقياس PHQ-9 وGAD-7: كيف نفهم النتائج والأرقام 2026/2027 دون تحويلها إلى تشخيص ذاتي؟',
    context: 'مقال موثق · مصادر قابلة للتتبع · قراءة عربية واضحة',
  },
  {
    name: 'oversized-token',
    title: 'PseudopseudohypoparathyroidismPseudopseudohypoparathyroidismPseudopseudohypoparathyroidism وماذا يعني المصطلح طبيًا؟',
    context: 'معرفة موثوقة · مصادر قابلة للتتبع · مسارات عملية',
  },
  {
    name: 'punctuation-and-escaping',
    title: 'هل تعني نتيجة <50%> "تشخيصًا"؟ قراءة آمنة للنتائج، الحدود، الاحتمالات، وما الذي يجب فعله بعد ذلك',
    context: 'مقال موثق & مراجعة عربية واضحة · مصادر قابلة للتتبع',
  },
  {
    name: 'dense-arabic',
    title: 'التَّقييمُ النَّفسيُّ والسلوكيُّ للأطفال: ما الذي تعنيه الدرجات؟ ومتى تكون الإحالة المتخصصة ضرورية؟ وكيف نقرأ الحدود دون مبالغة؟',
    context: 'معرفة موثوقة · معلومات عامة · منصة روافد',
  },
];

const TITLE = { left: 180, right: 1080, top: 205, bottom: 430 };
const CONTEXT = { left: 180, right: 1080, top: 452, bottom: 520 };
const TOLERANCE = 3;

function assertWithin(name, box, safe) {
  const right = box.x + box.width;
  const bottom = box.y + box.height;
  if (box.x < safe.left - TOLERANCE) throw new Error(`${name}: left overflow ${box.x} < ${safe.left}`);
  if (right > safe.right + TOLERANCE) throw new Error(`${name}: right overflow ${right} > ${safe.right}`);
  if (box.y < safe.top - TOLERANCE) throw new Error(`${name}: top overflow ${box.y} < ${safe.top}`);
  if (bottom > safe.bottom + TOLERANCE) throw new Error(`${name}: bottom overflow ${bottom} > ${safe.bottom}`);
}

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  for (const fixture of fixtures) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    const url = new URL('/seo-card', base);
    url.searchParams.set('title', fixture.title);
    url.searchParams.set('context', fixture.context);

    const response = await page.goto(url.href, { waitUntil: 'load', timeout: 30000 });
    if (!response || response.status() !== 200) throw new Error(`${fixture.name}: expected HTTP 200 from SEO card route.`);
    const contentType = response.headers()['content-type'] || '';
    if (!contentType.includes('image/svg+xml')) throw new Error(`${fixture.name}: expected image/svg+xml, got ${contentType}`);

    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });

    const result = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const clip = document.querySelector('#safe-text rect');
      const dynamic = [...document.querySelectorAll('g[clip-path="url(#safe-text)"] text')];
      const boxes = dynamic.map((element) => {
        const box = element.getBBox();
        return {
          text: element.textContent || '',
          weight: element.getAttribute('font-weight') || '',
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        };
      });
      return {
        svg: svg ? { width: svg.getAttribute('width'), height: svg.getAttribute('height'), viewBox: svg.getAttribute('viewBox') } : null,
        clip: clip ? { x: clip.getAttribute('x'), y: clip.getAttribute('y'), width: clip.getAttribute('width'), height: clip.getAttribute('height') } : null,
        boxes,
      };
    });

    if (!result.svg || result.svg.width !== '1200' || result.svg.height !== '630' || result.svg.viewBox !== '0 0 1200 630') {
      throw new Error(`${fixture.name}: SEO card canvas contract changed.`);
    }
    if (!result.clip || result.clip.x !== '120' || result.clip.y !== '190' || result.clip.width !== '980' || result.clip.height !== '350') {
      throw new Error(`${fixture.name}: SEO card clipping safe area changed unexpectedly.`);
    }
    if (!result.boxes.length) throw new Error(`${fixture.name}: no dynamic title/context text was rendered.`);

    const titleBoxes = result.boxes.filter((box) => box.weight !== '500');
    const contextBoxes = result.boxes.filter((box) => box.weight === '500');
    if (!titleBoxes.length || titleBoxes.length > 3) throw new Error(`${fixture.name}: expected 1-3 title lines, got ${titleBoxes.length}.`);
    if (contextBoxes.length !== 1) throw new Error(`${fixture.name}: expected one context line, got ${contextBoxes.length}.`);

    for (const [index, box] of titleBoxes.entries()) {
      if (!box.text.trim()) throw new Error(`${fixture.name}: empty title line ${index + 1}.`);
      assertWithin(`${fixture.name} title line ${index + 1}`, box, TITLE);
    }
    for (const box of contextBoxes) {
      if (!box.text.trim()) throw new Error(`${fixture.name}: empty context line.`);
      assertWithin(`${fixture.name} context`, box, CONTEXT);
    }

    for (let index = 1; index < titleBoxes.length; index += 1) {
      const previousBottom = titleBoxes[index - 1].y + titleBoxes[index - 1].height;
      if (titleBoxes[index].y < previousBottom - TOLERANCE) {
        throw new Error(`${fixture.name}: title lines overlap vertically.`);
      }
    }

    const titleBottom = Math.max(...titleBoxes.map((box) => box.y + box.height));
    const contextTop = Math.min(...contextBoxes.map((box) => box.y));
    if (contextTop - titleBottom < 8) throw new Error(`${fixture.name}: title and context are visually colliding.`);

    await page.close();
  }

  console.log(`SEO card browser regression passed: ${fixtures.length} pathological Arabic/mixed-BiDi fixtures stay inside the rendered 1200x630 safe areas.`);
} finally {
  await browser.close();
}
