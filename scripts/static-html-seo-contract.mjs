import assert from 'node:assert/strict';
import { hardenStaticHtmlSeo } from '../lib/static-html-seo.ts';

const count = (html, needle) => html.split(needle).length - 1;
const title = (html) => html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '';

const bare = '<!doctype html><html lang="ar"><head><title>دليل عملي قصير | روافد</title><meta name="description" content="وصف عربي واضح للصفحة."><link rel="canonical" href="https://healthrenewal.org/evidence-guides/social-work/example/"></head><body><h1>مثال</h1></body></html>';
const hardenedBare = hardenStaticHtmlSeo(bare);
assert.equal(count(hardenedBare, 'property="og:title"'), 1);
assert.equal(count(hardenedBare, 'property="og:description"'), 1);
assert.equal(count(hardenedBare, 'property="og:url"'), 1);
assert.equal(count(hardenedBare, 'name="twitter:card"'), 1);
assert.equal(count(hardenedBare, 'name="twitter:title"'), 1);
assert.equal(count(hardenedBare, 'name="twitter:description"'), 1);
assert.equal(count(hardenedBare, 'type="application/ld+json"'), 1);
assert.equal(hardenStaticHtmlSeo(hardenedBare), hardenedBare, 'hardening must be idempotent');

const existing = '<!doctype html><html lang="ar"><head><title>صفحة موجودة | روافد</title><meta name="description" content="وصف موجود."><link rel="canonical" href="https://healthrenewal.org/evidence-guides/palliative-care/example/"><meta property="og:type" content="article"><meta property="og:locale" content="ar_AR"><meta property="og:title" content="صفحة موجودة"><meta property="og:description" content="وصف موجود."><meta property="og:url" content="https://healthrenewal.org/evidence-guides/palliative-care/example/"><script type="application/ld+json">{"@context":"https://schema.org","@type":"MedicalWebPage"}</script></head><body><h1>مثال</h1></body></html>';
const hardenedExisting = hardenStaticHtmlSeo(existing);
assert.equal(count(hardenedExisting, 'property="og:title"'), 1, 'existing OpenGraph metadata must not be duplicated');
assert.equal(count(hardenedExisting, 'type="application/ld+json"'), 1, 'existing JSON-LD must not be duplicated');
assert.equal(count(hardenedExisting, 'name="twitter:card"'), 1, 'missing Twitter metadata must be added');

const longTitle = 'هذا عنوان عربي طويل جدًا لاختبار تقصير عنوان الصفحة بطريقة تحافظ على الكلمات ولا تتجاوز الحد المسموح به في بوابة تحسين محركات البحث | روافد';
const longHtml = `<!doctype html><html lang="ar"><head><title>${longTitle}</title><meta name="description" content="وصف اختبار."><link rel="canonical" href="https://healthrenewal.org/evidence-guides/rare-disease/example/"></head><body><h1>مثال</h1></body></html>`;
const hardenedLong = hardenStaticHtmlSeo(longHtml);
assert.ok(Array.from(title(hardenedLong)).length <= 65, 'title must be at most 65 Unicode code points');
assert.ok(!title(hardenedLong).endsWith(' '), 'title must not end with whitespace');

const collection = hardenStaticHtmlSeo(bare, { collection: true });
assert.ok(collection.includes('<meta property="og:type" content="website">'));
assert.ok(collection.includes('"@type":"CollectionPage"'));

console.log('Static evidence-guide SEO hardening contract passed.');
