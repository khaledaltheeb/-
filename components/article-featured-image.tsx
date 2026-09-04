import Image from 'next/image';
import { resolveVisiblePageImage, type PageImageKind } from '@/lib/page-image';

type ArticleFeaturedImageProps = {
  title: string;
  slug?: string | null;
  kind?: PageImageKind;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

export default function ArticleFeaturedImage({
  title,
  slug,
  kind = 'article',
  featuredImageUrl,
  featuredImageAlt,
  priority = false,
  sizes = '(max-width: 900px) 100vw, 900px',
  className = 'article-featured-image',
}: ArticleFeaturedImageProps) {
  const visual = resolveVisiblePageImage({
    title,
    slug,
    kind,
    featuredImageUrl,
    featuredImageAlt,
  });

  return (
    <figure
      className={className}
      data-page-visual={visual.generatedFallback ? 'generated-fallback' : 'curated'}
    >
      <Image
        src={visual.src}
        alt={visual.alt}
        width={visual.width}
        height={visual.height}
        sizes={sizes}
        priority={priority}
        unoptimized
      />
    </figure>
  );
}
