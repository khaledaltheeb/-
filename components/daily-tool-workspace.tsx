'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DailyToolField, DailyToolSpec } from '@/lib/daily-tools-preserved';

type Props = { slug: string; title: string; spec: DailyToolSpec };
type SavedState = { checked: boolean[]; values: Record<string, string>; savedAt?: string };
type Mode = 'guided' | 'all';

function storageKey(slug: string) { return `rawafid:daily-tool:${slug}:v1`; }
function initialValues(fields: DailyToolField[]) { return Object.fromEntries(fields.map((field) => [field.label, field.kind === 'range' ? '5' : ''])); }

export default function DailyToolWorkspace({ slug, title, spec }: Props) {
  const [checked, setChecked] = useState<boolean[]>(() => spec.steps.map(() => false));
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(spec.fields));
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState<Mode>('guided');
  const [activeStep, setActiveStep] = useState(0);
  const completed = useMemo(() => checked.filter(Boolean).length, [checked]);
  const filled = useMemo(() => spec.fields.filter(field => String(values[field.label] ?? '').trim() !== '' && !(field.kind === 'range' && values[field.label] === '5')).length, [spec.fields, values]);
  const progressPercent = Math.round((completed / Math.max(1, spec.steps.length)) * 100);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      try {
        const raw = window.localStorage.getItem(storageKey(slug));
        if (!raw) return;
        const saved = JSON.parse(raw) as SavedState;
        if (Array.isArray(saved.checked)) setChecked(spec.steps.map((_, index) => Boolean(saved.checked[index])));
        if (saved.values && typeof saved.values === 'object') setValues({ ...initialValues(spec.fields), ...saved.values });
        if (saved.savedAt) setStatus(`تم استعادة آخر نسخة محلية محفوظة.`);
      } catch {
        setStatus('تعذر قراءة النسخة المحلية السابقة. يمكنك بدء سجل جديد.');
      }
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [slug, spec.fields, spec.steps]);

  function snapshot(): SavedState { return { checked, values, savedAt: new Date().toISOString() }; }
  function save() {
    try { window.localStorage.setItem(storageKey(slug), JSON.stringify(snapshot())); setStatus('تم الحفظ على هذا الجهاز فقط.'); }
    catch { setStatus('تعذر الحفظ محليًا في هذا المتصفح.'); }
  }
  function clear() {
    try { window.localStorage.removeItem(storageKey(slug)); } catch { /* Keep in-memory reset available in restricted storage contexts. */ }
    setChecked(spec.steps.map(() => false)); setValues(initialValues(spec.fields)); setActiveStep(0); setStatus('تم مسح السجل المحلي لهذه الأداة.');
  }
  function download() {
    const payload = { tool: slug, title, ...snapshot() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `${slug}-record.json`; anchor.click(); URL.revokeObjectURL(url);
  }
  async function copySummary() {
    const notes = spec.fields.map(field => `${field.label}: ${values[field.label] || '—'}`).join('\n');
    const text = `${title}\nالتقدم: ${completed}/${spec.steps.length}\n\n${notes}`;
    try {
      await navigator.clipboard.writeText(text);
      setStatus('تم نسخ ملخص مختصر إلى الحافظة.');
    } catch {
      setStatus('تعذر النسخ تلقائيًا. استخدم الطباعة أو تصدير JSON بدلًا من ذلك.');
    }
  }
  function toggleStep(index: number, value: boolean) {
    setChecked(current => current.map((entry, i) => i === index ? value : entry));
  }

  return <section className="daily-tool-workspace" aria-labelledby="daily-tool-workspace-title">
    <div className="daily-tool-workspace-head">
      <div>
        <span>مساحة التطبيق</span>
        <h2 id="daily-tool-workspace-title">نفّذ الأداة خطوة بخطوة</h2>
        <p>ابدأ بالوضع الموجّه إذا أردت أقل قدر من التشتيت، أو اعرض جميع الخطوات دفعة واحدة.</p>
      </div>
      <div className="daily-tool-mode-switch" aria-label="طريقة عرض خطوات الأداة">
        <button type="button" className={mode==='guided'?'is-active':''} aria-pressed={mode==='guided'} onClick={()=>setMode('guided')}>وضع موجّه</button>
        <button type="button" className={mode==='all'?'is-active':''} aria-pressed={mode==='all'} onClick={()=>setMode('all')}>كل الخطوات</button>
      </div>
    </div>

    <div className="daily-tool-progress-card">
      <div><strong>{progressPercent.toLocaleString('ar')}٪</strong><span>أُنجز {completed.toLocaleString('ar')} من {spec.steps.length.toLocaleString('ar')} خطوات</span></div>
      <progress max={spec.steps.length} value={completed}>{completed}/{spec.steps.length}</progress>
    </div>

    {mode === 'guided' ? <div className="daily-tool-guided-step">
      <span className="daily-tool-step-number">الخطوة {(activeStep + 1).toLocaleString('ar')} من {spec.steps.length.toLocaleString('ar')}</span>
      <p>{spec.steps[activeStep]}</p>
      <label className="daily-tool-step-check"><input type="checkbox" checked={checked[activeStep] ?? false} onChange={event=>toggleStep(activeStep,event.target.checked)}/><span>أنجزت هذه الخطوة</span></label>
      <div className="daily-tool-step-nav">
        <button type="button" disabled={activeStep===0} onClick={()=>setActiveStep(current=>Math.max(0,current-1))}>السابق</button>
        <button type="button" disabled={activeStep===spec.steps.length-1} onClick={()=>setActiveStep(current=>Math.min(spec.steps.length-1,current+1))}>التالي</button>
      </div>
    </div> : <ol className="daily-tool-step-list">{spec.steps.map((step, index) => <li key={`${index}-${step}`}><label><input type="checkbox" checked={checked[index] ?? false} onChange={event=>toggleStep(index,event.target.checked)} /><span><strong>الخطوة {(index + 1).toLocaleString('ar')}:</strong> {step}</span></label></li>)}</ol>}

    <div className="daily-tool-journal-head">
      <div><span>سجل اختياري</span><h3>دوّن فقط ما يفيدك عند المراجعة</h3></div>
      <small>{filled.toLocaleString('ar')} من {spec.fields.length.toLocaleString('ar')} حقول مخصّصة</small>
    </div>
    <p className="daily-tool-private-hint">تجنب الأسماء الكاملة وأرقام الهوية وأي معلومات لا تحتاجها. المدخلات لا تُرسل إلى خادم روافد.</p>
    <div className="daily-tool-form-grid">{spec.fields.map((field) => <DailyField key={field.label} field={field} value={values[field.label] ?? ''} onChange={(value) => setValues((current) => ({ ...current, [field.label]: value }))} />)}</div>

    <div className="daily-tool-actions">
      <button type="button" className="daily-tool-primary-action" onClick={save}>حفظ محلي</button>
      <button type="button" onClick={copySummary}>نسخ ملخص</button>
      <button type="button" onClick={download}>تصدير JSON</button>
      <button type="button" onClick={() => window.print()}>طباعة</button>
      <button type="button" className="daily-tool-danger-action" onClick={clear}>مسح</button>
    </div>
    <p className="daily-tool-status" aria-live="polite">{status}</p>
  </section>;
}

function DailyField({ field, value, onChange }: { field: DailyToolField; value: string; onChange: (value: string) => void }) {
  const id = `daily-${field.label.replace(/\s+/g, '-').slice(0, 50)}`;
  if (field.kind === 'textarea') return <label className="daily-tool-field" htmlFor={id}><span>{field.label}</span><textarea id={id} maxLength={1200} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
  if (field.kind === 'range') return <label className="daily-tool-field daily-tool-range-field" htmlFor={id}><span>{field.label}</span><output>{value || '5'} / 10</output><input id={id} type="range" min="0" max="10" value={value || '5'} onChange={(event) => onChange(event.target.value)} /></label>;
  return <label className="daily-tool-field" htmlFor={id}><span>{field.label}</span><input id={id} type={field.kind} maxLength={field.kind === 'text' ? 300 : undefined} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
