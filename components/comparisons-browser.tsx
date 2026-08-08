'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ComparisonItem } from '@/lib/comparisons';
import styles from './comparisons-browser.module.css';

function normalizeSearch(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ـ/g, '')
    .toLowerCase()
    .trim();
}

type Props = { items: ComparisonItem[] };

export default function ComparisonsBrowser({ items }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => item.categoryKey && map.set(item.categoryKey, item.category));
    return Array.from(map.entries());
  }, [items]);

  const normalizedQuery = normalizeSearch(query);
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (category && item.categoryKey !== category) return false;
        if (!normalizedQuery) return true;
        const haystack = normalizeSearch(`${item.title} ${item.conceptA} ${item.conceptB} ${item.category} ${item.slug.replaceAll('-', ' ')}`);
        return haystack.includes(normalizedQuery);
      }),
    [items, category, normalizedQuery],
  );

  return (
    <section className={styles.registry} id="comparison-browser" aria-labelledby="comparison-browser-title">
      <div className={styles.heading}>
        <div>
          <span>50 مقارنة Canonical · 6 مسارات معرفية</span>
          <h2 id="comparison-browser-title">ابحث في موسوعة المقارنات</h2>
        </div>
        <p>اكتب أي طرف من المقارنة بالعربية أو الإنجليزية، أو صفِّ حسب المجال. كل بطاقة تقود إلى مرجع واحد موسع بدل صفحتين متنافستين.</p>
      </div>

      <div className={styles.filters}>
        <label>
          <span>بحث في المقارنات</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثال: القلق، ADHD، الصدق، الذاكرة" autoComplete="off" />
        </label>
        <label>
          <span>المجال</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">كل المجالات</option>
            {categories.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <button type="button" className={styles.reset} onClick={() => { setQuery(''); setCategory(''); }}>مسح المرشحات</button>
      </div>

      <p className={styles.status} role="status" aria-live="polite"><strong>{filtered.length}</strong> مقارنة ظاهرة من {items.length}.</p>

      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((item) => (
            <article className={styles.card} key={item.slug}>
              <div className={styles.cardTop}>
                <span className={styles.rank}>{String(item.rank).padStart(2, '0')}</span>
                <span className={styles.category}>{item.category}</span>
              </div>
              <h3><Link href={item.href}>{item.title}</Link></h3>
              <div className={styles.concepts}><span>{item.conceptA}</span><b aria-hidden="true">↔</b><span>{item.conceptB}</span></div>
              <Link className={styles.open} href={item.href}>فتح المقارنة الكاملة ←</Link>
            </article>
          ))}
        </div>
      ) : <div className={styles.empty}>لا توجد مقارنة مطابقة. جرّب اسمًا آخر أو أزل مرشح المجال.</div>}
    </section>
  );
}
