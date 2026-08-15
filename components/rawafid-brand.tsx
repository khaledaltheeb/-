import Link from 'next/link';

type RawafidBrandProps = {
  className?: string;
};

export default function RawafidBrand({ className = '' }: RawafidBrandProps) {
  return (
    <Link className={['brand', className].filter(Boolean).join(' ')} href="/" aria-label="منصة روافد - الرئيسية">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" focusable="false">
          <circle className="logo-source" cx="13" cy="12" r="3.2" />
          <path className="logo-stream" d="M13 16c1 8 5.5 10.5 12 12.5S35.5 34 36 40" />
          <path className="logo-stream" d="M6.5 22c7.5 0 10.5 4 18.5 6.5S35.5 34 36 40" />
          <path className="logo-stream" d="M21 8c-2 8 0 14 4 20.5S34.5 35 36 40" />
          <path className="logo-stream" d="M31 15c-3.5 4-5.5 8-6 13.5" />
        </svg>
      </span>
      <span className="brand-copy">
        <strong>منصة روافد</strong>
        <small>معرفة تقود إلى أثر</small>
      </span>
    </Link>
  );
}
