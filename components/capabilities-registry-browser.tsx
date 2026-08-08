'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CapabilityRegistryItem } from '@/lib/capabilities';
import styles from './capabilities-registry-browser.module.css';

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

type Props = { items: CapabilityRegistryItem[] };

export default function CapabilitiesRegistryBrowser({ items }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [route, setRoute] = useState('');

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => item.categoryKey && map.set(item.categoryKey, item.category));
    return Array.from(map.entries());
  }, [items]);

  const routes = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => item.evidenceRouteKey && map.set(item.evidenceRouteKey, item.evidenceRoute));
    return Array.from(map.entries());
  }, [items]);

  const normalizedQuery = normalizeSearch(query);
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (category && item.categoryKey !== category) return false;
        if (route && item.evidenceRouteKey !== route) return false;
        if (!normalizedQuery) return true;
        const haystack = normalizeSearch(`${item.title} ${item.titleEn} ${item.category} ${item.evidenceRoute}`);
        return haystack.includes(normalizedQuery);
      }),
    [items, category, route, normalizedQuery],
  );

  return (
    <section className={styles.registry} aria-labelledby="capabilities-registry-browser-title">
      <div className={styles.heading}>
        <div>
          <span>100 حالة · بحث مباشر</span>
          <h2 id="capabilities-registry-browser-title">ابحث في سجل القدرات</h2>
        </div>
        <p>اكتب الاسم العربي أو الإنجليزي، أو صفِّ النتائج حسب المجال ومسار الدليل.</p>
      </div>

      <div className={styles.filters}>
        <label>
          <span>بحث بالاسم</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="مثال: التوحد، الشلل الدماغي، dyslexia"
            autoComplete="off"
          />
        </label>
        <label>
          <span>المجال</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">كل المجالات</option>
            {categories.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>مسار الدليل</span>
          <select value={route} onChange={(event) => setRoute(event.target.value)}>
            <option value="">كل المسارات</option>
            {routes.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={styles.reset}
          onClick={() => {
            setQuery('');
            setCategory('');
            setRoute('');
          }}
        >
          مسح المرشحات
        </button>
      </div>

      <p className={styles.status} role="status" aria-live="polite">
        <strong>{filtered.length}</strong> حالة ظاهرة من {items.length}.
      </p>

      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((item) => (
            <article className={styles.card} key={item.slug}>
              <div className={styles.cardTop}>
                <span className={styles.rank}>{String(item.rank).padStart(2, '0')}</span>
                <span className={styles.route}>{item.evidenceRoute}</span>
              </div>
              <h3><Link href={item.href}>{item.title}</Link></h3>
              {item.titleEn ? <p lang="en" dir="ltr">{item.titleEn}</p> : null}
              <small>{item.category}</small>
              <Link className={styles.open} href={item.href}>فتح الدليل الكامل ←</Link>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>لا توجد نتيجة مطابقة. جرّب اسمًا أو مرشحًا آخر.</div>
      )}
    </section>
  );
}
