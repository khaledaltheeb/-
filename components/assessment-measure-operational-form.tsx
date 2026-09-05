import type { AssessmentOperationalMaterial, OperationalItem } from '@/lib/assessment-measure-operational';
import styles from '@/components/assessment-measures.module.css';

function OperationalInput({ item }: { item: OperationalItem }) {
  if (item.type === 'choice' || item.type === 'task-score') {
    const allowsMultiple = item.code.startsWith('LEC');
    return (
      <div className={styles.formOptions} role="group" aria-label={item.labelAr}>
        {(item.options ?? []).map((option) => (
          <label key={`${item.code}-${option.value}`} className={styles.formOption}>
            <input
              type={allowsMultiple ? 'checkbox' : 'radio'}
              name={allowsMultiple ? `${item.code}-${option.value}` : item.code}
              value={option.value}
            />
            <span>{option.labelAr}</span>
          </label>
        ))}
      </div>
    );
  }

  if (item.type === 'checkbox') {
    return <label className={styles.formCheck}><input type="checkbox" name={item.code} /><span>تم</span></label>;
  }

  if (item.type === 'number' || item.type === 'time' || item.type === 'distance') {
    return (
      <div className={styles.formNumber}>
        <input type="number" name={item.code} min={item.min} max={item.max} step="any" aria-label={item.labelAr} />
        {item.unit && <span>{item.unit}</span>}
      </div>
    );
  }

  return <textarea name={item.code} rows={2} aria-label={item.labelAr} />;
}

export default function AssessmentMeasureOperationalForm({ material, printable = false }: { material: AssessmentOperationalMaterial; printable?: boolean }) {
  return (
    <article className={printable ? styles.printForm : styles.operationalForm} aria-label={material.titleAr}>
      <header className={styles.formHeader}>
        <div>
          <div className={styles.eyebrow}>{material.completeness === 'exact-public-domain-form' ? 'النموذج/السلم نفسه' : 'ورقة تطبيق وتسجيل'}</div>
          <h2>{material.titleAr}</h2>
          {material.titleEn && <div className={styles.englishName} lang="en" dir="ltr">{material.titleEn} · {material.version}</div>}
        </div>
        <div className={styles.formStatus}>
          <strong>{material.completeness === 'exact-public-domain-form' ? 'محتوى المقياس مدرج' : material.completeness === 'standardized-protocol-sheet' ? 'بروتوكول تطبيقي' : 'ورقة تسجيل معيارية'}</strong>
          <span>تحقق: {material.lastVerifiedOn}</span>
        </div>
      </header>

      <div className={styles.formNotice}>
        <strong>المصدر والحقوق:</strong> {material.provenance}
        <br />
        <span>{material.rightsNotice}</span>
      </div>

      <section className={styles.formBlock}>
        <h3>بيانات التطبيق</h3>
        <div className={styles.demographicGrid}>
          {material.respondentFields.map((field) => (
            <label key={field}><span>{field}</span><input type="text" /></label>
          ))}
        </div>
      </section>

      <section className={styles.formBlock}>
        <h3>قبل البدء</h3>
        <div className={styles.checkGrid}>
          {material.preflightChecks.map((check, index) => (
            <label key={`${check}-${index}`} className={styles.checkRow}><input type="checkbox" /><span>{check}</span></label>
          ))}
        </div>
      </section>

      {material.sections.map((section, sectionIndex) => (
        <section className={styles.formBlock} key={`${section.titleAr}-${sectionIndex}`}>
          <h3>{section.titleAr}</h3>
          {section.instructionsAr && <p className={styles.formInstructions}>{section.instructionsAr}</p>}
          <div className={styles.formItems}>
            {section.items.map((item) => (
              <div className={styles.formItem} key={item.code}>
                <div className={styles.formPrompt}>
                  <strong>{item.code}</strong>
                  <span>{item.labelAr}</span>
                  {item.labelEn && <small lang="en" dir="ltr">{item.labelEn}</small>}
                  {item.noteAr && <em>{item.noteAr}</em>}
                </div>
                <OperationalInput item={item} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className={styles.formBlock}>
        <h3>التسجيل والحساب</h3>
        <ol>{material.scoringSteps.map((step) => <li key={step}>{step}</li>)}</ol>
        <div className={styles.scoreLine}><span>الدرجة/النتيجة النهائية</span><strong>________________</strong></div>
      </section>

      <section className={styles.formBlock}>
        <h3>حدود التفسير</h3>
        <ul>{material.interpretationGuardrails.map((rule) => <li key={rule}>{rule}</li>)}</ul>
      </section>

      {material.stopRules.length > 0 && (
        <section className={styles.formSafety}>
          <h3>قواعد الإيقاف والسلامة</h3>
          <ul>{material.stopRules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
        </section>
      )}

      {material.officialDownloads && material.officialDownloads.length > 0 && (
        <section className={styles.formBlock}>
          <h3>النسخ والمصادر الرسمية</h3>
          <div className={styles.sourceList}>
            {material.officialDownloads.map((download) => (
              <a key={download.url} href={download.url} target="_blank" rel="noreferrer">{download.label} — {download.publisher} ↗</a>
            ))}
          </div>
        </section>
      )}

      <footer className={styles.formFooter}>
        <strong>روافد | Health Renewal</strong>
        <span>ورقة تطبيق تعليمية/سريرية مساندة. لا تُستخدم خارج شروط الأداة ولا تستبدل الحكم المهني أو دليل التدريب عند الحاجة.</span>
      </footer>
    </article>
  );
}
