import Link from 'next/link';

export const CONTENT_DISCLAIMER_LABEL = 'إخلاء المسؤولية والتنبيهات';

export default function ContentDisclaimerLink() {
  return (
    <div className="content-disclaimer-link" aria-label={CONTENT_DISCLAIMER_LABEL}>
      <Link href="/disclaimer">{CONTENT_DISCLAIMER_LABEL}</Link>
    </div>
  );
}
