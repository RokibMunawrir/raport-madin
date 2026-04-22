import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  MoreHorizontal 
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  baseUrl?: string;
  queryParam?: string;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  baseUrl,
  queryParam = 'page',
  siblingCount = 1,
  showFirstLast = true,
  className = "",
}) => {
  // Return null if only one page or no pages
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    if (!baseUrl) return '#';
    const url = new URL(baseUrl, 'http://localhost'); // Dummy base for URL parsing if relative
    url.searchParams.set(queryParam, page.toString());
    return url.pathname + url.search;
  };

  const handlePageClick = (e: React.MouseEvent, page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      e.preventDefault();
      return;
    }
    
    if (onPageChange) {
      e.preventDefault();
      onPageChange(page);
    }
  };

  const getRange = (start: number, end: number) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const paginationRange = React.useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    // Case 1: Total pages less than the page numbers we want to show
    if (totalPageNumbers >= totalPages) {
      return getRange(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots should be shown
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = getRange(1, leftItemCount);
      return [...leftRange, 'DOTS', totalPages];
    }

    // Case 3: No right dots, but left dots should be shown
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = getRange(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, 'DOTS', ...rightRange];
    }

    // Case 4: Both left and right dots should be shown
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = getRange(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, 'DOTS', ...middleRange, 'DOTS', lastPageIndex];
    }
    
    return getRange(1, totalPages);
  }, [totalPages, siblingCount, currentPage]);

  const PageButton = ({ 
    page, 
    active = false, 
    disabled = false, 
    children,
    label
  }: { 
    page: number | 'DOTS'; 
    active?: boolean; 
    disabled?: boolean;
    children: React.ReactNode;
    label?: string;
  }) => {
    if (page === 'DOTS') {
      return (
        <span className="flex items-center justify-center w-10 h-10 text-slate-400">
          <MoreHorizontal size={18} />
        </span>
      );
    }

    const baseStyles = "inline-flex items-center justify-center h-10 w-10 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
    const activeStyles = "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-y-[-1px]";
    const inactiveStyles = "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700";
    const disabledStyles = "opacity-40 cursor-not-allowed pointer-events-none";

    const Tag = onPageChange ? 'button' : 'a';
    const props = onPageChange 
      ? { onClick: (e: any) => handlePageClick(e, page as number), type: 'button' as const }
      : { href: getPageUrl(page as number), onClick: (e: any) => handlePageClick(e, page as number) };

    return (
      <Tag
        {...props}
        disabled={disabled}
        className={`${baseStyles} ${active ? activeStyles : inactiveStyles} ${disabled ? disabledStyles : ""}`}
        aria-current={active ? 'page' : undefined}
        title={label || `Page ${page}`}
      >
        {children}
      </Tag>
    );
  };

  return (
    <nav className={`flex items-center justify-center space-x-1.5 py-4 ${className}`} aria-label="Pagination">
      {/* First Page */}
      {showFirstLast && (
        <PageButton page={1} disabled={currentPage === 1} label="First Page">
          <ChevronsLeft size={18} />
        </PageButton>
      )}

      {/* Previous Page */}
      <PageButton page={currentPage - 1} disabled={currentPage === 1} label="Previous Page">
        <ChevronLeft size={18} />
      </PageButton>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1.5">
        {paginationRange?.map((page, index) => (
          <PageButton 
            key={`${page}-${index}`} 
            page={page as number | 'DOTS'} 
            active={page === currentPage}
          >
            {page === 'DOTS' ? <MoreHorizontal size={18} /> : page}
          </PageButton>
        ))}
      </div>

      {/* Next Page */}
      <PageButton page={currentPage + 1} disabled={currentPage === totalPages} label="Next Page">
        <ChevronRight size={18} />
      </PageButton>

      {/* Last Page */}
      {showFirstLast && (
        <PageButton page={totalPages} disabled={currentPage === totalPages} label="Last Page">
          <ChevronsRight size={18} />
        </PageButton>
      )}
    </nav>
  );
};

export default Pagination;
