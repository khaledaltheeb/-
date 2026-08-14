'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CognitiveTool } from '@/lib/cognitive-lab/catalog';
import {
  isCognitiveAnswerCorrect,
  makeCognitiveTrial,
  median,
  type CognitiveTrial,
} from '@/lib/cognitive-lab/engine.mjs';

const TRIALS_PER_SESSION = 10;

type TrialResult = {
  correct: boolean;
  responseMs: number;
};

type SavedSession = {
  completedAt: string;
  level: number;
  correct: number;
  total: number;
  medianMs: number;
};

function historyKey(slug: string) {
  return `rawafid:cognitive-lab:v1:${slug}`;
}

function readHistory(slug: string): SavedSession[] {
  try {
    const value = window.localStorage.getItem(historyKey(slug));
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch {
    return [];
  }
}

function saveHistory(slug: string, history: SavedSession[]) {
  try {
    window.localStorage.setItem(historyKey(slug), JSON.stringify(history.slice(0, 20)));
  } catch {
    // The activity still works when private browsing blocks persistent storage.
  }
}

function formatDuration(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '—';
  return value < 1000 ? `${Math.round(value)} مللي ثانية` : `${(value / 1000).toFixed(2)} ثانية`;
}

function currentTimeMs() {
  return globalThis.performance?.now() ?? Date.now();
}

function playBeeps(count: number) {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return false;
  try {
    const context = new AudioContextClass();
    for (let index = 0; index < count; index += 1) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 520;
      oscillator.connect(gain);
      gain.connect(context.destination);
      const start = context.currentTime + index * 0.24;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.16, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);
      oscillator.start(start);
      oscillator.stop(start + 0.17);
    }
    window.setTimeout(() => void context.close(), count * 260 + 400);
    return true;
  } catch {
    return false;
  }
}

