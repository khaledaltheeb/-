'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { AddictionItem } from '@/lib/addiction';
import styles from './addiction-browser.module.css';

type Props = { items: AddictionItem[] };

function normalize(value: string) {
  return value.toLocaleLowerCase('ar').normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();
}

export default function AddictionBrowser({ items }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ar')), [items]);
  const filtered = useMemo(() => {
    const q = normalize(query);
    return items.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      return normalize(`${item.title} ${item.titleEn} ${item.category} ${item.slug}`).includes(q);
    });
  }, [items, query, category]);

  return <section className={styles.browser} aria-labelledby="addiction-browser-title">
    <div className={styles.heading}><div><span>فهرس الحالات</span><h2 id="addiction-browser-title">ابحث في ملفات الإدمان والتعافي</h2></div><strong>{filtered.length} من {items.length}</strong></div>
    <div className={styles.controls}>
      <label><span>بحث</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثال: أفيونات، كحول، ألعاب رقمية" type="search" /></label>
      <label><span>النوع</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">كل الأنواع</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    </div>
    <div className={styles.grid}>{filtered.map((item) => <article key={item.slug} className={styles.card}><span className={styles.rank}>{String(item.rank).padStart(2, '0')}</span><div><p>{item.category}</p><h3><Link href={item.href}>{item.title}</Link></h3>{item.titleEn ? <small dir="ltr">{item.titleEn}</small> : null}</div></article>)}</div>
    {!filtered.length ? <p className={styles.empty}>لا توجد نتيجة مطابقة. جرّب اسم المادة أو نوع السلوك أو المصطلح بالإنجليزية.</p> : null}
  </section>;
}
