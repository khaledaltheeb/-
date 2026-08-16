'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DailyToolField, DailyToolSpec } from '@/lib/daily-tools-preserved';

type Props = { slug: string; title: string; spec: DailyToolSpec };
type SavedState = { checked: boolean[]; values: Record<string, string>; savedAt?: string };

function storageKey(slug: string) { return `rawafid:daily-tool:${slug}:v1`; }
function initialValues(fields: DailyToolField[]) { return Object.fromEntries(fields.map((field) => [field.label, field.kind === 'range' ? '5' : ''])); }

export default function DailyToolWorkspace({ slug, title, spec }: Props) {
  const [checked, setChecked] = useState<boolean[]>(() => spec.steps.map(() => false));
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(spec.fields));
  const [status, setStatus] = useState('');
  const completed = useMemo(() => checked.filter(Boolean).length, [checked]);

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
    setChecked(spec.steps.map(() => false)); setValues(initialValues(spec.fields)); setStatus('تم مسح السجل المحلي لهذه الأداة.');
  }
  function download() {
    const payload = { tool: slug, title, ...snapshot() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `${slug}-record.json`; anchor.click(); URL.revokeObjectURL(url);
  }

  return <section className="section daily-tool-workspace" aria-labelledby="daily-tool-workspace-title">
    <div className="section-heading"><span>مساحة التطبيق</span><h2 id="daily-tool-workspace-title">نفّذ الخطوات وسجّل أقل قدر تحتاجه</h2><p>كل التفاعل أدناه يعمل داخل المتصفح. لا تُرسل المدخلات إلى الخادم، والحفظ اختياري على الجهاز الحالي.</p></div>
    <div className="daily-tool-progress"><strong>أُنجز {completed.toLocaleString('ar')} من {spec.steps.length.toLocaleString('ar')}</strong><progress max={spec.steps.length} value={completed}>{completed}/{spec.steps.length}</progress></div>
    <ol className="step-list">{spec.steps.map((step, index) => <li key={`${index}-${step}`}><label><input type="checkbox" checked={checked[index] ?? false} onChange={(event) => setChecked((current) => current.map((value, i) => i === index ? event.target.checked : value))} /><span><strong>الخطوة {(index + 1).toLocaleString('ar')}:</strong> {step}</span></label></li>)}</ol>
    <div className="section-heading"><h3>سجل شخصي على هذا الجهاز</h3><p>تجنب الأسماء الكاملة وأرقام الهوية والمعلومات الحساسة. استخدم أوصافًا مختصرة تكفي للمراجعة العملية.</p></div>
    <div className="form-grid">{spec.fields.map((field) => <DailyField key={field.label} field={field} value={values[field.label] ?? ''} onChange={(value) => setValues((current) => ({ ...current, [field.label]: value }))} />)}</div>
    <div className="actions"><button type="button" className="button" onClick={save}>حفظ محلي</button><button type="button" className="button" onClick={download}>تصدير JSON</button><button type="button" className="button" onClick={() => window.print()}>طباعة</button><button type="button" className="button" onClick={clear}>مسح</button></div>
    <p aria-live="polite">{status}</p>
  </section>;
}

function DailyField({ field, value, onChange }: { field: DailyToolField; value: string; onChange: (value: string) => void }) {
  const id = `daily-${field.label.replace(/\s+/g, '-').slice(0, 50)}`;
  if (field.kind === 'textarea') return <label className="field" htmlFor={id}>{field.label}<textarea id={id} maxLength={1200} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
  if (field.kind === 'range') return <label className="field" htmlFor={id}>{field.label} <output>{value || '5'}</output><input id={id} type="range" min="0" max="10" value={value || '5'} onChange={(event) => onChange(event.target.value)} /></label>;
  return <label className="field" htmlFor={id}>{field.label}<input id={id} type={field.kind} maxLength={field.kind === 'text' ? 300 : undefined} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}