export default function CognitiveLabRunner({ tool }: { tool: CognitiveTool }) {
  const [level, setLevel] = useState(1);
  const [sessionSeed, setSessionSeed] = useState(1);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [trialIndex, setTrialIndex] = useState(0);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [studyVisible, setStudyVisible] = useState(false);
  const [reactionReady, setReactionReady] = useState(false);
  const [audioAlternative, setAudioAlternative] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');
  const [history, setHistory] = useState<SavedSession[]>([]);
  const questionStartedAt = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setHistory(readHistory(tool.slug)), 0);
    return () => window.clearTimeout(timer);
  }, [tool.slug]);

  const trial = useMemo<CognitiveTrial | null>(() => {
    if (!started || completed) return null;
    return makeCognitiveTrial(tool, level, trialIndex, sessionSeed);
  }, [completed, level, sessionSeed, started, tool, trialIndex]);

  useEffect(() => {
    if (!trial || trial.kind !== 'reaction') return;
    const timer = window.setTimeout(() => {
      setReactionReady(true);
      questionStartedAt.current = currentTimeMs();
    }, trial.reactionDelay ?? 700);
    return () => window.clearTimeout(timer);
  }, [trial]);

  const correctCount = results.filter((result) => result.correct).length;
  const medianMs = median(results.map((result) => result.responseMs).filter((value) => value > 0));

  function prepareTrial(nextTrial: CognitiveTrial) {
    setSelected(null);
    setAudioAlternative(false);
    setAudioMessage('');
    setStudyVisible(Boolean(nextTrial.study));
    setReactionReady(nextTrial.kind !== 'reaction');
    questionStartedAt.current = !nextTrial.study && nextTrial.kind !== 'reaction' ? currentTimeMs() : 0;
  }

  function startSession() {
    const nextSeed = Date.now() % 2_147_483_647;
    prepareTrial(makeCognitiveTrial(tool, level, 0, nextSeed));
    setSessionSeed(nextSeed);
    setTrialIndex(0);
    setResults([]);
    setSelected(null);
    setCompleted(false);
    setStarted(true);
  }

  function revealQuestion() {
    setStudyVisible(false);
    questionStartedAt.current = currentTimeMs();
  }

  function answer(value: string) {
    if (!trial || selected !== null || studyVisible || !reactionReady) return;
    const responseMs = questionStartedAt.current ? currentTimeMs() - questionStartedAt.current : 0;
    setSelected(value);
    setResults((current) => [...current, { correct: isCognitiveAnswerCorrect(trial, value), responseMs }]);
  }

  function next() {
    if (selected === null) return;
    if (trialIndex + 1 < TRIALS_PER_SESSION) {
      const nextIndex = trialIndex + 1;
      prepareTrial(makeCognitiveTrial(tool, level, nextIndex, sessionSeed));
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

  function clearSavedHistory() {
    setHistory([]);
    try { window.localStorage.removeItem(historyKey(tool.slug)); } catch { /* no-op */ }
  }

  function replayAudio() {
    if (!trial?.audioCount) return;
    const played = playBeeps(trial.audioCount);
    setAudioMessage(played ? 'تم تشغيل النغمات.' : 'تعذر تشغيل الصوت؛ استخدم البديل النصي المتاح.');
  }

  if (!started) {
    return (
      <section className="cognitive-runner" aria-labelledby="cognitive-runner-title">
        <div className="cognitive-runner__intro">
          <span>جلسة محلية خاصة</span>
          <h2 id="cognitive-runner-title">ابدأ نشاطًا من عشر محاولات</h2>
          <p>اختر مستوى واحدًا. لا تُرسل الإجابات أو النتيجة إلى الخادم، ولا تُستخدم النتيجة للتشخيص أو المقارنة بالآخرين.</p>
        </div>
        <fieldset className="cognitive-levels">
          <legend>اختر مستوى الصعوبة</legend>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className={level === value ? 'is-selected' : ''}>
              <input type="radio" name="cognitive-level" value={value} checked={level === value} onChange={() => setLevel(value)} />
              <strong>{value}</strong>
              <span>{['تمهيدي', 'أساسي', 'متوسط', 'متقدم', 'مكثف'][value - 1]}</span>
            </label>
          ))}
        </fieldset>
        {tool.difficultyStatus === 'review' ? (
          <p className="cognitive-review-note"><strong>حالة هذا النشاط:</strong> بنية الإجابات مختبرة آليًا، بينما الفروق الدلالية بين المستويات ما زالت قيد مراجعة بشرية؛ تعامل مع المستوى كتفضيل تدريب لا كدرجة قدرة.</p>
        ) : (
          <p className="cognitive-verified-note"><strong>حالة هذا النشاط:</strong> اجتازت المستويات الخمسة عقد التدرج والبنوك والإجابات في هذا الإصدار.</p>
        )}
        <button className="cognitive-primary-button" type="button" onClick={startSession}>بدء الجلسة</button>

        {history.length ? (
          <aside className="cognitive-history" aria-labelledby="cognitive-history-title">
            <div><h3 id="cognitive-history-title">سجلك المحلي</h3><button type="button" onClick={clearSavedHistory}>مسح السجل من هذا الجهاز</button></div>
            <ul>
              {history.slice(0, 3).map((entry) => (
                <li key={`${entry.completedAt}-${entry.level}`}>
                  <strong>{entry.correct} من {entry.total}</strong>
                  <span>المستوى {entry.level} · زمن وسيط {formatDuration(entry.medianMs)}</span>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </section>
    );
  }

  if (completed) {
    return (
      <section className="cognitive-runner cognitive-results" aria-labelledby="cognitive-results-title">
        <span className="cognitive-results__eyebrow">اكتملت الجلسة</span>
        <h2 id="cognitive-results-title">ملخص وصفي، لا درجة معيارية</h2>
        <div className="cognitive-result-grid">
          <article><span>الإجابات الصحيحة</span><strong>{correctCount} / {results.length}</strong></article>
          <article><span>الدقة في هذه الجلسة</span><strong>{results.length ? Math.round((correctCount / results.length) * 100) : 0}%</strong></article>
          <article><span>الزمن الوسيط بعد ظهور السؤال</span><strong>{formatDuration(medianMs)}</strong></article>
        </div>
        <p>قارن النتائج بجلساتك السابقة في الظروف نفسها إن رغبت. اختلاف الجهاز، النوم، الانشغال، طريقة الإدخال أو فهم التعليمات قد يغير الزمن والدقة.</p>
        <div className="cognitive-runner__actions">
          <button className="cognitive-primary-button" type="button" onClick={startSession}>جلسة جديدة بالمستوى نفسه</button>
          <button type="button" onClick={() => { setStarted(false); setCompleted(false); }}>تغيير المستوى</button>
        </div>
      </section>
    );
  }

  if (!trial) return null;
  const answeredCorrectly = selected === null ? null : isCognitiveAnswerCorrect(trial, selected);

  return (
    <section className="cognitive-runner cognitive-session" aria-labelledby="cognitive-question-title">
      <div className="cognitive-progress-row">
        <div>
          <span>المستوى {level}</span>
          <strong>المحاولة {trialIndex + 1} من {TRIALS_PER_SESSION}</strong>
        </div>
        <progress max={TRIALS_PER_SESSION} value={trialIndex + Number(selected !== null)}>التقدم</progress>
      </div>
      <div className="cognitive-difficulty-label">{trial.difficultyDescriptor}</div>

      {studyVisible && trial.study ? (
        <div className="cognitive-study-panel">
          <span>مرحلة الدراسة</span>
          <p>{trial.study}</p>
          <button className="cognitive-primary-button" type="button" onClick={revealQuestion}>إخفاء المحتوى وفتح السؤال</button>
        </div>
      ) : (
        <div className="cognitive-question-panel">
          <h2 id="cognitive-question-title">{trial.prompt}</h2>
          {trial.display ? <div className="cognitive-stimulus" style={trial.displayTone ? { color: trial.displayTone } : undefined}>{trial.display}</div> : null}

          {trial.kind === 'audio' ? (
            <div className="cognitive-audio-tools">
              <button type="button" onClick={replayAudio}>تشغيل النغمات</button>
              <button type="button" onClick={() => setAudioAlternative((value) => !value)}>{audioAlternative ? 'إخفاء البديل النصي' : 'عرض بديل نصي للإتاحة'}</button>
              {audioAlternative ? <p>عدد النغمات في هذه المحاولة: {trial.audioCount}</p> : null}
              <span aria-live="polite">{audioMessage}</span>
            </div>
          ) : null}

          {trial.kind === 'reaction' && !reactionReady ? <div className="cognitive-waiting" role="status">انتظر الإشارة…</div> : null}

          <div className={`cognitive-options ${trial.kind === 'reaction' ? 'cognitive-options--reaction' : ''}`} role="group" aria-label="خيارات الإجابة">
            {trial.options.map((item) => {
              const isSelected = selected === item.value;
              const isCorrect = selected !== null && item.value === trial.answer;
              return (
                <button
                  key={item.value}
                  type="button"
                  disabled={selected !== null || (trial.kind === 'reaction' && !reactionReady)}
                  className={`${isSelected ? 'is-selected' : ''} ${isCorrect ? 'is-correct' : ''}`.trim()}
                  onClick={() => answer(item.value)}
                >
                  {item.tone ? <i aria-hidden="true" style={{ background: item.tone }} /> : null}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="cognitive-feedback" aria-live="polite" aria-atomic="true">
            {selected !== null ? (
              <>
                <strong>{answeredCorrectly ? 'إجابة صحيحة' : 'ليست الإجابة المطلوبة في هذه المحاولة'}</strong>
                <p>{trial.rationale}</p>
                <button className="cognitive-primary-button" type="button" onClick={next}>
                  {trialIndex + 1 === TRIALS_PER_SESSION ? 'عرض ملخص الجلسة' : 'المحاولة التالية'}
                </button>
              </>
            ) : <span>اختر إجابة لعرض التفسير. لن ينتقل النشاط تلقائيًا.</span>}
          </div>
        </div>
      )}
    </section>
  );
}
