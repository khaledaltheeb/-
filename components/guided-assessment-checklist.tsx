'use client';

import { useState } from 'react';
import styles from '@/app/guided-assessment/guided-assessment.module.css';

type Props = {
  title: string;
  questions: string[];
};

export default function GuidedAssessmentChecklist({ title, questions }: Props) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const reviewed = Object.values(checked).filter(Boolean).length;

  function clearForm() {
    setChecked({});
    setNotes({});
  }

  return (
    <section className={styles.checklist} aria-labelledby="guided-checklist-title">
      <div className={styles.checklistHeading}>
        <div>
          <span className={styles.eyebrow}>ورقة تحضير خاصة بك</span>
          <h2 id="guided-checklist-title">{title}</h2>
          <p>راجع ما ينطبق عليك، واكتب أمثلة موجزة إن رغبت. لا يوجد مجموع نقاط ولا نتيجة آلية.</p>
        </div>
        <div className={styles.reviewCount} aria-live="polite">
          <strong>{reviewed}</strong>
          <span>من {questions.length} بندًا راجعتها</span>
        </div>
      </div>

      <div className={styles.privacyNotice} role="note">
        <strong>خصوصية الجلسة:</strong> ما تكتبه هنا يبقى في ذاكرة الصفحة الحالية فقط؛ هذا المكوّن لا يرسل الإجابات إلى الخادم ولا يحفظها في الحساب أو قاعدة البيانات. مسح الصفحة أو الضغط على «مسح الملاحظات» يزيلها من هذه الجلسة.
      </div>

      <ol className={styles.questionList}>
        {questions.map((question, index) => (
          <li key={question} className={styles.questionCard}>
            <label className={styles.questionCheck}>
              <input
                type="checkbox"
                checked={Boolean(checked[index])}
                onChange={(event) => setChecked((current) => ({ ...current, [index]: event.target.checked }))}
              />
              <span>{question}</span>
            </label>
            <label className={styles.notesLabel}>
              <span>ملاحظة اختيارية أو مثال محدد</span>
              <textarea
                value={notes[index] || ''}
                onChange={(event) => setNotes((current) => ({ ...current, [index]: event.target.value }))}
                rows={3}
                maxLength={900}
                placeholder="مثال: متى حدث؟ ما السياق؟ ماذا كان الأثر؟"
              />
            </label>
          </li>
        ))}
      </ol>

      <div className={styles.actions}>
        <button type="button" onClick={() => window.print()}>طباعة هذه الصفحة</button>
        <button type="button" className={styles.secondaryButton} onClick={clearForm}>مسح الملاحظات</button>
      </div>
    </section>
  );
}
