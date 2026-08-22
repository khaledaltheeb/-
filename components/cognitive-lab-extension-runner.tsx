'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CognitiveTool } from '@/lib/cognitive-lab/catalog';
import { isCognitiveAnswerCorrect, makeCognitiveTrial, median, type CognitiveTrial } from '@/lib/cognitive-lab/engine-v2.mjs';

const TRIALS_PER_SESSION = 10;

type TrialResult = { correct: boolean; responseMs: number };
type SavedSession = { completedAt: string; level: number; correct: number; total: number; medianMs: number };

function historyKey(slug: string) { return `rawafid:cognitive-lab:v2:${slug}`; }
function readHistory(slug: string): SavedSession[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(historyKey(slug)) ?? '[]');
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch { return []; }
}
function saveHistory(slug: string, history: SavedSession[]) {
  try { window.localStorage.setItem(historyKey(slug), JSON.stringify(history.slice(0, 20))); } catch { /* local persistence is optional */ }
}
function formatDuration(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '—';
  return value < 1000 ? `${Math.round(value)} مللي ثانية` : `${(value / 1000).toFixed(2)} ثانية`;
}
function currentTimeMs() { return globalThis.performance?.now() ?? Date.now(); }

export default function CognitiveLabExtensionRunner({ tool }: { tool: CognitiveTool }) {
  const [level, setLevel] = useState(1);
  const [seed, setSeed] = useState(1);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [trialIndex, setTrialIndex] = useState(0);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [studyVisible, setStudyVisible] = useState(false);
  const [history, setHistory] = useState<SavedSession[]>([]);
  const questionStartedAt = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setHistory(readHistory(tool.slug)), 0);
    return () => window.clearTimeout(timer);
  }, [tool.slug]);

  const trial = useMemo<CognitiveTrial | null>(() => {
    if (!started || completed) return null;
    return makeCognitiveTrial(tool, level, trialIndex, seed);
  }, [completed, level, seed, started, tool, trialIndex]);

  const correctCount = results.filter((result) => result.correct).length;
  const medianMs = median(results.map((result) => result.responseMs).filter((value) => value > 0));

  function prepareTrial(nextTrial: CognitiveTrial) {
    setSelected(null);
    setStudyVisible(Boolean(nextTrial.study));
    questionStartedAt.current = nextTrial.study ? 0 : currentTimeMs();
  }

  function startSession() {
    const nextSeed = Date.now() % 2_147_483_647;
    prepareTrial(makeCognitiveTrial(tool, level, 0, nextSeed));
    setSeed(nextSeed);
    setTrialIndex(0);
    setResults([]);
    setCompleted(false);
    setStarted(true);
  }

  function revealQuestion() {
    setStudyVisible(false);
    questionStartedAt.current = currentTimeMs();
  }

  function answer(value: string) {
    if (!trial || selected !== null || studyVisible) return;
    const responseMs = questionStartedAt.current ? currentTimeMs() - questionStartedAt.current : 0;
    const result = { correct: isCognitiveAnswerCorrect(trial, value), responseMs };
    setSelected(value);
    setResults((current) => [...current, result]);
  }

  function next() {
    if (selected === null) return;
    if (trialIndex + 1 < TRIALS_PER_SESSION) {
      const nextIndex = trialIndex + 1;
      prepareTrial(makeCognitiveTrial(tool, level, nextIndex, seed));
      setTrialIndex(nextIndex);
      return;
    }
    const finalResults = results;
    const record: SavedSession = {
      completedAt: new Date().toISOString(),
      level,
      correct: finalResults.filter((result) => result.correct).length,
      total: finalResults.length,
      medianMs: median(finalResults.map((result) => result.responseMs).filter((value) => value > 0)),
    };
    const nextHistory = [record, ...history].slice(0, 20);
    setHistory(nextHistory);
    saveHistory(tool.slug, nextHistory);
    setCompleted(true);
  }

  if (!started) {
    return (
      <section className="cognitive-runner" aria-labelledby="cognitive-extension-title">
        <div className="cognitive-runner__intro">
          <span>جلسة محلية خاصة · توسعة بحثية</span>
          <h2 id="cognitive-extension-title">ابدأ نشاطًا من عشر محاولات</h2>
          <p>هذه الأنشطة توسعة تعليمية مبنية على نماذج معرفية معروفة، لكنها ليست اختبارات معيارية أو تشخيصية. اختر مستوى الصعوبة كتفضيل تدريب.</p>
        </div>
        <fieldset className="cognitive-levels">
          <legend>اختر مستوى الصعوبة</legend>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className={level === value ? 'is-selected' : ''}>
              <input type="radio" name="cognitive-extension-level" value={value} checked={level === value} onChange={() => setLevel(value)} />
              <strong>{value}</strong>
              <span>{['تمهيدي', 'أساسي', 'متوسط', 'متقدم', 'مكثف'][value - 1]}</span>
            </label>
          ))}
        </fieldset>
        <p className="cognitive-review-note"><strong>حالة هذا النشاط:</strong> صحة الإجابة والبنية البرمجية قابلة للاختبار آليًا، بينما التدرج الدلالي والخصائص السيكومترية لا تُقدَّم كمعايير مثبتة.</p>
        <button className="cognitive-primary-button" type="button" onClick={startSession}>بدء الجلسة</button>
        {history.length ? (
          <aside className="cognitive-history" aria-labelledby="cognitive-extension-history">
            <div><h3 id="cognitive-extension-history">سجلك المحلي</h3><button type="button" onClick={() => { setHistory([]); try { window.localStorage.removeItem(historyKey(tool.slug)); } catch { /* no-op */ } }}>مسح السجل</button></div>
            <ul>{history.slice(0, 3).map((entry) => <li key={`${entry.completedAt}-${entry.level}`}><strong>{entry.correct} من {entry.total}</strong><span>المستوى {entry.level} · زمن وسيط {formatDuration(entry.medianMs)}</span></li>)}</ul>
          </aside>
        ) : null}
      </section>
    );
  }

  if (completed) {
    return (
      <section className="cognitive-runner cognitive-results" aria-labelledby="cognitive-extension-results">
        <span className="cognitive-results__eyebrow">اكتملت الجلسة</span>
        <h2 id="cognitive-extension-results">ملخص وصفي، لا درجة معيارية</h2>
        <div className="cognitive-result-grid">
          <article><span>الإجابات الصحيحة</span><strong>{correctCount} / {results.length}</strong></article>
          <article><span>الدقة في الجلسة</span><strong>{results.length ? Math.round((correctCount / results.length) * 100) : 0}%</strong></article>
          <article><span>الزمن الوسيط</span><strong>{formatDuration(medianMs)}</strong></article>
        </div>
        <p>استخدم النتيجة للمقارنة الذاتية في ظروف متقاربة فقط؛ لا تفسرها كدرجة قدرة عامة أو تشخيص.</p>
        <div className="cognitive-runner__actions"><button className="cognitive-primary-button" type="button" onClick={startSession}>جلسة جديدة</button><button type="button" onClick={() => { setStarted(false); setCompleted(false); }}>تغيير المستوى</button></div>
      </section>
    );
  }

  if (!trial) return null;
  const answeredCorrectly = selected === null ? null : isCognitiveAnswerCorrect(trial, selected);

  return (
    <section className="cognitive-runner cognitive-session" aria-labelledby="cognitive-extension-question">
      <div className="cognitive-progress-row"><div><span>المستوى {level}</span><strong>المحاولة {trialIndex + 1} من {TRIALS_PER_SESSION}</strong></div><progress max={TRIALS_PER_SESSION} value={trialIndex + Number(selected !== null)}>التقدم</progress></div>
      <div className="cognitive-difficulty-label">{trial.difficultyDescriptor}</div>
      {studyVisible && trial.study ? (
        <div className="cognitive-study-panel"><span>مرحلة الدراسة</span><p>{trial.study}</p><button className="cognitive-primary-button" type="button" onClick={revealQuestion}>إخفاء المحتوى وفتح السؤال</button></div>
      ) : (
        <div className="cognitive-question-panel">
          <h2 id="cognitive-extension-question">{trial.prompt}</h2>
          {trial.display ? <div className="cognitive-stimulus">{trial.display}</div> : null}
          <div className="cognitive-options" role="group" aria-label="خيارات الإجابة">
            {trial.options.map((item) => {
              const isSelected = selected === item.value;
              const isCorrect = selected !== null && item.value === trial.answer;
              return <button key={item.value} type="button" disabled={selected !== null} className={`${isSelected ? 'is-selected' : ''} ${isCorrect ? 'is-correct' : ''}`.trim()} onClick={() => answer(item.value)}><span>{item.label}</span></button>;
            })}
          </div>
          <div className="cognitive-feedback" aria-live="polite" aria-atomic="true">
            {selected !== null ? <><strong>{answeredCorrectly ? 'إجابة صحيحة' : 'ليست الإجابة المطلوبة في هذه المحاولة'}</strong><p>{trial.rationale}</p><button className="cognitive-primary-button" type="button" onClick={next}>{trialIndex + 1 === TRIALS_PER_SESSION ? 'عرض ملخص الجلسة' : 'المحاولة التالية'}</button></> : <span>اختر إجابة لعرض التفسير. لن ينتقل النشاط تلقائيًا.</span>}
          </div>
        </div>
      )}
    </section>
  );
}
