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

function TopicGlyph({ icon }: { icon: string }) {
  if (icon === 'moon') return <><span className={styles.moon} /><span className={styles.spark} /></>;
  if (icon === 'family') return <><span className={styles.personLarge} /><span className={styles.personSmall} /><span className={styles.arc} /></>;
  if (icon === 'recovery') return <><span className={styles.path} /><span className={styles.arrow} /></>;
  if (icon === 'leaf') return <><span className={styles.leafOne} /><span className={styles.leafTwo} /><span className={styles.stem} /></>;
  if (icon === 'nodes') return <><span className={styles.nodeOne} /><span className={styles.nodeTwo} /><span className={styles.nodeThree} /><span className={styles.nodeLineOne} /><span className={styles.nodeLineTwo} /></>;
  if (icon === 'pill') return <><span className={styles.pill} /><span className={styles.pillLine} /></>;
  if (icon === 'chat') return <><span className={styles.chatOne} /><span className={styles.chatTwo} /></>;
  if (icon === 'mind') return <><span className={styles.mindRing} /><span className={styles.mindDotOne} /><span className={styles.mindDotTwo} /><span className={styles.mindDotThree} /></>;
  return <><span className={styles.infoRing}>i</span><span className={styles.spark} /></>;
}

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
    <div className={styles.visual} aria-hidden="true">
      <span className={styles.orbPrimary} />
      <span className={styles.orbSecondary} />
      <div className={styles.glyph}><TopicGlyph icon={visual.icon} /></div>
    </div>
    <div className={styles.content}>
      <div className={styles.brandRow}>
        <span className={styles.brandMark}>ر</span>
        <span className={styles.brandCopy}><strong>منصة روافد</strong><small>معرفة عربية موثوقة</small></span>
      </div>
      <span className={styles.category}>{visual.label}</span>
      {href ? <h2 className={styles.title}><Link href={href}>{title}</Link></h2> : <h2 className={styles.title}>{title}</h2>}
      {description && <p className={styles.description}>{description}</p>}
      {href && showAction && <Link className={styles.action} href={href}>قراءة الصفحة <span aria-hidden="true">←</span></Link>}
    </div>
  </section>;
}
