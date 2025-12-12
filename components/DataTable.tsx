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
    <div className="mb-12 border border-default p-6 bg-white dark:bg-black">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-default pb-4">
        <h3 className="font-mono text-xs uppercase tracking-widest text-gray-500">
          Data_Log // {filteredData.length} RECORDS
        </h3>

        <div className="flex items-center gap-2 font-mono text-xs">
          <label className="text-gray-500">FILTER_SECTION:</label>
          <select
            value={filterSection}
            onChange={(e) => {
              setFilterSection(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2 py-1 border border-gray-300 bg-white dark:bg-black dark:border-gray-700 text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
          >
            {sections.map((section) => (
              <option key={section} value={section}>
                {section === 'all' ? 'ALL' : section}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black dark:border-white text-left font-mono text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-bold text-black dark:text-white">
                Event_ID
              </th>
              <th
                className="py-3 px-4 font-bold text-black dark:text-white cursor-pointer hover:underline decoration-1 underline-offset-4"
                onClick={() => handleSort('timestamp')}
              >
                Timestamp {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="py-3 px-4 text-right font-bold text-black dark:text-white cursor-pointer hover:underline decoration-1 underline-offset-4"
                onClick={() => handleSort('price')}
              >
                Price {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="py-3 px-4 font-bold text-black dark:text-white cursor-pointer hover:underline decoration-1 underline-offset-4"
                onClick={() => handleSort('seat')}
              >
                Seat {sortField === 'seat' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="py-3 px-4 font-bold text-black dark:text-white cursor-pointer hover:underline decoration-1 underline-offset-4"
                onClick={() => handleSort('section')}
              >
                Section {sortField === 'section' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 font-bold text-black dark:text-white text-right">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {paginatedData.map((sale, index) => {
               const historical = isHistorical(sale.timestamp);
               return (
              <tr
                key={`${sale.event_id}-${sale.seat}-${index}`}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <td className="py-2 px-4 text-gray-500">
                  {sale.event_id}
                </td>
                <td className="py-2 px-4 text-black dark:text-white">
                  {formatDate(sale.timestamp)}
                </td>
                <td className="py-2 px-4 text-right font-medium text-black dark:text-white">
                  {formatPrice(sale.price)}
                </td>
                <td className="py-2 px-4 text-gray-600 dark:text-gray-400">
                  {sale.seat}
                </td>
                <td className="py-2 px-4 text-gray-600 dark:text-gray-400">
                  {sale.section}
                </td>
                 <td className="py-2 px-4 text-right">
                  <span className={`inline-block w-2 h-2 rounded-none ${historical ? 'bg-ocean-500' : 'bg-goldenrod-500'}`}></span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center font-mono text-xs">
          <div className="text-gray-500">
            PAGE {currentPage} / {totalPages}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-current"
            >
              PREV
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-current"
            >
              NEXT
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-6 text-[10px] uppercase font-mono tracking-widest text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-ocean-500"></div>
          <span>Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-goldenrod-500"></div>
          <span>Projected</span>
        </div>
      </div>
    </div>
  );
}