'use client';

export default function PrintPageButton() {
  return (
    <button type="button" className="button" onClick={() => window.print()}>
      طباعة الأوراق
    </button>
  );
}
