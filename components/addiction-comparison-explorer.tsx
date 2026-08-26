'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RISK_KEYS, type AtlasComparison, type AtlasMethodology, type AtlasSubstance, type RiskKey } from '@/lib/addiction-atlas';
import styles from './addiction-atlas.module.css';

type Props = { substances: AtlasSubstance[]; methodology: AtlasMethodology; comparisons: AtlasComparison[] };

function riskValue(value: AtlasSubstance['risk'][RiskKey]) {
  return value == null ? <span className={`${styles.risk} ${styles.unknown}`}>غير محسوم</span> : <span className={styles.risk}>{value}/5</span>;
}

function interpretation(a: AtlasSubstance, b: AtlasSubstance, key: RiskKey) {
  const aValue = a.risk[key];
  const bValue = b.risk[key];
  if (aValue == null || bValue == null) return 'لا تكفي البيانات للمقارنة في هذا المحور.';
  if (aValue === bValue) return 'الدرجة المحورية متقاربة في نسخة البيانات الحالية.';
  return aValue > bValue ? `${a.display_name_ar} أعلى في هذا المحور.` : `${b.display_name_ar} أعلى في هذا المحور.`;
}

export default function AddictionComparisonExplorer({ substances, methodology, comparisons }: Props) {
  const [aSlug, setASlug] = useState(substances.find((item) => item.slug === 'fentanyl')?.slug ?? substances[0]?.slug ?? '');
  const [bSlug, setBSlug] = useState(substances.find((item) => item.slug === 'heroin')?.slug ?? substances[1]?.slug ?? '');
  const a = substances.find((item) => item.slug === aSlug);
  const b = substances.find((item) => item.slug === bSlug);
  const editorial = comparisons.find((item) => item.indexable && ((item.a === aSlug && item.b === bSlug) || (item.a === bSlug && item.b === aSlug)));

  return <section className={styles.section} aria-labelledby="interactive-comparison-title">
    <h2 id="interactive-comparison-title">قارن مادتين تفاعليًا</h2>
    <p>اختر مادتين لعرض الفروق عبر المحاور الثمانية. هذه المقارنة وصفية داخل مقياس الأطلس؛ فرق الدرجة لا يساوي نسبة خطر شخصية ولا يثبت أن المادة ذات الدرجة الأقل آمنة.</p>
    <div className={styles.compareBox}>
      <label><span>المادة الأولى</span><select value={aSlug} onChange={(event) => setASlug(event.target.value)}>{substances.map((item) => <option key={item.slug} value={item.slug}>{item.display_name_ar} — {item.display_name_en}</option>)}</select></label>
      <button type="button" onClick={() => { setASlug(bSlug); setBSlug(aSlug); }} aria-label="تبديل المادتين">⇄ تبديل</button>
      <label><span>المادة الثانية</span><select value={bSlug} onChange={(event) => setBSlug(event.target.value)}>{substances.map((item) => <option key={item.slug} value={item.slug}>{item.display_name_ar} — {item.display_name_en}</option>)}</select></label>
    </div>

    {a && b && a.slug !== b.slug ? <>
      <div className={styles.tableWrap} tabIndex={0} aria-label={`مقارنة ${a.display_name_ar} و${b.display_name_ar}`}>
        <table className={styles.table}>
          <thead><tr><th>المحور</th><th>{a.display_name_ar}</th><th>{b.display_name_ar}</th><th>قراءة الفرق</th></tr></thead>
          <tbody>
            <tr><th>الفئة</th><td>{a.class_ar}</td><td>{b.class_ar}</td><td>اختلاف الفئة قد يعني اختلافًا في الآلية والمخاطر السريرية.</td></tr>
            {RISK_KEYS.map((key) => <tr key={key}><th>{methodology.risk_dimensions[key].label_ar}</th><td>{riskValue(a.risk[key])}</td><td>{riskValue(b.risk[key])}</td><td>{interpretation(a, b, key)}</td></tr>)}
            <tr><th>قوة الدليل العامة</th><td>{a.evidence_grade}</td><td>{b.evidence_grade}</td><td>درجة الدليل تصف قوة قاعدة المعلومات وليست شدة الخطر.</td></tr>
          </tbody>
        </table>
      </div>
      <div className={styles.actions}>
        <Link href={`/addiction/substances/${a.slug}/`}>ملف {a.display_name_ar}</Link>
        <Link href={`/addiction/substances/${b.slug}/`}>ملف {b.display_name_ar}</Link>
        {editorial ? <Link href={`/addiction/compare/${editorial.slug}/`}>فتح المقارنة التحريرية الكاملة</Link> : <Link href="/addiction/methodology/">كيف نفسر المقارنة؟</Link>}
      </div>
      {!editorial ? <div className={styles.notice}><strong>لا توجد مقارنة تحريرية مستقلة لهذا الزوج بعد.</strong><p>الجدول يعرض البيانات المحورية المنشورة فقط. لا نولّد استنتاجًا تحريريًا آليًا عندما لا توجد مقارنة مراجعة ومخصصة لهذا الزوج.</p></div> : null}
    </> : <div className={styles.notice}><strong>اختر مادتين مختلفتين.</strong></div>}
  </section>;
}
