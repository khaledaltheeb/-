'use client';

import styles from './addiction-atlas.module.css';

type Props = { label?: string };

export default function PrintPageButton({ label = 'طباعة / حفظ PDF' }: Props) {
  return <button type="button" className={styles.printButton} onClick={() => window.print()}>{label}</button>;
}
