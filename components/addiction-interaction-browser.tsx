'use client';

import { useMemo, useState } from 'react';
import type { AtlasInteraction, AtlasSubstance } from '@/lib/addiction-atlas';
import styles from './addiction-atlas.module.css';

type Props = { substances: AtlasSubstance[]; interactions: AtlasInteraction[] };

const severityLabel = { moderate: 'متوسط', high: 'مرتفع', critical: 'حرج' } as const;
const scopeLabel = { 'direct-pair': 'دليل مباشر للزوج', 'class-to-substance': 'دليل فئة مطبق على المادة', 'class-to-class': 'دليل بين فئتين' } as const;

export default function AddictionInteractionBrowser({ substances, interactions }: Props) {
  const supportedSlugs = useMemo(() => new Set(interactions.flatMap((item) => [item.a, item.b])), [interactions]);
  const options = substances.filter((item) => supportedSlugs.has(item.slug));
  const [a, setA] = useState(options[0]?.slug ?? '');
  const [b, setB] = useState(options[1]?.slug ?? '');
  const match = interactions.find((item) => (item.a === a && item.b === b) || (item.a === b && item.b === a));
  const bySlug = new Map(substances.map((item) => [item.slug, item]));

  return <section className={styles.section} aria-labelledby="interaction-explorer-title">
    <h2 id="interaction-explorer-title">افحص تفاعلاً تمت مراجعته</h2>
    <p>لا تُنشئ الأداة حكماً آلياً لأي زوج غير موجود في قاعدة الأدلة. عدم ظهور تفاعل يعني «غير مراجع بعد» وليس «آمناً».</p>
    <div className={styles.compareBox}>
      <label>المادة الأولى<select value={a} onChange={(event) => setA(event.target.value)}>{options.map((item) => <option key={item.slug} value={item.slug}>{item.display_name_ar} — {item.display_name_en}</option>)}</select></label>
      <button type="button" onClick={() => { setA(b); setB(a); }}>تبديل</button>
      <label>المادة الثانية<select value={b} onChange={(event) => setB(event.target.value)}>{options.map((item) => <option key={item.slug} value={item.slug}>{item.display_name_ar} — {item.display_name_en}</option>)}</select></label>
    </div>
    {a === b ? <div className={styles.notice}><strong>اختر مادتين مختلفتين.</strong></div> : match ? <article className={styles.card}>
      <h3>{bySlug.get(a)?.display_name_ar} + {bySlug.get(b)?.display_name_ar}</h3>
      <p><strong>مستوى التنبيه:</strong> {severityLabel[match.severity]} · <strong>قوة الدليل:</strong> {match.evidence_grade} · <strong>نطاقه:</strong> {scopeLabel[match.evidence_scope]}</p>
      <p><strong>لماذا قد يكون الجمع خطراً؟</strong> {match.mechanism_ar}</p>
      <p><strong>الخطر السريري:</strong> {match.risk_ar}</p>
      <p><strong>عند الاشتباه بطارئ:</strong> {match.emergency_ar}</p>
      <h4>المصادر</h4><ul className={styles.sources}>{match.source_urls.map((url) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>)}</ul>
    </article> : <div className={styles.notice}><strong>هذا الزوج غير مراجع بعد في طبقة التفاعلات.</strong><p>لا يمكن استنتاج الأمان من غياب السجل. راجع الصفحتين الفرديتين واطلب المشورة الطبية أو الصيدلانية عند وجود أدوية موصوفة.</p></div>}
  </section>;
}
