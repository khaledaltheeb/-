'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import styles from '@/app/assessment-lab/assessment-lab.module.css';

export type AssessmentDirectoryItem = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  audience: string;
  recallPeriod: string;
  estimatedMinutes: number;
  domainTitles: string[];
  itemCount: number;
};

type Props = {
  items: AssessmentDirectoryItem[];
  categories: string[];
};

function normalize(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .toLocaleLowerCase('ar');
}

export default function AssessmentLabDirectory({ items, categories }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('الكل');
  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return items.filter((item) => {
      const matchesCategory = category === 'الكل' || item.category === category;
      const haystack = normalize([item.title, item.summary, item.audience, ...item.domainTitles].join(' '));
      return matchesCategory && (!needle || haystack.includes(needle));
    });
  }, [category, items, query]);

  return <div className={styles.directoryInteractive}>
    <div className={styles.directoryTools}>
      <label className={styles.searchField}><span>ابحث باسم الأداة أو المجال</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثال: النوم، الأسرة، الانتباه" /></label>
      <div className={styles.categoryFilters} aria-label="تصفية حسب الموضوع">
        {['الكل', ...categories].map((value) => <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}
      </div>
    </div>
    <p className={styles.resultCount} aria-live="polite">{filtered.length === 0 ? 'لا توجد أداة مطابقة. جرّب كلمة أوسع أو اختر «الكل».' : `نعرض ${filtered.length} من ${items.length} أداة`}</p>
    <div className={styles.toolGrid}>
      {filtered.map((item) => <article className={styles.toolCard} key={item.slug}>
        <div className={styles.cardMeta}><span>{item.category}</span><span>{item.estimatedMinutes} دقائق</span></div>
        <h3><Link href={`/assessment-lab/${item.slug}`}>{item.title}</Link></h3>
        <p>{item.summary}</p>
        <dl><div><dt>الفترة</dt><dd>{item.recallPeriod}</dd></div><div><dt>البنية</dt><dd>{item.domainTitles.length} مجالات · {item.itemCount} بندًا</dd></div></dl>
        <p className={styles.domainList}>{item.domainTitles.join(' · ')}</p>
        <Link className={styles.cardAction} href={`/assessment-lab/${item.slug}`}>ابدأ الأداة <span aria-hidden="true">←</span></Link>
      </article>)}
    </div>
  </div>;
}
