import { href, Link } from 'react-router';
import { twJoin } from 'tailwind-merge';

export interface PaginationProps {
  count: number;
  page: number;
}

function getPath(page: number) {
  return href(`/pages/:page`, { page: String(page) });
}

export function Pagination({ count, page }: PaginationProps) {
  const start = Math.floor((page - 1) / 5) * 5 + 1;
  const end = Math.min(start + 4, count);
  const isFirstPageGroup = page <= 5;
  const isLastPageGroup = start + 4 >= count;

  return (
    <nav className="flex justify-center gap-2">
      <Link
        aria-disabled={isFirstPageGroup}
        aria-label={[
          '이전 페이지',
          !isFirstPageGroup && `(${start - 1} 페이지)`,
        ]
          .filter(Boolean)
          .join('')}
        className={twJoin(
          'inline-flex size-8 items-center justify-center border md:size-10',
          isFirstPageGroup && 'pointer-events-none opacity-16',
        )}
        tabIndex={isFirstPageGroup ? -1 : undefined}
        to={isFirstPageGroup ? '#' : getPath(start - 1)}
      >
        {'<'}
      </Link>

      {Array.from({ length: end - start + 1 }, (_, index) => {
        const pageNumber = start + index;

        return (
          <Link
            key={pageNumber}
            aria-label={[
              `${pageNumber} 페이지`,
              pageNumber === page && '(현재 페이지)',
            ]
              .filter(Boolean)
              .join('')}
            className={twJoin(
              'inline-flex size-8 items-center justify-center border md:size-10',
              pageNumber === page && 'bg-zinc-200 dark:bg-zinc-700',
            )}
            to={getPath(pageNumber)}
          >
            {pageNumber}
          </Link>
        );
      })}

      <Link
        aria-disabled={isLastPageGroup}
        aria-label={[`다음 페이지`, !isLastPageGroup && `(${end + 1} 페이지)`]
          .filter(Boolean)
          .join('')}
        className={twJoin(
          'inline-flex size-8 items-center justify-center border md:size-10',
          isLastPageGroup && 'pointer-events-none opacity-16',
        )}
        tabIndex={isLastPageGroup ? -1 : undefined}
        to={isLastPageGroup ? '#' : getPath(end + 1)}
      >
        {'>'}
      </Link>
    </nav>
  );
}
