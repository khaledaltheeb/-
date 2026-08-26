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
  const complete = answered === questions.length;
  const completion = Math.round((answered / questions.length) * 100);

  function clearForm() {
    setAnswers({});
    setNotes({});
  }

  return <section className={styles.runner} aria-labelledby="monitor-runner-title">
    <div className={styles.runnerHeading}>
      <div>
        <span className={styles.eyebrow}>متابعة ذاتية غير تشخيصية</span>
        <h2 id="monitor-runner-title">{title}</h2>
        <p>الفترة المرجعية: الأسبوع الماضي. اقرأ كل بند بوصفه سؤال ملاحظة، لا اختبار نجاح أو فشل. اختر الوصف الأقرب، ثم أضف مثالًا واقعيًا إذا كان سيساعدك على تذكر السياق.</p>
      </div>
      <div className={styles.progress} aria-live="polite">
        <strong>{completion}%</strong>
        <span>{answered} من {questions.length} بندًا</span>
      </div>
    </div>

    <div className={styles.privacy}><strong>خصوصية:</strong> الإجابات والملاحظات تبقى في ذاكرة هذه الصفحة فقط. لا يوجد إرسال للخادم، ولا حفظ في الحساب أو Local Storage أو Session Storage. عند إغلاق الصفحة أو تحديثها تضيع الإجابات.</div>

    <div className={styles.boundary}><strong>مهم:</strong> هذه الأداة ليست مقياسًا نفسيًا مقننًا ولا تحسب درجة تشخيصية. فائدتها في تنظيم الملاحظة، مقارنة الأسبوع الحالي بأسابيع أخرى، وتجهيز أمثلة محددة لمناقشتها مع مختص عند الحاجة.</div>

    <div className={styles.axisList}>
      {axes.map((axis) => {
        const indexed = questions.map((question, index) => ({ question, index })).filter(({ question }) => question.axis === axis);
        const axisAnswered = indexed.filter(({ index }) => answers[index]).length;
        return <fieldset className={styles.axisCard} key={axis}>
          <legend>{axis}</legend>
          <div className={styles.axisMeta}>{axisAnswered} من {indexed.length} بنود مكتملة</div>
          {indexed.map(({ question, index }) => <div className={styles.question} key={question.text}>
            <p>{question.text}</p>
            <div className={styles.options} role="radiogroup" aria-label={question.text}>
              {options.map((option) => <label key={option}>
                <input type="radio" name={`assessment-q-${index}`} value={option} checked={answers[index] === option} onChange={() => setAnswers((current) => ({ ...current, [index]: option }))}/>
                <span>{option}</span>
              </label>)}
            </div>
          </div>)}
          <label className={styles.note}>
            <span>ملاحظة اختيارية لهذا المحور</span>
            <textarea rows={3} maxLength={900} value={notes[axis] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [axis]: event.target.value }))} placeholder="مثال محدد: ماذا حدث؟ متى؟ ما الذي زاد الصعوبة أو خففها؟"/>
          </label>
        </fieldset>;
      })}
    </div>

    <section className={styles.interpretation} aria-labelledby="interpretation-title">
      <h3 id="interpretation-title">كيف تقرأ إجاباتك؟</h3>
      <p>لا تجمع الإجابات في نسبة واحدة ولا تقارنها بدرجات أشخاص آخرين. راقب بدلًا من ذلك ثلاثة أشياء: ما المحور الذي تكرر فيه التأثير، ما السياق الذي يزيده أو يخففه، وهل تغيرت قدرتك على أداء حياتك اليومية. هذه المعلومات أكثر فائدة من رقم كلي غير مقنن.</p>
      {complete ? <p className={styles.completeNotice}><strong>اكتملت المتابعة.</strong> راجع ملاحظاتك، واختر مثالين أو ثلاثة تريد الاحتفاظ بهما أو مناقشتهما. يمكنك طباعة الصفحة؛ لن تُحفظ الإجابات على الموقع.</p> : <p>يمكنك التوقف في أي وقت. عدم إكمال الأداة لا يعني شيئًا سريريًا.</p>}
    </section>

    <div className={styles.actions}>
      <button type="button" onClick={() => window.print()}>طباعة المتابعة</button>
      <button type="button" className={styles.secondary} onClick={clearForm}>مسح الإجابات</button>
    </div>
  </section>;
}
