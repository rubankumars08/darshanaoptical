'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_PAGE_SIZE = 10;

export default function TablePagination({ pageSize = DEFAULT_PAGE_SIZE }: { pageSize?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(0);

  const getRows = useCallback(() => {
    const tableWrap = rootRef.current?.previousElementSibling;
    if (!(tableWrap instanceof HTMLElement) || !tableWrap.classList.contains('adm-table-wrap')) return [];
    return Array.from(tableWrap.querySelectorAll<HTMLTableRowElement>('tbody > tr'));
  }, []);

  const measure = useCallback(() => {
    const rows = getRows();
    const isMessageRow = rows.length === 1 && rows[0].cells.length === 1 && rows[0].cells[0].colSpan > 1;
    const count = isMessageRow ? 0 : rows.length;
    setRowCount(count);
    setPage((current) => Math.min(current, Math.max(1, Math.ceil(count / pageSize))));
  }, [getRows, pageSize]);

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(measure);
    const tableWrap = rootRef.current?.previousElementSibling;
    if (!(tableWrap instanceof HTMLElement)) {
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new MutationObserver(() => {
      setPage(1);
      measure();
    });
    observer.observe(tableWrap, { childList: true, subtree: true });
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure]);

  useEffect(() => {
    const rows = getRows();
    const start = (page - 1) * pageSize;
    rows.forEach((row, index) => {
      row.hidden = rowCount > pageSize && (index < start || index >= start + pageSize);
    });
    return () => rows.forEach((row) => { row.hidden = false; });
  }, [getRows, page, pageSize, rowCount]);

  const pageCount = Math.max(1, Math.ceil(rowCount / pageSize));
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, rowCount);

  return (
    <div ref={rootRef} className={rowCount > pageSize ? 'adm-pagination' : 'adm-pagination-anchor'} aria-label={rowCount > pageSize ? 'Table pagination' : undefined}>
      {rowCount > pageSize && <>
        <span className="adm-pagination-summary">{startItem}–{endItem} of {rowCount}</span>
        <div className="adm-pagination-controls">
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} aria-label="Previous page">
            <ChevronLeft aria-hidden="true" />
          </button>
          <span>Page {page} of {pageCount}</span>
          <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page === pageCount} aria-label="Next page">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </>}
    </div>
  );
}
