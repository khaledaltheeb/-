type IconName = 'knowledge' | 'specialist' | 'center' | 'tools' | 'community' | 'secure' | 'search' | 'review';

type Props = {
  name: IconName;
  size?: number;
  className?: string;
};

export default function PlatformIcon({ name, size = 24, className }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };

  if (name === 'knowledge') return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z"/></svg>;
  if (name === 'specialist') return <svg {...common}><circle cx="12" cy="7.5" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/><path d="M18.5 5.5v4M16.5 7.5h4"/></svg>;
  if (name === 'center') return <svg {...common}><path d="M4 21V7l8-4 8 4v14"/><path d="M8 21v-5h8v5M9 9h2M13 9h2M9 12h2M13 12h2"/></svg>;
  if (name === 'tools') return <svg {...common}><path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L4 17l3 3 5.5-5.5a4 4 0 0 0 5.2-5.2l-2.3 2.3-3-3 2.3-2.3Z"/></svg>;
  if (name === 'community') return <svg {...common}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3.5 21a5.5 5.5 0 0 1 11 0M14 21a4 4 0 0 1 7 0"/></svg>;
  if (name === 'secure') return <svg {...common}><path d="M12 3 5 6v5c0 4.8 2.8 8.4 7 10 4.2-1.6 7-5.2 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
  if (name === 'search') return <svg {...common}><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>;
  return <svg {...common}><path d="M4 5h16v14H4z"/><path d="m8 11 2.2 2.2L16.5 7M8 16h8"/></svg>;
}
