import Link from 'next/link';

type PublicPaginationProps = {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  ariaLabel?: string;
};

function visiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set<number>([1, totalPages, currentPage]);
  for (let offset = -2; offset <= 2; offset += 1) {
    const candidate = currentPage + offset;
    if (candidate > 1 && candidate < totalPages) pages.add(candidate);
  }

  return [...pages].sort((a, b) => a - b);
}

export default function PublicPagination({
  currentPage,
  totalPages,
  hrefForPage,
  ariaLabel = 'التنقل بين الصفحات',
}: PublicPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = visiblePages(currentPage, totalPages);

  return (
    <nav className="public-pagination" aria-label={ariaLabel}>
      <div className="public-pagination__summary" aria-live="polite">
        الصفحة <strong>{currentPage.toLocaleString('ar')}</strong> من{' '}
        <strong>{totalPages.toLocaleString('ar')}</strong>
      </div>

      <div className="public-pagination__controls">
        <Link
          className={`public-pagination__edge${currentPage === 1 ? ' is-disabled' : ''}`}
          href={hrefForPage(1)}
          aria-disabled={currentPage === 1}
          tabIndex={currentPage === 1 ? -1 : undefined}
        >
          الأولى
        </Link>

        <Link
          className={`public-pagination__edge${currentPage === 1 ? ' is-disabled' : ''}`}
          href={hrefForPage(Math.max(1, currentPage - 1))}
          rel={currentPage > 1 ? 'prev' : undefined}
          aria-disabled={currentPage === 1}
          tabIndex={currentPage === 1 ? -1 : undefined}
        >
          السابقة
        </Link>

        <div className="public-pagination__numbers" aria-label="أرقام الصفحات">
          {pages.map((page, index) => {
            const previous = pages[index - 1];
            const hasGap = previous !== undefined && page - previous > 1;
            return (
              <span className="public-pagination__number-wrap" key={page}>
                {hasGap && <span className="public-pagination__ellipsis" aria-hidden="true">…</span>}
                <Link
                  className={`public-pagination__number${page === currentPage ? ' is-active' : ''}`}
                  href={hrefForPage(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page.toLocaleString('ar')}
                </Link>
              </span>
            );
          })}
        </div>

        <Link
          className={`public-pagination__edge${currentPage === totalPages ? ' is-disabled' : ''}`}
          href={hrefForPage(Math.min(totalPages, currentPage + 1))}
          rel={currentPage < totalPages ? 'next' : undefined}
          aria-disabled={currentPage === totalPages}
          tabIndex={currentPage === totalPages ? -1 : undefined}
        >
          التالية
        </Link>

        <Link
          className={`public-pagination__edge${currentPage === totalPages ? ' is-disabled' : ''}`}
          href={hrefForPage(totalPages)}
          aria-disabled={currentPage === totalPages}
          tabIndex={currentPage === totalPages ? -1 : undefined}
        >
          الأخيرة
        </Link>
      </div>
    </nav>
  );
}
