'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import CSVUploader from '@/components/CSVUploader';
import RecommendationsPanel from '@/components/RecommendationsPanel';
import StatsCards from '@/components/StatsCards';
import PriceChart from '@/components/PriceChart';
import SectionChart from '@/components/SectionChart';
import DataTable from '@/components/DataTable';
import type { TicketSale, Recommendation } from '@/lib/csvTypes';
import {
  calculateStats,
  groupBySection,
  generateTimeSeriesData,
} from '@/lib/analytics';
import { generateRecommendations } from '@/lib/recommendations';

export default function Home() {
  const [salesData, setSalesData] = useState<TicketSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    fetch('/example-sales.csv')
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            setSalesData(results.data as TicketSale[]);
            setIsLoading(false);
          },
        });
      })
      .catch((error) => {
        console.error('Failed to load example CSV:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (salesData.length > 0) {
      const recs = generateRecommendations(salesData);
      setRecommendations(recs);
    }
  }, [salesData]);

  const handleDataLoaded = (data: TicketSale[]) => {
    setSalesData(data);
  };

  const handleDismissRecommendation = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, dismissed: true } : r))
    );
  };

  const analytics = salesData.length > 0 ? calculateStats(salesData) : null;
  const sectionData = salesData.length > 0 ? groupBySection(salesData) : [];
  const timeSeriesData = salesData.length > 0 ? generateTimeSeriesData(salesData) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Event Sales Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          24-Month Ticket Sales Dashboard
        </p>

        <CSVUploader onDataLoaded={handleDataLoaded} />

        {salesData.length > 0 && recommendations.length > 0 && (
          <RecommendationsPanel
            recommendations={recommendations}
            onDismiss={handleDismissRecommendation}
          />
        )}

        {salesData.length > 0 ? (
          <>
            {analytics && <StatsCards analytics={analytics} />}

            {timeSeriesData.length > 0 && <PriceChart data={timeSeriesData} />}

            {sectionData.length > 0 && <SectionChart data={sectionData} />}

            <DataTable data={salesData} />
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              No Data Loaded
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Upload a CSV file to view sales analytics and visualizations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
