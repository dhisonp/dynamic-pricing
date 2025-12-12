'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import type { TicketSale } from '@/lib/csvTypes';

interface DataTableProps {
  data: TicketSale[];
}

type SortField = 'timestamp' | 'price' | 'seat' | 'section';
type SortDirection = 'asc' | 'desc';

export default function DataTable({ data }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterSection, setFilterSection] = useState<string>('all');

  const rowsPerPage = 25;

  const sections = useMemo(() => {
    const uniqueSections = new Set(data.map((sale) => sale.section));
    return ['all', ...Array.from(uniqueSections)];
  }, [data]);

  const filteredData = useMemo(() => {
    if (filterSection === 'all') return data;
    return data.filter((sale) => sale.section === filterSection);
  }, [data, filterSection]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (sortField === 'timestamp') {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const isHistorical = (timestamp: string) => {
    return new Date(timestamp) <= new Date();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Sales Data ({filteredData.length} records)
        </h3>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">Filter:</label>
          <select
            value={filterSection}
            onChange={(e) => {
              setFilterSection(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {sections.map((section) => (
              <option key={section} value={section}>
                {section === 'all' ? 'All Sections' : section}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                Event ID
              </th>
              <th
                className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center gap-2">
                  Timestamp
                  {sortField === 'timestamp' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-end gap-2">
                  Price
                  {sortField === 'price' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('seat')}
              >
                <div className="flex items-center gap-2">
                  Seat
                  {sortField === 'seat' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('section')}
              >
                <div className="flex items-center gap-2">
                  Section
                  {sortField === 'section' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((sale, index) => (
              <tr
                key={`${sale.event_id}-${sale.seat}-${index}`}
                className={`border-b border-gray-100 dark:border-gray-700 ${
                  isHistorical(sale.timestamp)
                    ? 'bg-blue-50/50 dark:bg-blue-900/10'
                    : 'bg-purple-50/50 dark:bg-purple-900/10'
                }`}
              >
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                  {sale.event_id}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  {formatDate(sale.timestamp)}
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-gray-100">
                  {formatPrice(sale.price)}
                </td>
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-mono">
                  {sale.seat}
                </td>
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                  {sale.section}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800"></div>
          <span className="text-gray-600 dark:text-gray-300">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800"></div>
          <span className="text-gray-600 dark:text-gray-300">Projected</span>
        </div>
      </div>
    </div>
  );
}
