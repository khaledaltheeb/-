'use client';

export default function MeasurePrintButton({ label = 'طباعة / حفظ PDF' }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} aria-label={label}>
      {label}
    </button>
  );
}
