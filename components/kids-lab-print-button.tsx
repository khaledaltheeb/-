'use client';

import styles from '@/app/capabilities/kids-lab/kids-lab.module.css';

export default function KidsLabPrintButton() {
  return (
    <button type="button" className={`${styles.primaryButton} ${styles.printButton}`} onClick={() => window.print()}>
      طباعة / حفظ PDF
    </button>
  );
}
