#!/usr/bin/env node
import process from 'node:process';
import { chromium } from 'playwright-core';

const executablePath = process.env.VISUAL_CHROME_PATH || '';
const base = (process.env.VISUAL_BASE_URL || process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
if (!executablePath) throw new Error('VISUAL_CHROME_PATH is required for page-image browser regression.');

const fixtures = [
  {
    name: 'long-arabic-article',
    kind: 'article',
    title: 'دليل عربي موسع لفهم الاحتياجات النفسية والاجتماعية والتعليمية ووضع خطة عملية واضحة قابلة للمتابعة مع الأسرة والمختصين دون مبالغة أو حشو',
  },
  {
    name: 'mixed-bidi-encyclopedia',
    kind: 'encyclopedia',
    title: 'اضطراب ADHD ونتائج PHQ-9 وGAD-7: كيف نفهم الأرقام 2026/2027 والحدود العلمية دون تحويلها إلى تشخيص ذاتي؟',
  },
  {
    name: 'oversized-token-care',
    kind: 'care-guide',
    title: 'PseudopseudohypoparathyroidismPseudopseudohypoparathyroidismPseudopseudohypoparathyroidism: دليل عملي للأسرة',
  },
  {
    name: 'diacritized-special-needs',
    kind: 'special-needs',
    title: 'التَّقييمُ الوظيفيُّ والتَّربويُّ للأطفال: كيف تُقرأُ النَّتائجُ وتُحدَّدُ الأولويَّاتُ بصورةٍ مسؤولة؟',
  },
  {
    name: 'escaping-comparison',
    kind: 'comparison',
    title: 'مقارنة <50%> و"الدرجة المرتفعة": ماذا تعني النتائج؟ وما الذي لا يمكن استنتاجه منها؟',
  },
];

const TITLE_SAFE = { left: 120, right: 1160, top: 245, bottom: 535 };
const TOLERANCE = 4;

function assertWithin(name, box) {
  const right = box.x + box.width;
  const bottom = box.y + box.height;
  if (box.x < TITLE_SAFE.left - TOLERANCE) throw new Error(`${name}: left overflow ${box.x} < ${TITLE_SAFE.left}`);
  if (right > TITLE_SAFE.right + TOLERANCE) throw new Error(`${name}: right overflow ${right} > ${TITLE_SAFE.right}`);
  if (box.y < TITLE_SAFE.top - TOLERANCE) throw new Error(`${name}: top overflow ${box.y} < ${TITLE_SAFE.top}`);
  if (bottom > TITLE_SAFE.bottom + TOLERANCE) throw new Error(`${name}: bottom overflow ${bottom} > ${TITLE_SAFE.bottom}`);
}

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  for (const fixture of fixtures) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const url = new URL('/page-image', base);
    url.searchParams.set('title', fixture.title);
    url.searchParams.set('kind', fixture.kind);

    const response = await page.goto(url.href, { waitUntil: 'load', timeout: 30000 });
    if (!response || response.status() !== 200) throw new Error(`${fixture.name}: expected HTTP 200 from page-image route.`);
    const contentType = response.headers()['content-type'] || '';
    if (!contentType.includes('image/svg+xml')) throw new Error(`${fixture.name}: expected image/svg+xml, got ${contentType}`);

    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });

    const result = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const clip = document.querySelector('#page-title-safe rect');
      const titleElements = [...document.querySelectorAll('g[clip-path="url(#page-title-safe)"] text')];
      const titleBoxes = titleElements.map((element) => {
        const box = element.getBBox();
        return {
          text: element.textContent || '',
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          anchor: element.getAttribute('text-anchor'),
          direction: element.getAttribute('direction'),
        };
      });
      return {
        canvas: svg ? { width: svg.getAttribute('width'), height: svg.getAttribute('height'), viewBox: svg.getAttribute('viewBox') } : null,
        clip: clip ? { x: clip.getAttribute('x'), y: clip.getAttribute('y'), width: clip.getAttribute('width'), height: clip.getAttribute('height') } : null,
        titleBoxes,
      };
    });

    if (!result.canvas || result.canvas.width !== '1280' || result.canvas.height !== '720' || result.canvas.viewBox !== '0 0 1280 720') {
      throw new Error(`${fixture.name}: page-image canvas contract changed.`);
    }
    if (!result.clip || result.clip.x !== '100' || result.clip.y !== '225' || result.clip.width !== '1080' || result.clip.height !== '330') {
      throw new Error(`${fixture.name}: page-image clipping safe area changed unexpectedly.`);
    }
    if (!result.titleBoxes.length || result.titleBoxes.length > 3) {
      throw new Error(`${fixture.name}: expected 1-3 title lines, got ${result.titleBoxes.length}.`);
    }

    for (const [index, box] of result.titleBoxes.entries()) {
      if (!box.text.trim()) throw new Error(`${fixture.name}: empty title line ${index + 1}.`);
      if (box.anchor !== 'start' || box.direction !== 'rtl') throw new Error(`${fixture.name}: title line ${index + 1} lost RTL start-edge anchoring.`);
      assertWithin(`${fixture.name} title line ${index + 1}`, box);
    }

    for (let index = 1; index < result.titleBoxes.length; index += 1) {
      const previousBottom = result.titleBoxes[index - 1].y + result.titleBoxes[index - 1].height;
      if (result.titleBoxes[index].y < previousBottom - TOLERANCE) {
        throw new Error(`${fixture.name}: page-image title lines overlap vertically.`);
      }
    }

    await page.close();
  }

  console.log(`Page-image browser regression passed: ${fixtures.length} pathological 1280x720 fixtures stay inside the rendered safe area with correct RTL anchoring.`);
} finally {
  await browser.close();
}
