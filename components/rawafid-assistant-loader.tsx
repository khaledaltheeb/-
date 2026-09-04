'use client';

import type { ComponentType } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './rawafid-assistant.module.css';

type AssistantProps = {
  initialOpen?: boolean;
  autoOpen?: boolean;
};

type AssistantComponent = ComponentType<AssistantProps>;

const STORAGE_KEY = 'rawafid-assistant-auto-open-v1';
const AUTO_OPEN_AFTER_MS = 12000;
const AUTO_OPEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

let assistantModulePromise: Promise<{ default: AssistantComponent }> | null = null;

function preloadAssistant() {
  if (!assistantModulePromise) {
    assistantModulePromise = import('./rawafid-assistant');
  }
  return assistantModulePromise;
}

function markAssistantSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {}
}

export default function RawafidAssistantLoader() {
  const [Assistant, setAssistant] = useState<AssistantComponent | null>(null);
  const [loading, setLoading] = useState(false);
  const activatedRef = useRef(false);

  const activate = useCallback(async () => {
    if (activatedRef.current) return;
    activatedRef.current = true;
    markAssistantSeen();
    setLoading(true);

    try {
      const module = await preloadAssistant();
      setAssistant(() => module.default);
    } catch {
      activatedRef.current = false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let last = 0;
    try {
      last = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
    } catch {}
    if (Date.now() - last < AUTO_OPEN_TTL_MS) return;

    const timer = window.setTimeout(() => {
      void activate();
    }, AUTO_OPEN_AFTER_MS);

    return () => window.clearTimeout(timer);
  }, [activate]);

  if (Assistant) {
    return <Assistant initialOpen autoOpen={false} />;
  }

  return (
    <div className={styles.root} dir="rtl">
      <button
        type="button"
        className={styles.launcher}
        aria-label="فتح مساعد روافد"
        aria-expanded={false}
        aria-busy={loading || undefined}
        onClick={() => void activate()}
        onPointerEnter={() => void preloadAssistant().catch(() => {})}
        onFocus={() => void preloadAssistant().catch(() => {})}
      >
        <span className={styles.launcherIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10.5" cy="10.5" r="5.5" />
            <path d="m15 15 4.5 4.5" />
            <path d="M18 3v4M16 5h4" />
          </svg>
        </span>
        <span className={styles.launcherLabel}>اسأل</span>
      </button>
    </div>
  );
}
