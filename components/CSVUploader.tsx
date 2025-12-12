'use client';

import { useCallback, useState } from 'react';
import Papa from 'papaparse';
import type { TicketSale } from '@/lib/csvTypes';

interface CSVUploaderProps {
  onDataLoaded: (data: TicketSale[]) => void;
}

export default function CSVUploader({ onDataLoaded }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCSV = (data: unknown[]): data is TicketSale[] => {
    if (!Array.isArray(data) || data.length === 0) {
      setError('ERROR: Empty dataset');
      return false;
    }

    const requiredFields = ['event_id', 'timestamp', 'price', 'seat', 'section'];
    const firstRow = data[0] as Record<string, unknown>;

    for (const field of requiredFields) {
      if (!(field in firstRow)) {
        setError(`ERROR: Missing field [${field}]`);
        return false;
      }
    }

    return true;
  };

  const parseCSV = useCallback(
    (file: File) => {
      setIsLoading(true);
      setError(null);

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`PARSE_ERROR: ${results.errors[0].message}`);
            setIsLoading(false);
            return;
          }

          if (validateCSV(results.data)) {
            onDataLoaded(results.data as TicketSale[]);
          }
          setIsLoading(false);
        },
        error: (error) => {
          setError(`SYSTEM_ERROR: ${error.message}`);
          setIsLoading(false);
        },
      });
    },
    [onDataLoaded]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type === 'text/csv') {
        parseCSV(file);
      } else {
        setError('INVALID_FILE_TYPE: CSV required');
      }
    },
    [parseCSV]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        parseCSV(file);
      }
    },
    [parseCSV]
  );

  const downloadExample = useCallback(() => {
    const link = document.createElement('a');
    link.href = '/example-sales.csv';
    link.download = 'example-sales.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="mb-12 border border-default p-6 bg-secondary">
      <div className="flex justify-between items-center mb-4 border-b border-default pb-4">
        <h3 className="font-mono text-sm uppercase">Data_Ingestion</h3>
        <button
          onClick={downloadExample}
          className="font-mono text-xs underline decoration-1 underline-offset-4 hover:bg-gray-200 px-2 py-1"
        >
          DOWNLOAD_TEMPLATE.CSV
        </button>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border border-dashed p-8 text-center transition-colors ${isDragging
            ? 'border-black bg-gray-100 dark:bg-gray-800'
            : 'border-gray-400 dark:border-gray-600'
          }`}
      >
        {isLoading ? (
          <div className="py-4 font-mono text-sm">
            <span className="animate-pulse">PROCESSING_DATA_stream...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-mono text-sm text-gray-600 dark:text-gray-300">
              DROP_FILE_HERE_OR
            </p>
            <label className="inline-block">
              <span className="bg-black font-mono text-white dark:bg-white dark:text-black px-6 py-2 text-sm font-medium hover:opacity-90 cursor-pointer border border-transparent transition-all">
                SELECT_FILE
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            <p className="font-mono text-xs text-gray-400">
              REQ: event_id, timestamp, price, seat, section
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-600">
          <p className="font-mono text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
