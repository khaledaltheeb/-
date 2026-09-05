type IconName = 'knowledge' | 'specialist' | 'center' | 'tools' | 'community' | 'secure' | 'search' | 'review';

type Props = {
  name: IconName;
  size?: number;
  className?: string;
};

export default function PlatformIcon({ name, size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <use href={`/rawafid-icons.svg#platform-${name}`} />
    </svg>
  );
}
