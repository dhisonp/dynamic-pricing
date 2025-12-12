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
      <div className="min-h-screen bg-gray-200 p-8 flex items-center justify-center">
        <div className="text-center font-mono">
          <p className="text-sm">LOADING_SYSTEM_DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-12">
      <div className="max-w-4xl bg-white dark:bg-black mx-auto sm:border border-gray-200 dark:border-gray-800 sm:p-6">
        <header className="mb-12 border-b border-default pb-6">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">
            Event Sales Analytics
          </h1>
          <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
            SYSTEM_STATUS: ONLINE // 24-MONTH_DASHBOARD
          </p>
        </header>

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
          <div className="bg-gray-50 dark:bg-gray-950 border border-default p-12 text-center">
            <div className="font-mono text-sm mb-4">NO_DATA_DETECTED</div>
            <h3 className="text-xl font-bold mb-2">
              Awaiting Input
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Upload a valid CSV file to initialize the analytics engine and generate visualizations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
