import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 200,
  onPageChange,
  className = ''
}) {
  if (totalItems === 0 || totalPages <= 1) {
    if (totalItems === 0) return null
    return (
      <div className={`flex items-center justify-between py-4 px-2 text-xs sm:text-sm text-slate-400 border-t border-dark-border/50 ${className}`}>
        <div>
          Showing <span className="font-bold text-white">1</span>–<span className="font-bold text-white">{totalItems}</span> of{' '}
          <span className="font-bold text-white">{totalItems}</span> products
        </div>
      </div>
    )
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      let startPage = Math.max(1, currentPage - 2)
      let endPage = Math.min(totalPages, currentPage + 2)

      if (currentPage <= 3) {
        startPage = 1
        endPage = maxVisiblePages
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisiblePages + 1
        endPage = totalPages
      }

      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) pages.push('...')
      }

      for (let i = startPage; i <= endPage; i++) {
        if (!pages.includes(i)) pages.push(i)
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-dark-border/50 ${className}`}>
      {/* Summary Info */}
      <div className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
        Showing <span className="font-bold text-white">{startItem.toLocaleString()}</span>–
        <span className="font-bold text-white">{endItem.toLocaleString()}</span> of{' '}
        <span className="font-bold text-white">{totalItems.toLocaleString()}</span> products
        <span className="ml-2 text-xs text-slate-500 font-mono">({itemsPerPage} per page)</span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First Page"
          className="p-1.5 sm:p-2 rounded-lg border border-dark-border bg-dark-card text-slate-400 hover:text-white hover:border-primary/50 disabled:opacity-30 disabled:hover:border-dark-border disabled:hover:text-slate-400 transition-all"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
          className="p-1.5 sm:p-2 rounded-lg border border-dark-border bg-dark-card text-slate-400 hover:text-white hover:border-primary/50 disabled:opacity-30 disabled:hover:border-dark-border disabled:hover:text-slate-400 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-1 text-slate-500 text-xs sm:text-sm select-none">
                  ...
                </span>
              )
            }

            const isCurrent = page === currentPage
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/25'
                    : 'bg-dark-card text-slate-300 border-dark-border hover:border-primary/40 hover:text-white'
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next Page"
          className="p-1.5 sm:p-2 rounded-lg border border-dark-border bg-dark-card text-slate-400 hover:text-white hover:border-primary/50 disabled:opacity-30 disabled:hover:border-dark-border disabled:hover:text-slate-400 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last Page"
          className="p-1.5 sm:p-2 rounded-lg border border-dark-border bg-dark-card text-slate-400 hover:text-white hover:border-primary/50 disabled:opacity-30 disabled:hover:border-dark-border disabled:hover:text-slate-400 transition-all"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
