'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RISK_KEYS, type AtlasComparison, type AtlasInteraction, type AtlasMethodology, type AtlasSubstance, type RiskKey } from '@/lib/addiction-atlas';
import { getAdfDrugFactReference } from '@/lib/adf-addiction';
import styles from './addiction-atlas.module.css';

type Props = { substances: AtlasSubstance[]; methodology: AtlasMethodology; comparisons: AtlasComparison[]; interactions: AtlasInteraction[] };

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

function shortList(values: string[], fallback = 'غير مدون في سجل الأطلس الحالي') {
  if (!values.length) return fallback;
  return <ul>{values.slice(0, 3).map((value) => <li key={value}>{value}</li>)}</ul>;
}

export default function AddictionComparisonExplorer({ substances, methodology, comparisons, interactions }: Props) {
  const [aSlug, setASlug] = useState(substances.find((item) => item.slug === 'fentanyl')?.slug ?? substances[0]?.slug ?? '');
  const [bSlug, setBSlug] = useState(substances.find((item) => item.slug === 'heroin')?.slug ?? substances[1]?.slug ?? '');
  const a = substances.find((item) => item.slug === aSlug);
  const b = substances.find((item) => item.slug === bSlug);
  const editorial = comparisons.find((item) => item.indexable && ((item.a === aSlug && item.b === bSlug) || (item.a === bSlug && item.b === aSlug)));
  const interactionCount = (slug: string) => interactions.filter((item) => item.a === slug || item.b === slug).length;

  return <section className={styles.section} aria-labelledby="interactive-comparison-title">
    <h2 id="interactive-comparison-title">قارن مادتين تفاعليًا</h2>
    <p>اختر مادتين لعرض الفروق عبر المحاور الثمانية، ثم راجع المقارنة السريرية والوصفية. فرق الدرجة لا يساوي نسبة خطر شخصية ولا يثبت أن المادة ذات الدرجة الأقل آمنة.</p>
    <div className={styles.compareBox}>
      <label><span>المادة الأولى</span><select value={aSlug} onChange={(event) => setASlug(event.target.value)}>{substances.map((item) => <option key={item.slug} value={item.slug}>{item.display_name_ar} — {item.display_name_en}</option>)}</select></label>
      <button type="button" onClick={() => { setASlug(bSlug); setBSlug(aSlug); }} aria-label="تبديل المادتين">⇄ تبديل</button>
      <label><span>المادة الثانية</span><select value={bSlug} onChange={(event) => setBSlug(event.target.value)}>{substances.map((item) => <option key={item.slug} value={item.slug}>{item.display_name_ar} — {item.display_name_en}</option>)}</select></label>
    </div>

    {a && b && a.slug !== b.slug ? <>
      <div className={styles.tableWrap} tabIndex={0} aria-label={`مقارنة محاور الخطر بين ${a.display_name_ar} و${b.display_name_ar}`}>
        <table className={styles.table}>
          <thead><tr><th>المحور</th><th>{a.display_name_ar}</th><th>{b.display_name_ar}</th><th>قراءة الفرق</th></tr></thead>
          <tbody>
            <tr><th>الفئة</th><td>{a.class_ar}</td><td>{b.class_ar}</td><td>اختلاف الفئة قد يعني اختلافًا في الآلية والمخاطر السريرية.</td></tr>
            {RISK_KEYS.map((key) => <tr key={key}><th>{methodology.risk_dimensions[key].label_ar}</th><td>{riskValue(a.risk[key])}</td><td>{riskValue(b.risk[key])}</td><td>{interpretation(a, b, key)}</td></tr>)}
            <tr><th>قوة الدليل العامة</th><td>{a.evidence_grade}</td><td>{b.evidence_grade}</td><td>درجة الدليل تصف قوة قاعدة المعلومات وليست شدة الخطر.</td></tr>
          </tbody>
        </table>
      </div>

      <h3>المقارنة السريرية والوصفية</h3>
      <p>هذه الطبقة تقارن محتوى السجل نفسه ولا تختزل القرار في رقم. صيغت بنيتها لتغطي أسئلة التأثيرات والانسحاب والطوارئ والتداخلات التي تظهر عادة في مصادر Drug Facts المهنية.</p>
      <div className={styles.tableWrap} tabIndex={0} aria-label={`مقارنة سريرية بين ${a.display_name_ar} و${b.display_name_ar}`}>
        <table className={styles.table}>
          <thead><tr><th>البعد</th><th>{a.display_name_ar}</th><th>{b.display_name_ar}</th></tr></thead>
          <tbody>
            <tr><th>الاستخدام الطبي</th><td>{a.medical_use_ar || 'لا يوجد استخدام طبي مدون في سجل الأطلس الحالي.'}</td><td>{b.medical_use_ar || 'لا يوجد استخدام طبي مدون في سجل الأطلس الحالي.'}</td></tr>
            <tr><th>أبرز التأثيرات الحادة</th><td>{shortList(a.acute_effects_ar)}</td><td>{shortList(b.acute_effects_ar)}</td></tr>
            <tr><th>أبرز الأضرار مع الاستخدام المتكرر</th><td>{shortList(a.long_term_harms_ar)}</td><td>{shortList(b.long_term_harms_ar)}</td></tr>
            <tr><th>ضرر محتمل من تعرض واحد</th><td>{a.single_exposure_harm_ar}</td><td>{b.single_exposure_harm_ar}</td></tr>
            <tr><th>الانسحاب</th><td>{a.withdrawal_ar}</td><td>{b.withdrawal_ar}</td></tr>
            <tr><th>العلاج والرعاية</th><td>{a.treatment_ar}</td><td>{b.treatment_ar}</td></tr>
            <tr><th>علامات الطوارئ والاستجابة</th><td>{a.emergency_response_ar}</td><td>{b.emergency_response_ar}</td></tr>
            <tr><th>تفاعلات مراجعة مرتبطة</th><td>{interactionCount(a.slug)} سجلًا مراجعًا</td><td>{interactionCount(b.slug)} سجلًا مراجعًا</td></tr>
            <tr><th>ADF Drug Facts — مرجع خارجي موازٍ</th><td>{getAdfDrugFactReference(a) ? <a href={getAdfDrugFactReference(a)!.url} target="_blank" rel="noopener noreferrer">{getAdfDrugFactReference(a)!.title}</a> : 'لا توجد مطابقة مباشرة في خريطة ADF الحالية.'}</td><td>{getAdfDrugFactReference(b) ? <a href={getAdfDrugFactReference(b)!.url} target="_blank" rel="noopener noreferrer">{getAdfDrugFactReference(b)!.title}</a> : 'لا توجد مطابقة مباشرة في خريطة ADF الحالية.'}</td></tr>
          </tbody>
        </table>
      </div>
      <div className={styles.notice}><strong>قاعدة تفسير</strong><p>لا تعني قلة النص أو قلة عدد التفاعلات المراجعة أن المادة أقل خطرًا. «لا توجد مطابقة ADF» تعني فقط عدم وجود رابط مباشر في خريطة المراجع الحالية، لا نقصًا في جودة سجل روافد.</p></div>

      <div className={styles.actions}>
        <Link href={`/addiction/substances/${a.slug}/`}>ملف {a.display_name_ar}</Link>
        <Link href={`/addiction/substances/${b.slug}/`}>ملف {b.display_name_ar}</Link>
        <Link href="/addiction/interactions/">افتح طبقة التفاعلات</Link>
        {editorial ? <Link href={`/addiction/compare/${editorial.slug}/`}>فتح المقارنة التحريرية الكاملة</Link> : <Link href="/addiction/methodology/">كيف نفسر المقارنة؟</Link>}
      </div>
      {!editorial ? <div className={styles.notice}><strong>لا توجد مقارنة تحريرية مستقلة لهذا الزوج بعد.</strong><p>الجدول يعرض البيانات المحورية والسريرية المنشورة فقط. لا نولّد استنتاجًا تحريريًا آليًا عندما لا توجد مقارنة مراجعة ومخصصة لهذا الزوج.</p></div> : null}
    </> : <div className={styles.notice}><strong>اختر مادتين مختلفتين.</strong></div>}
  </section>;
}
