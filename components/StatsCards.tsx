'use client';

import type { SalesAnalytics } from '@/lib/csvTypes';

interface StatsCardsProps {
  analytics: SalesAnalytics;
}

export default function StatsCards({ analytics }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="mb-12">
      <h3 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-6 border-b border-default pb-2">
        System_Metrics // Overview
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="bg-gray-50 dark:bg-gray-900 border border-default p-6">
          <p className="font-mono text-xs text-gray-500 mb-2 uppercase">Total Sales</p>
          <p className="text-3xl font-bold tracking-tight">{analytics.totalSales}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 border border-default p-6">
          <p className="font-mono text-xs text-gray-500 mb-2 uppercase">Total Revenue</p>
          <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500">
            {formatCurrency(analytics.totalRevenue)}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 border border-default p-6">
          <p className="font-mono text-xs text-gray-500 mb-2 uppercase">Average Price</p>
          <p className="text-3xl font-bold tracking-tight">
            {formatCurrency(analytics.averagePrice)}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 border border-default p-6">
          <p className="font-mono text-xs text-gray-500 mb-2 uppercase">Price Range</p>
          <p className="text-3xl font-bold tracking-tight">
            {formatCurrency(analytics.minPrice)} <span className="text-gray-400 font-normal text-xl">/</span> {formatCurrency(analytics.maxPrice)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border border-default p-6 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
          <p className="font-mono text-xs text-blue-600 mb-4 uppercase tracking-wider">
            Historical Data
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block font-mono text-xs text-gray-500 mb-1">Volume</span>
              <span className="text-2xl font-bold block">
                {analytics.historicalSales}
              </span>
            </div>
            <div>
              <span className="block font-mono text-xs text-gray-500 mb-1">Revenue</span>
              <span className="text-2xl font-bold block">
                {formatCurrency(analytics.historicalRevenue)}
              </span>
            </div>
          </div>
        </div>

        <div className="border border-default p-6 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-600"></div>
          <p className="font-mono text-xs text-purple-600 mb-4 uppercase tracking-wider">
            Projected Data
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block font-mono text-xs text-gray-500 mb-1">Volume</span>
              <span className="text-2xl font-bold block">
                {analytics.projectedSales}
              </span>
            </div>
            <div>
              <span className="block font-mono text-xs text-gray-500 mb-1">Revenue</span>
              <span className="text-2xl font-bold block">
                {formatCurrency(analytics.projectedRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}