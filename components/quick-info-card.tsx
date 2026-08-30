import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getQuickInfoVisualProfile } from '@/lib/quick-info-visual';
import styles from './quick-info-card.module.css';

type Props = {
  title: string;
  description?: string | null;
  href?: string;
  variant?: 'card' | 'hero';
  showAction?: boolean;
};

type VisualStyle = CSSProperties & {
  '--qi-accent': string;
  '--qi-accent-dark': string;
  '--qi-soft': string;
  '--qi-glow': string;
};

export default function QuickInfoCard({ title, description, href, variant = 'card', showAction = true }: Props) {
  const visual = getQuickInfoVisualProfile(title);
  const visualStyle: VisualStyle = {
    '--qi-accent': visual.accent,
    '--qi-accent-dark': visual.accentDark,
    '--qi-soft': visual.soft,
    '--qi-glow': visual.glow,
  };
  const className = variant === 'hero' ? `${styles.root} ${styles.hero}` : styles.root;

  return <section className={className} style={visualStyle} dir="rtl" data-quick-info-visual={visual.id}>
    <div className={styles.content}>
      <div className={styles.brandRow}>
        <span className={styles.brandMark} aria-hidden="true">ر</span>
        <span className={styles.brandCopy}><strong>منصة روافد</strong><small>معرفة عربية موثوقة</small></span>
      </div>
      <div className={styles.badges}>
        <span className={styles.quickBadge}>معلومات سريعة</span>
        <span className={styles.category}>{visual.label}</span>
      </div>
      {href ? <h2 className={styles.title}><Link href={href}>{title}</Link></h2> : <h2 className={styles.title}>{title}</h2>}
      {description && <p className={styles.description}>{description}</p>}
      {href && showAction && <Link className={styles.action} href={href}>قراءة الصفحة <span aria-hidden="true">←</span></Link>}
    </div>
  </section>;
}
