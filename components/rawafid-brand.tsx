import Link from 'next/link';
import RawafidMark from '@/components/rawafid-mark';

type RawafidBrandProps = {
  className?: string;
};

export default function RawafidBrand({ className = '' }: RawafidBrandProps) {
  return (
    <Link prefetch={false} className={['brand', className].filter(Boolean).join(' ')} href="/" aria-label="منصة روافد - الرئيسية">
      <span className="brand-mark" aria-hidden="true"><RawafidMark /></span>
      <span className="brand-copy">
        <strong>منصة روافد</strong>
        <small>معرفة تقود إلى أثر</small>
      </span>
    </Link>
  );
}
