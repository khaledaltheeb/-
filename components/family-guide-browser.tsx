'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { FamilyGuideItem } from '@/lib/family-guide';
import styles from './family-guide-browser.module.css';

function normalizeSearch(value: string) {
  return value.normalize('NFKD').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').replace(/[إأآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ـ/g, '').toLowerCase().trim();
}

export default function FamilyGuideBrowser({ items }: { items: FamilyGuideItem[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort(), [items]);
  const normalized = normalizeSearch(query);
  const filtered = useMemo(() => items.filter((item) => {
    if (category && item.category !== category) return false;
    if (!normalized) return true;
    return normalizeSearch(`${item.title} ${item.titleEn} ${item.category}`).includes(normalized);
  }), [items, category, normalized]);

  return (
    <section className={styles.browser} aria-labelledby="family-guide-browser-title">
      <div className={styles.heading}>
        <div><span>دليل قابل للبحث</span><h2 id="family-guide-browser-title">ابحث عن الحالة أو اسمها الإنجليزي</h2></div>
        <p>الفهرس مخصص للأسرة: يبدأ بالفهم الصحيح ثم ينتقل إلى الخطوات اليومية والمتابعة والأمان والاستقلال.</p>
      </div>
      <div className={styles.filters}>
        <label><span>بحث</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثال: التوحد، داون، CDKL5" autoComplete="off" /></label>
        <label><span>المجال</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">كل المجالات</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <button type="button" onClick={() => { setQuery(''); setCategory(''); }}>مسح المرشحات</button>
      </div>
      <p className={styles.status} role="status" aria-live="polite"><strong>{filtered.length}</strong> دليلًا ظاهرًا من {items.length}.</p>
      <div className={styles.grid}>
        {filtered.map((item) => (
          <article className={styles.card} key={item.href}>
            <div className={styles.cardTop}><span>{String(item.rank).padStart(2, '0')}</span><small>{item.category}</small></div>
            <h3><Link href={item.href}>{item.title}</Link></h3>
            {item.titleEn ? <p lang="en" dir="ltr">{item.titleEn}</p> : null}
            <Link className={styles.open} href={item.href}>فتح الدليل الكامل ←</Link>
          </article>
        ))}
      </div>
      {!filtered.length ? <div className={styles.empty}>لا توجد نتيجة مطابقة. جرّب اسمًا عربيًا أو إنجليزيًا آخر.</div> : null}
    </section>
  );
}
