import type { CSSProperties } from 'react';

type RawafidMarkProps = {
  className?: string;
  title?: string;
  style?: CSSProperties;
  accent?: string;
};

/**
 * The Rawafid tributary mark: a source point feeding two forward-moving paths.
 * It is intentionally code-native so the same identity stays crisp everywhere.
 */
export default function RawafidMark({ className, title, style, accent }: RawafidMarkProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 64 64"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <circle cx="21" cy="20" r="7" fill="currentColor" />
      <path d="M13 44c14-1 23-7 27-18 4-10 10-17 21-20-1 13-6 23-15 30-9 8-20 11-33 11Z" fill="currentColor" />
      <path d="M16 54c10 0 19-3 26-9 7-5 12-13 15-22 0 13-5 24-13 32-8 7-17 10-28 11Z" fill={accent ?? 'var(--rf-mark-accent, #f4b942)'} />
    </svg>
  );
}
