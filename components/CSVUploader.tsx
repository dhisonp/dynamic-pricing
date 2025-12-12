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
      setError('CSV file is empty');
      return false;
    }

    const requiredFields = ['event_id', 'timestamp', 'price', 'seat', 'section'];
    const firstRow = data[0] as Record<string, unknown>;

    for (const field of requiredFields) {
      if (!(field in firstRow)) {
        setError(`Missing required field: ${field}`);
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
            setError(`Parse error: ${results.errors[0].message}`);
            setIsLoading(false);
            return;
          }

          if (validateCSV(results.data)) {
            onDataLoaded(results.data as TicketSale[]);
          }
          setIsLoading(false);
        },
        error: (error) => {
          setError(`Failed to parse CSV: ${error.message}`);
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
        setError('Please upload a CSV file');
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Upload Sales Data
      </h3>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {isLoading ? (
          <div className="py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Parsing CSV...</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Drag and drop your CSV file here, or
            </p>
            <label className="mt-2 inline-block">
              <span className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                Browse Files
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              CSV with columns: event_id, timestamp, price, seat, section
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <button
          onClick={downloadExample}
          className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          Download Example CSV
        </button>
      </div>
    </div>
  );
}
