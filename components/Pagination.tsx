
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Logic to show limited page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first, last, and current surroundings
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-2 select-none">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-full border transition-all duration-200 ${
          currentPage === 1
            ? 'border-slate-100 text-slate-300 cursor-not-allowed'
            : 'border-slate-200 text-slate-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {getPageNumbers().map((page, idx) => (
        <React.Fragment key={idx}>
          {page === '...' ? (
            <span className="px-2 text-slate-400 text-sm">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
                currentPage === page
                  ? 'bg-brand-600 text-white shadow-md scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200'
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-full border transition-all duration-200 ${
          currentPage === totalPages
            ? 'border-slate-100 text-slate-300 cursor-not-allowed'
            : 'border-slate-200 text-slate-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600'
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
