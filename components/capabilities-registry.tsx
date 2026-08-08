'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CapabilityRegistryItem } from '@/lib/capabilities';

type Props = { items: CapabilityRegistryItem[] };

function normalizeSearch(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export default function CapabilitiesRegistry({ items }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [route, setRoute] = useState('');

  const categories = useMemo(() => {
    const values = new Map<string, string>();
    items.forEach((item) => values.set(item.category, item.categoryLabel));
    return [...values.entries()].sort((a, b) => a[1].localeCompare(b[1], 'ar'));
  }, [items]);

  const routes = useMemo(() => {
    const values = new Map<string, string>();
    items.forEach((item) => values.set(item.route, item.routeLabel));
    return [...values.entries()].sort((a, b) => a[1].localeCompare(b[1], 'ar'));
  }, [items]);

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query);
    return items.filter((item) => {
      if (category && item.category !== category) return false;
      if (route && item.route !== route) return false;
      if (!needle) return true;
      return normalizeSearch(`${item.titleAr} ${item.titleEn} ${item.categoryLabel} ${item.routeLabel}`).includes(needle);
    });
  }, [items, query, category, route]);

  function reset() {
    setQuery('');
    setCategory('');
    setRoute('');
  }

  return (
    <section className="cap-registry-panel" aria-labelledby="cap-registry-title">
      <div className="cap-registry-heading">
        <div>
          <span className="eyebrow">100 حالة · صفحات Canonical</span>
          <h2 id="cap-registry-title">ابحث في سجل القدرات</h2>
          <p>ابحث بالاسم العربي أو الإنجليزي، ثم صفِّ حسب المجال أو مسار الدليل. البحث للتنقل داخل المرجع وليس للتشخيص.</p>
        </div>
        <strong aria-live="polite">{filtered.length} / {items.length}</strong>
      </div>

      <div className="cap-registry-filters" role="search">
        <label>
          <span>اسم الحالة</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="مثال: التوحد أو cerebral palsy"
            autoComplete="off"
          />
        </label>
        <label>
          <span>المجال</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">كل المجالات</option>
            {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          <span>مسار الدليل</span>
          <select value={route} onChange={(event) => setRoute(event.target.value)}>
            <option value="">كل مسارات الدليل</option>
            {routes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button type="button" className="cap-registry-reset" onClick={reset}>مسح المرشحات</button>
      </div>

      {filtered.length > 0 ? (
        <div className="cap-registry-grid">
          {filtered.map((item) => (
            <article className="cap-registry-card" key={item.slug}>
              <div className="cap-registry-card-top">
                <span className="cap-rank" aria-label={`الرقم التنظيمي ${item.rank}`}>{String(item.rank).padStart(2, '0')}</span>
                <span className="cap-evidence-route">{item.routeLabel}</span>
              </div>
              <small>{item.categoryLabel}</small>
              <h3><Link href={item.href}>{item.titleAr}</Link></h3>
              {item.titleEn && <p lang="en" dir="ltr">{item.titleEn}</p>}
              <Link className="cap-registry-link" href={item.href}>فتح الدليل الكامل <span aria-hidden="true">←</span></Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="cap-registry-empty" role="status">
          <strong>لا توجد نتيجة مطابقة.</strong>
          <p>جرّب جزءًا أقصر من الاسم أو امسح أحد المرشحات.</p>
          <button type="button" onClick={reset}>إعادة ضبط البحث</button>
        </div>
      )}
    </section>
  );
}
