'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import styles from './rawafid-assistant.module.css';

const STORAGE_KEY = 'rawafid-assistant-auto-open-v1';
const AUTO_OPEN_AFTER_MS = 12000;
const AUTO_OPEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function AssistantLauncher({ disabled = false, onClick }: { disabled?: boolean; onClick?: () => void }) {
  return (
    <div className={styles.root} dir="rtl">
      <button
        type="button"
        className={styles.launcher}
        aria-label={disabled ? 'جارٍ فتح مساعد روافد' : 'فتح مساعد روافد'}
        aria-expanded={false}
        aria-busy={disabled || undefined}
        disabled={disabled}
        onClick={onClick}
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

const LazyRawafidAssistant = dynamic(() => import('./rawafid-assistant'), {
  ssr: false,
  loading: () => <AssistantLauncher disabled />,
});

export default function RawafidAssistantLoader() {
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    let lastAutoOpen = 0;
    try { lastAutoOpen = Number(window.localStorage.getItem(STORAGE_KEY) || 0); } catch {}
    if (Date.now() - lastAutoOpen < AUTO_OPEN_TTL_MS) return;

    const timer = window.setTimeout(() => {
      try { window.localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
      setActivated(true);
    }, AUTO_OPEN_AFTER_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return activated
    ? <LazyRawafidAssistant initialOpen />
    : <AssistantLauncher onClick={() => setActivated(true)} />;
}
