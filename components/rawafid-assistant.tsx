'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import styles from './rawafid-assistant.module.css';

type Result = {
  entity_type: string;
  entity_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  destination: string;
  score: number;
};

type ApiResponse = {
  query: string;
  mode: string;
  count?: number;
  results: Result[];
};

const DEFAULT_QUICK = ['علامات التوحد', 'طفلي لا يتكلم', 'القلق الاجتماعي', 'صعوبات القراءة'];
const CONTEXT_QUICK: Array<{ match: RegExp; values: string[] }> = [
  { match: /social-work/, values: ['أخلاقيات العمل الاجتماعي', 'تقرير المصير', 'السرية المهنية', 'اتخاذ القرار الأخلاقي'] },
  { match: /addiction/, values: ['علاج الإدمان', 'سلامة الانسحاب', 'دعم الأسرة', 'منع الانتكاس'] },
  { match: /pediatric-oncology/, values: ['دعم الطفل نفسيًا', 'آثار العلاج', 'التغذية أثناء العلاج', 'المتابعة بعد العلاج'] },
  { match: /autism/, values: ['علامات التوحد', 'تقييم التوحد', 'AAC للتوحد', 'التوحد في المدرسة'] },
  { match: /assessment-lab/, values: ['اختبارات نفسية', 'مقاييس التوحد', 'اختبارات الذكاء', 'كيف أفهم نتيجة المقياس؟'] },
  { match: /rare-disease/, values: ['مرض نادر علاج جيني', 'الفحوص الجينية', 'التاريخ الطبيعي للأمراض النادرة', 'كيف أجد خبيرًا؟'] },
];

const RISK_PATTERN = /(انتحار|اقتل نفسي|قتل نفسي|أقتل نفسي|اذي نفسي|أؤذي نفسي|ايذاء النفس|إيذاء النفس|خطر مباشر|لا استطيع التنفس|لا أستطيع التنفس|فقد الوعي|نزيف شديد|جرعة زائدة)/i;
const STORAGE_KEY = 'rawafid-assistant-auto-open-v1';
const AUTO_OPEN_AFTER_MS = 12000;
const AUTO_OPEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function safeExcerpt(value: string | null) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > 170 ? `${text.slice(0, 167)}…` : text;
}

export default function RawafidAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState('');
  const [safety, setSafety] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const quick = useMemo(() => {
    return CONTEXT_QUICK.find((item) => item.match.test(pathname ?? ''))?.values ?? DEFAULT_QUICK;
  }, [pathname]);

  useEffect(() => {
    let last = 0;
    try { last = Number(window.localStorage.getItem(STORAGE_KEY) || 0); } catch {}
    if (Date.now() - last < AUTO_OPEN_TTL_MS) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      try { window.localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    }, AUTO_OPEN_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function search(nextQuery: string) {
    const q = nextQuery.trim().replace(/\s+/g, ' ').slice(0, 160);
    setQuery(q);
    setResults([]);
    setStatus('');
    const isRisk = RISK_PATTERN.test(q);
    setSafety(isRisk);
    if (isRisk) {
      setStatus('');
      return;
    }
    if (q.length < 2) {
      setStatus('اكتب كلمتين على الأقل حتى أبحث داخل روافد.');
      return;
    }

    setLoading(true);
    setStatus('أبحث داخل محتوى روافد…');
    try {
      const response = await fetch(`/api/search/v3?q=${encodeURIComponent(q)}&limit=6`, {
        method: 'GET',
        cache: 'no-store',
        headers: { accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as ApiResponse;
      const rows = Array.isArray(data.results) ? data.results : [];
      setResults(rows);
      setStatus(rows.length ? `وجدت ${rows.length} نتائج أقرب لسؤالك.` : 'لم أجد نتيجة مطابقة بثقة. جرّب صياغة أقصر أو كلمة أكثر تحديدًا.');
    } catch {
      setStatus('تعذر تنفيذ البحث الآن. يمكنك استخدام صفحة البحث الكاملة.');
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void search(query);
  }

  return (
    <div className={styles.root} dir="rtl">
      {open ? (
        <section className={styles.panel} role="dialog" aria-modal="false" aria-labelledby="rawafid-assistant-title">
          <header className={styles.header}>
            <div className={styles.identity}>
              <span className={styles.mark} aria-hidden="true">ر</span>
              <div>
                <h2 className={styles.title} id="rawafid-assistant-title">مساعد روافد</h2>
                <p className={styles.subtitle}>أساعدك في الوصول إلى الأدلة والصفحات المناسبة داخل المنصة.</p>
              </div>
            </div>
            <button className={styles.close} type="button" onClick={() => setOpen(false)} aria-label="إغلاق مساعد روافد">×</button>
          </header>

          <div className={styles.body}>
            <p className={styles.intro}>ما الذي تبحث عنه؟ اكتب موضوعًا أو سؤالًا بلغة طبيعية، وسأعرض أقرب الموارد المنشورة في روافد.</p>
            <div className={styles.quickGrid} aria-label="اقتراحات سريعة">
              {quick.map((item) => (
                <button key={item} type="button" className={styles.quick} onClick={() => void search(item)}>{item}</button>
              ))}
            </div>

            <form className={styles.form} onSubmit={submit} role="search">
              <textarea
                ref={inputRef}
                className={styles.input}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                maxLength={160}
                rows={1}
                aria-label="سؤالك لمساعد روافد"
                placeholder="مثال: كيف أساعد طفلي على القراءة؟"
              />
              <button className={styles.submit} type="submit" disabled={loading}>{loading ? 'بحث…' : 'ابحث'}</button>
            </form>

            {safety ? (
              <div className={styles.safety} role="alert">
                إذا كان هناك خطر مباشر على الحياة أو فقدان وعي أو نزيف شديد أو صعوبة تنفس أو احتمال إيذاء النفس، لا تعتمد على البحث داخل الموقع. اطلب خدمات الطوارئ المحلية أو توجّه لأقرب قسم طوارئ، وابقَ مع الشخص إن كان ذلك آمنًا.
              </div>
            ) : null}

            <div className={styles.status} role="status" aria-live="polite">{status}</div>

            {results.length ? (
              <div className={styles.results} aria-label="نتائج مساعد روافد">
                {results.map((item) => (
                  <Link key={`${item.entity_id}:${item.destination}`} href={item.destination} className={styles.result} onClick={() => setOpen(false)}>
                    <span className={styles.resultTitle}>{item.title}</span>
                    {item.subtitle ? <span className={styles.resultMeta}>{item.subtitle}</span> : null}
                    {item.excerpt ? <span className={styles.resultExcerpt}>{safeExcerpt(item.excerpt)}</span> : null}
                  </Link>
                ))}
              </div>
            ) : null}

            {!safety ? (
              <div className={styles.notice}>المساعد حاليًا أداة لاكتشاف محتوى روافد، وليس خدمة تشخيص أو بديلًا عن التقييم المهني.</div>
            ) : null}
          </div>

          <footer className={styles.footer}>لا يرسل المساعد إجابة مولّدة في هذه المرحلة؛ يعرض روابط منشورة فقط حتى اكتمال طبقة RAG والتحقق منها.</footer>
        </section>
      ) : null}

      <button
        type="button"
        className={styles.launcher}
        aria-label={open ? 'إغلاق مساعد روافد' : 'فتح مساعد روافد'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">؟</span>
      </button>
    </div>
  );
}
