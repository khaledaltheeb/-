export type SiteNavIconName = 'home' | 'search' | 'discover' | 'messages' | 'account' | 'specialists' | 'more';

export default function SiteNavIcon({ name }: { name: SiteNavIconName }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <use href={`/rawafid-icons.svg#nav-${name}`} />
    </svg>
  );
}
