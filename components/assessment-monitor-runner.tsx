'use client';

import { useMemo, useState } from 'react';
import styles from '@/app/assessment-lab/assessment-lab.module.css';

type Question = { axis: string; text: string };
type Props = { title: string; questions: Question[] };

const options = ['لا ينطبق', 'قليلًا', 'أحيانًا', 'غالبًا', 'بدرجة شديدة'] as const;

export default function AssessmentMonitorRunner({ title, questions }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const axes = useMemo(() => [...new Set(questions.map((question) => question.axis))], [questions]);
  const answered = Object.keys(answers).length;

  function clearForm() {
    setAnswers({});
    setNotes({});
  }

  return <section className={styles.runner} aria-labelledby="monitor-runner-title">
    <div className={styles.runnerHeading}>
      <div><span className={styles.eyebrow}>متابعة ذاتية غير تشخيصية</span><h2 id="monitor-runner-title">{title}</h2><p>الفترة المرجعية: الأسبوع الماضي. اختر الوصف الأقرب لكل بند، ثم دوّن مثالًا واحدًا لكل محور إن كان ذلك مفيدًا.</p></div>
      <div className={styles.progress} aria-live="polite"><strong>{answered}</strong><span>من {questions.length} بندًا</span></div>
    </div>

    <div className={styles.privacy}><strong>خصوصية:</strong> الإجابات والملاحظات تبقى في حالة الصفحة الحالية فقط. لا يوجد إرسال للخادم ولا حفظ في الحساب أو Local Storage، ولا توجد درجة إجمالية أو تصنيف آلي.</div>

    <div className={styles.axisList}>
      {axes.map((axis) => {
        const indexed = questions.map((question, index) => ({ question, index })).filter(({ question }) => question.axis === axis);
        return <fieldset className={styles.axisCard} key={axis}>
          <legend>{axis}</legend>
          {indexed.map(({ question, index }) => <div className={styles.question} key={question.text}>
            <p>{question.text}</p>
            <div className={styles.options} role="radiogroup" aria-label={question.text}>
              {options.map((option) => <label key={option}><input type="radio" name={`assessment-q-${index}`} value={option} checked={answers[index] === option} onChange={() => setAnswers((current) => ({ ...current, [index]: option }))}/><span>{option}</span></label>)}
            </div>
          </div>)}
          <label className={styles.note}><span>ملاحظة اختيارية لهذا المحور</span><textarea rows={3} maxLength={900} value={notes[axis] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [axis]: event.target.value }))} placeholder="مثال محدد: متى حدث؟ ما السياق؟ ما الذي ساعد؟"/></label>
        </fieldset>;
      })}
    </div>

    <section className={styles.interpretation} aria-labelledby="interpretation-title"><h3 id="interpretation-title">كيف تستخدم النتيجة؟</h3><p>لا تجمع الإجابات في نسبة واحدة. المحاور هنا خليط من صعوبات وعوامل حماية، لذلك تحويلها إلى «درجة شدة» عامة سيعطي معنى زائفًا. استخدم الورقة لملاحظة التغير عبر الوقت، وتحديد مثال أو سؤال تريد مناقشته مع شخص داعم أو مختص عند الحاجة.</p></section>
    <div className={styles.actions}><button type="button" onClick={() => window.print()}>طباعة المتابعة</button><button type="button" className={styles.secondary} onClick={clearForm}>مسح الإجابات</button></div>
  </section>;
}
