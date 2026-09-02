'use client';

import { useMemo, useState } from 'react';
import type { AtlasInteraction, AtlasSubstance, InteractionEvidenceScope, InteractionSeverity } from '@/lib/addiction-atlas';
import styles from './addiction-atlas.module.css';

type Props = { substances: AtlasSubstance[]; interactions: AtlasInteraction[] };

const severityLabel = { moderate: 'متوسط', high: 'مرتفع', critical: 'حرج' } as const;
const scopeLabel = { 'direct-pair': 'دليل مباشر للزوج', 'class-to-substance': 'دليل فئة مطبق على المادة', 'class-to-class': 'دليل بين فئتين' } as const;

export default function AddictionInteractionBrowser({ substances, interactions }: Props) {
  const supportedSlugs = useMemo(() => new Set(interactions.flatMap((item) => [item.a, item.b])), [interactions]);
  const options = substances.filter((item) => supportedSlugs.has(item.slug));
  const [a, setA] = useState(options[0]?.slug ?? '');
  const [b, setB] = useState(options[1]?.slug ?? '');
  const [substanceFilter, setSubstanceFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | InteractionSeverity>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | InteractionEvidenceScope>('all');
  const match = interactions.find((item) => (item.a === a && item.b === b) || (item.a === b && item.b === a));
  const bySlug = new Map(substances.map((item) => [item.slug, item]));
  const filtered = interactions.filter((item) => {
    if (substanceFilter !== 'all' && item.a !== substanceFilter && item.b !== substanceFilter) return false;
    if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
    if (scopeFilter !== 'all' && item.evidence_scope !== scopeFilter) return false;
    return true;
  });

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

    <div className={styles.section}>
      <h2>سجل التفاعلات المراجعة</h2>
      <p>هذه ليست مصفوفة أمان شاملة؛ هي قائمة بالأزواج التي تمت مراجعتها فقط. الفراغ خارج هذه القائمة يعني «غير مراجع بعد».</p>
      <div className={styles.compareBox}>
        <label>المادة<select value={substanceFilter} onChange={(event) => setSubstanceFilter(event.target.value)}><option value="all">كل المواد</option>{options.map((item) => <option key={item.slug} value={item.slug}>{item.display_name_ar}</option>)}</select></label>
        <label>شدة التنبيه<select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as 'all' | InteractionSeverity)}><option value="all">الكل</option><option value="critical">حرج</option><option value="high">مرتفع</option><option value="moderate">متوسط</option></select></label>
        <label>نطاق الدليل<select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value as 'all' | InteractionEvidenceScope)}><option value="all">الكل</option><option value="direct-pair">مباشر للزوج</option><option value="class-to-substance">فئة إلى مادة</option><option value="class-to-class">فئة إلى فئة</option></select></label>
      </div>
      <p><strong>{filtered.length}</strong> سجلًا مطابقًا للفلاتر من أصل <strong>{interactions.length}</strong>.</p>
      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>المادة الأولى</th><th>المادة الثانية</th><th>التنبيه</th><th>قوة الدليل</th><th>نطاق الدليل</th><th>الخطر السريري</th><th>المصادر</th></tr></thead>
          <tbody>{filtered.map((item) => <tr key={item.id}><td>{bySlug.get(item.a)?.display_name_ar ?? item.a}</td><td>{bySlug.get(item.b)?.display_name_ar ?? item.b}</td><td>{severityLabel[item.severity]}</td><td>{item.evidence_grade}</td><td>{scopeLabel[item.evidence_scope]}</td><td>{item.risk_ar}</td><td>{item.source_urls.map((url, index) => <span key={url}>{index ? ' · ' : ''}<a href={url} target="_blank" rel="noopener noreferrer">مصدر {index + 1}</a></span>)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  </section>;
}