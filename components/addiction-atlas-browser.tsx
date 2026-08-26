'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { atlasSearchText, RISK_KEYS, type AtlasComparison, type AtlasMethodology, type AtlasSubstance, type RiskKey } from '@/lib/addiction-atlas';
import styles from './addiction-atlas.module.css';

type Props = { substances: AtlasSubstance[]; methodology: AtlasMethodology; comparisons: AtlasComparison[] };

function normalize(value: string) {
  return value.toLocaleLowerCase('ar').normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function riskBadge(value: AtlasSubstance['risk'][RiskKey]) {
  return value == null ? <span className={`${styles.risk} ${styles.unknown}`}>غير محسوم</span> : <span className={styles.risk}>{value}/5</span>;
}

export default function AddictionAtlasBrowser({ substances, methodology, comparisons }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [evidence, setEvidence] = useState('all');
  const [sortKey, setSortKey] = useState<string>('display_name_ar');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [aSlug, setASlug] = useState(substances.find((item) => item.slug === 'fentanyl')?.slug ?? substances[0]?.slug ?? '');
  const [bSlug, setBSlug] = useState(substances.find((item) => item.slug === 'heroin')?.slug ?? substances[1]?.slug ?? '');

  const categories = useMemo(() => [...new Set(substances.map((item) => item.class_ar))].sort((a, b) => a.localeCompare(b, 'ar')), [substances]);
  const filtered = useMemo(() => {
    const q = normalize(query);
    const rows = substances.filter((item) => {
      if (category !== 'all' && item.class_ar !== category) return false;
      if (evidence !== 'all' && item.evidence_grade !== evidence) return false;
      return !q || normalize(atlasSearchText(item)).includes(q);
    });
    return [...rows].sort((a, b) => {
      if (sortKey.startsWith('risk.')) {
        const key = sortKey.slice(5) as RiskKey;
        return ((a.risk[key] ?? -1) - (b.risk[key] ?? -1)) * sortDir;
      }
      const av = sortKey === 'class_ar' ? a.class_ar : a.display_name_ar;
      const bv = sortKey === 'class_ar' ? b.class_ar : b.display_name_ar;
      return av.localeCompare(bv, 'ar') * sortDir;
    });
  }, [substances, query, category, evidence, sortKey, sortDir]);

  const a = substances.find((item) => item.slug === aSlug);
  const b = substances.find((item) => item.slug === bSlug);
  const canonicalComparison = comparisons.find((item) => item.indexable && ((item.a === aSlug && item.b === bSlug) || (item.a === bSlug && item.b === aSlug)));
  const sort = (key: string) => {
    if (sortKey === key) setSortDir((value) => value === 1 ? -1 : 1);
    else { setSortKey(key); setSortDir(key.startsWith('risk.') ? -1 : 1); }
  };

  return <>
    <div className={styles.controls}>
      <label><span>ابحث بالاسم أو المرادف</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="فنتانيل، Fentanyl، زاناكس…" /></label>
      <label><span>الفئة</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">كل الفئات</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>قوة الدليل</span><select value={evidence} onChange={(event) => setEvidence(event.target.value)}><option value="all">كل المستويات</option>{Object.entries(methodology.evidence_grades).map(([key, item]) => <option key={key} value={key}>{key} — {item.label_ar}</option>)}</select></label>
    </div>
    <p className={styles.count}><strong>{filtered.length}</strong> مادة/عائلة ظاهرة. القيم ترتيبية داخل كل محور وليست نسبة خطر فردية.</p>
    <div className={styles.tableWrap} tabIndex={0} aria-label="جدول أطلس المواد">
      <table className={styles.table}><thead><tr>
        <th><button type="button" onClick={() => sort('display_name_ar')}>المادة ↕</button></th><th><button type="button" onClick={() => sort('class_ar')}>الفئة ↕</button></th>
        {RISK_KEYS.map((key) => <th key={key}><button type="button" onClick={() => sort(`risk.${key}`)}>{methodology.risk_dimensions[key].label_ar} ↕</button></th>)}<th>الدليل</th>
      </tr></thead><tbody>
        {filtered.map((item) => <tr key={item.slug}><td><Link className={styles.name} href={`/addiction/substances/${item.slug}/`}>{item.display_name_ar}<small dir="ltr">{item.display_name_en}</small></Link></td><td>{item.class_ar}</td>{RISK_KEYS.map((key) => <td key={key}>{riskBadge(item.risk[key])}</td>)}<td><span className={styles.grade}>{item.evidence_grade}</span></td></tr>)}
        {!filtered.length ? <tr><td colSpan={11} className={styles.empty}>لا توجد نتيجة مطابقة.</td></tr> : null}
      </tbody></table>
    </div>

    <section className={styles.section} aria-labelledby="atlas-compare-title">
      <h2 id="atlas-compare-title">مقارنة تفاعلية بين مادتين</h2>
      <p>المقارنة تعرض محاور مستقلة ولا تعني أن المادة ذات الدرجة الأقل في محور معين آمنة.</p>
      <div className={styles.compareBox}>
        <label><span>المادة الأولى</span><select value={aSlug} onChange={(event) => setASlug(event.target.value)}>{substances.map((item) => <option key={item.slug} value={item.slug}>{item.display_name_ar} — {item.display_name_en}</option>)}</select></label>
        <button type="button" onClick={() => { setASlug(bSlug); setBSlug(aSlug); }}>⇄ تبديل</button>
        <label><span>المادة الثانية</span><select value={bSlug} onChange={(event) => setBSlug(event.target.value)}>{substances.map((item) => <option key={item.slug} value={item.slug}>{item.display_name_ar} — {item.display_name_en}</option>)}</select></label>
      </div>
      {a && b && a.slug !== b.slug ? <>
        <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>المحور</th><th>{a.display_name_ar}</th><th>{b.display_name_ar}</th></tr></thead><tbody><tr><th>الفئة</th><td>{a.class_ar}</td><td>{b.class_ar}</td></tr>{RISK_KEYS.map((key) => <tr key={key}><th>{methodology.risk_dimensions[key].label_ar}</th><td>{riskBadge(a.risk[key])}</td><td>{riskBadge(b.risk[key])}</td></tr>)}<tr><th>قوة الدليل</th><td>{a.evidence_grade}</td><td>{b.evidence_grade}</td></tr></tbody></table></div>
        <div className={styles.actions}><Link href={`/addiction/substances/${a.slug}/`}>صفحة {a.display_name_ar}</Link><Link href={`/addiction/substances/${b.slug}/`}>صفحة {b.display_name_ar}</Link>{canonicalComparison ? <Link href={`/addiction/compare/${canonicalComparison.slug}/`}>المقارنة التحريرية الكاملة</Link> : null}</div>
      </> : <p className={styles.empty}>اختر مادتين مختلفتين.</p>}
    </section>
  </>;
}
