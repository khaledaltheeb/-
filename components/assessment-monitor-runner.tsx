'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { AssessmentMonitor } from '@/lib/assessment-lab/catalog';
import styles from '@/app/assessment-lab/assessment-lab.module.css';

type Props = { monitor: AssessmentMonitor };
type Answer = number | 'na';
type Phase = 'intro' | 'questions' | 'result';

const responseOptions = [
  { value: 0, label: 'لم يحدث' },
  { value: 1, label: 'نادرًا' },
  { value: 2, label: 'أحيانًا' },
  { value: 3, label: 'غالبًا' },
  { value: 4, label: 'دائمًا تقريبًا' },
] as const;

function answerLabel(answer: Answer | undefined) {
  if (answer === 'na') return 'لا ينطبق';
  if (answer === undefined) return 'لم تُجب';
  return responseOptions.find((option) => option.value === answer)?.label ?? 'لم تُجب';
}

export default function AssessmentMonitorRunner({ monitor }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const questions = useMemo(() => monitor.domains.flatMap((domain) => domain.items.map((item, itemIndex) => ({
    ...item,
    id: `${domain.id}-${itemIndex + 1}`,
    domainId: domain.id,
    domainTitle: domain.title,
  }))), [monitor]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const results = useMemo(() => monitor.domains.map((domain) => {
    const responses = domain.items.map((item, itemIndex) => {
      const answer = answers[`${domain.id}-${itemIndex + 1}`];
      return {
        ...item,
        answer,
        label: answerLabel(answer),
      };
    });
    return {
      ...domain,
      responses,
      described: responses.filter((entry) => typeof entry.answer === 'number').length,
      notApplicable: responses.filter((entry) => entry.answer === 'na').length,
    };
  }), [answers, monitor.domains]);

  function chooseAnswer(answer: Answer) {
    setAnswers((current) => ({ ...current, [currentQuestion.id]: answer }));
  }

  function moveNext() {
    if (answers[currentQuestion.id] === undefined) return;
    if (currentIndex === questions.length - 1) {
      setPhase('result');
      return;
    }
    setCurrentIndex((index) => index + 1);
  }

  function resetTool() {
    if (!window.confirm('ستُمسح الإجابات والملاحظات من هذه الصفحة. هل تريد المتابعة؟')) return;
    setAnswers({});
    setNotes({});
    setCurrentIndex(0);
    setPhase('intro');
  }

  return <section className={styles.runner} aria-labelledby="assessment-runner-title">
    {phase === 'intro' && <div className={styles.runnerIntro}>
      <div>
        <span className={styles.eyebrow}>أداة روافد الأصلية · إصدار تطويري {monitor.version}</span>
        <h2 id="assessment-runner-title">قبل أن تبدأ</h2>
        <p>هذه نتيجة <strong>استرشادية ووصفية</strong>، وليست تشخيصًا أو مقياسًا نفسيًا مقننًا. قد تساعدك على إعادة النظر في جوانب ظهرت في إجاباتك أو تجهيز أمثلة لمناقشتها مع مختص.</p>
      </div>
      <dl className={styles.toolFacts}>
        <div><dt>الفترة</dt><dd>{monitor.recallPeriod}</dd></div>
        <div><dt>البنود</dt><dd>{questions.length} بندًا</dd></div>
        <div><dt>المدة</dt><dd>نحو {monitor.estimatedMinutes} دقائق</dd></div>
        <div><dt>لمن؟</dt><dd>{monitor.ageLabel}</dd></div>
      </dl>
      <div className={styles.privacyNotice}><strong>خصوصيتك أولًا</strong><p>تجري الإجابات والمعالجة داخل الصفحة المفتوحة فقط. لا ترسل روافد إجاباتك إلى خادم، ولا تحفظها في حساب أو متصفح، ولا تضعها في رابط الصفحة. عند الإغلاق تختفي.</p></div>
      {monitor.safetyNote && <div className={styles.safetyNotice} role="note"><strong>تنبيه سلامة</strong><p>{monitor.safetyNote}</p></div>}
      <div className={styles.actions}><button type="button" onClick={() => setPhase('questions')}>أفهم الحدود وأبدأ</button></div>
    </div>}

    {phase === 'questions' && <div className={styles.questionStage}>
      <div className={styles.runnerHeading}>
        <div><span className={styles.eyebrow}>{currentQuestion.domainTitle}</span><h2 id="assessment-runner-title">{monitor.title}</h2><p>أجب وفق تجربتك خلال <strong>{monitor.recallPeriod}</strong>.</p></div>
        <div className={styles.progressText} aria-live="polite"><strong>{currentIndex + 1}</strong><span>من {questions.length}</span></div>
      </div>
      <div className={styles.progressTrack} role="progressbar" aria-label="تقدم الأداة" aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={currentIndex + 1}><span style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div>
      <fieldset className={styles.singleQuestion}>
        <legend>{currentQuestion.text}</legend>
        <p className={styles.scaleHint}>كم تكرر ذلك؟ اختر الإجابة الأقرب، أو «لا ينطبق» إذا لم تمر بالموقف.</p>
        <div className={styles.responseGrid}>
          {responseOptions.map((option) => <label key={option.value} className={answers[currentQuestion.id] === option.value ? styles.selectedOption : undefined}>
            <input type="radio" name={currentQuestion.id} value={option.value} checked={answers[currentQuestion.id] === option.value} onChange={() => chooseAnswer(option.value)} />
            <span>{option.label}</span>
          </label>)}
          <label className={answers[currentQuestion.id] === 'na' ? styles.selectedOption : undefined}>
            <input type="radio" name={currentQuestion.id} value="na" checked={answers[currentQuestion.id] === 'na'} onChange={() => chooseAnswer('na')} />
            <span>لا ينطبق</span>
          </label>
        </div>
      </fieldset>
      <div className={styles.navigationActions}>
        <button type="button" className={styles.secondaryButton} onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))} disabled={currentIndex === 0}>السابق</button>
        <span aria-live="polite">أجبت عن {answeredCount} من {questions.length}</span>
        <button type="button" onClick={moveNext} disabled={answers[currentQuestion.id] === undefined}>{currentIndex === questions.length - 1 ? 'عرض ملخصي' : 'التالي'}</button>
      </div>
    </div>}

    {phase === 'result' && <div className={styles.result}>
      <div className={styles.resultHeading}>
        <span className={styles.eyebrow}>ملخص وصفي خاص بهذه الجلسة</span>
        <h2 id="assessment-runner-title">ما الذي ظهر في إجاباتك؟</h2>
        <p>لا توجد درجة كلية ولا حدود تشخيصية. تُعرض كل إجابة كما اخترتها، من دون تحويلها إلى نسبة أو ترتيب أو فئة شدة، ومن دون مقارنتها بأشخاص آخرين.</p>
      </div>
      <div className={styles.resultBoundary} role="note"><strong>النتيجة استرشادية</strong><p>راجع المجالات واحدًا واحدًا. إذا لفتك بند يتكرر في حياتك أو مورد داعم لا يتاح لك بما يكفي، دوّن مثالًا واقعيًا أو سؤالًا لمناقشته. روافد لا ترتب المجالات ولا تقرر أيها «أشد» في هذا الإصدار التطويري.</p></div>
      <div className={styles.resultGrid}>
        {results.map((domain) => <article className={styles.resultCard} key={domain.id}>
          <div className={styles.resultCardHeading}><h3>{domain.title}</h3><span>{domain.described ? `${domain.described} إجابات وصفية` : 'بلا وصف عددي'}</span></div>
          {domain.responses.map((entry, itemIndex) => <p key={`${domain.id}-${itemIndex + 1}`}>
            <strong>{entry.direction === 'concern' ? 'بند مراجعة' : 'مورد داعم'} · {entry.label}</strong><br />
            {entry.text}
          </p>)}
          {domain.notApplicable > 0 && <p>اختيار «لا ينطبق» ظاهر كما هو ولا يدخل في أي حساب أو استنتاج.</p>}
          <p className={styles.domainAction}><strong>خطوة قابلة للنقاش:</strong> {domain.action}</p>
          <label className={styles.noteField}><span>مثال أو ملاحظة اختيارية للطباعة</span><textarea rows={3} maxLength={600} value={notes[domain.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [domain.id]: event.target.value }))} placeholder="متى ظهر؟ ما أثره؟ وما الذي ساعد؟" /></label>
        </article>)}
      </div>
      <section className={styles.professionalNext} aria-labelledby="professional-next-title">
        <div><span className={styles.eyebrow}>بعد النتيجة</span><h3 id="professional-next-title">حوّل الملاحظة إلى خطوة مناسبة</h3><p>إذا تكرر النمط، أو سبب ضيقًا، أو عطّل النوم أو العمل أو الدراسة أو العلاقات، يمكنك عرض الأمثلة على مختص مؤهل. اختر الخدمة بحسب حاجتك وموقعك، وتحقق من مؤهلات مقدم الخدمة.</p></div>
        <div className={styles.nextLinks}><Link href="/specialists">العثور على مختص</Link><Link href="/centers">العثور على مركز</Link><Link href="/guided-assessment">التحضير للموعد</Link><Link href="/medical-review-policy">منهجية المراجعة</Link></div>
      </section>
      <div className={styles.safetyFooter}><strong>لا تنتظر النتيجة عند الخطر.</strong> إذا كان هناك خطر فوري على النفس أو الآخرين، عنف، فقدان شديد للاتصال بالواقع، أو حالة طبية حادة، اطلب خدمات الطوارئ المحلية المناسبة.</div>
      <div className={styles.actions}><button type="button" onClick={() => window.print()}>طباعة الملخص</button><button type="button" className={styles.secondaryButton} onClick={() => { setPhase('questions'); setCurrentIndex(0); }}>مراجعة الإجابات</button><button type="button" className={styles.dangerButton} onClick={resetTool}>مسح والبدء من جديد</button></div>
    </div>}
  </section>;
}
