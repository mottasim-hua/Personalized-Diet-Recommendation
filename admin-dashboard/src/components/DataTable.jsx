import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import EmptyState from './EmptyState';

/**
 * Reusable data table component.
 */
export default function DataTable({
  data = [],
  columns = [],
  actions = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  filterable = true,
  filterOptions = [],
  pagination = true,
  itemsPerPage = 10,
  title = 'Data Table',
  subtitle,
  loading = false,
  emptyState = 'No data available',
  emptyDescription,
  searchableKeys,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState('');

  const normalizedFilterOptions = filterOptions.length
    ? filterOptions
    : [{ label: 'All Items', value: '' }];

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const pool = searchableKeys?.length
          ? searchableKeys.map((key) => item[key]).join(' ')
          : JSON.stringify(item);
        return String(pool).toLowerCase().includes(query);
      });
    }

    if (filterValue) {
      result = result.filter((item) => {
        const candidate = String(
          item.subscriptionStatus ||
            item.status ||
            item.is_approved ||
            item.is_active ||
            item.availability ||
            item.category ||
            '',
        ).toLowerCase();

        return candidate.includes(filterValue.toLowerCase());
      });
    }

    return result;
  }, [data, filterValue, searchTerm, searchableKeys]);

  const totalPages = pagination
    ? Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
    : 1;

  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [currentPage, filteredData, itemsPerPage, pagination]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, currentPage + 1);
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {subtitle || `Showing ${paginatedData.length} of ${filteredData.length} records`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {searchable && (
            <div className="relative min-w-[240px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="field-input pl-11"
              />
            </div>
          )}

          {filterable && (
            <div className="relative min-w-[180px]">
              <Filter
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={filterValue}
                onChange={(event) => {
                  setFilterValue(event.target.value);
                  setCurrentPage(1);
                }}
                className="field-input appearance-none pl-11"
              >
                {normalizedFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? null : paginatedData.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
                  >
                    {col.label}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <motion.tr
                  key={row.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="border-t border-slate-100 align-top transition-colors hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">
                      {col.render ? col.render(row[col.key], row) : row[col.key] || '-'}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {actions
                          .filter((action) => (action.hidden ? !action.hidden(row) : true))
                          .map((action) => (
                            <button
                              key={action.label}
                              onClick={() => action.onClick?.(row)}
                              className={`rounded-2xl px-3 py-2 text-xs font-semibold transition-colors ${action.className}`}
                            >
                              {action.label}
                            </button>
                          ))}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6">
            <EmptyState
              title={emptyState}
              description={emptyDescription}
            />
          </div>
        )}
      </div>

      {pagination && filteredData.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-slate-100 p-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-2xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={18} />
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-10 min-w-10 rounded-2xl px-3 text-sm font-semibold ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-2xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
