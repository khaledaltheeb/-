'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './daily-tool-four-step-checklist.module.css';

type FourSteps = readonly [string, string, string, string];

type Props = {
  toolKey: string;
  steps: FourSteps;
  legend?: string;
};

const EMPTY_PROGRESS: [boolean, boolean, boolean, boolean] = [false, false, false, false];
const STORAGE_PREFIX = 'rawafid:daily-tool:';

function storageKey(toolKey: string) {
  return `${STORAGE_PREFIX}${encodeURIComponent(toolKey)}:v1`;
}

function parseProgress(raw: string | null): [boolean, boolean, boolean, boolean] | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || value.length !== 4 || !value.every((item) => typeof item === 'boolean')) {
      return null;
    }
    return [value[0], value[1], value[2], value[3]];
  } catch {
    return null;
  }
}

export default function DailyToolFourStepChecklist({
  toolKey,
  steps,
  legend = 'خطوات الاستخدام',
}: Props) {
  const [checked, setChecked] = useState<[boolean, boolean, boolean, boolean]>(EMPTY_PROGRESS);
  const storageReady = useRef(false);
  const suppressNextPersist = useRef(false);
  const key = useMemo(() => storageKey(toolKey), [toolKey]);
  const completed = checked.filter(Boolean).length;

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      const saved = parseProgress(window.localStorage.getItem(key));
      if (saved) setChecked(saved);
      storageReady.current = true;
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [key]);

  useEffect(() => {
    if (!storageReady.current) return;
    if (suppressNextPersist.current) {
      suppressNextPersist.current = false;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(checked));
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
  }, [checked, key]);

  function toggle(index: number) {
    setChecked((current) => {
      const next: [boolean, boolean, boolean, boolean] = [...current];
      next[index] = !next[index];
      return next;
    });
  }

  function reset() {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Keep reset functional in memory when browser storage is unavailable.
    }
    suppressNextPersist.current = true;
    setChecked([false, false, false, false]);
  }

  return (
    <section className={styles.container} aria-labelledby={`${toolKey}-progress`}>
      <div className={styles.header}>
        <div>
          <h2>{legend}</h2>
          <p id={`${toolKey}-progress`} className={styles.progress} aria-live="polite">
            أُنجز {completed} من 4
          </p>
        </div>
        <button type="button" className={styles.reset} onClick={reset} disabled={completed === 0}>
          إعادة ضبط
        </button>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.srOnly}>{legend}</legend>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={`${toolKey}-${index}`} className={checked[index] ? styles.completed : undefined}>
              <label>
                <input
                  type="checkbox"
                  checked={checked[index]}
                  onChange={() => toggle(index)}
                />
                <span>
                  <strong>الخطوة {index + 1}</strong>
                  <span>{step}</span>
                </span>
              </label>
            </li>
          ))}
        </ol>
      </fieldset>

      <p className={styles.privacy}>
        <strong>الخصوصية:</strong> حالة الخطوات تُحفظ محليًا في هذا المتصفح فقط، ولا تُرسل إلى روافد أو ترتبط بحسابك.
      </p>
    </section>
  );
}