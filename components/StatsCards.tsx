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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
        Sales Overview
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-6">
          <p className="text-sm text-purple-100 mb-1">Total Sales</p>
          <p className="text-3xl font-bold text-white">{analytics.totalSales}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-6">
          <p className="text-sm text-green-100 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(analytics.totalRevenue)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg p-6">
          <p className="text-sm text-orange-100 mb-1">Average Price</p>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(analytics.averagePrice)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-6">
          <p className="text-sm text-blue-100 mb-1">Price Range</p>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(analytics.minPrice)} - {formatCurrency(analytics.maxPrice)}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">
          Historical vs Projected
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
            <p className="text-xs text-blue-600 dark:text-blue-300 mb-2 font-medium">
              Historical Sales
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Count</span>
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {analytics.historicalSales}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Revenue</span>
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {formatCurrency(analytics.historicalRevenue)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
            <p className="text-xs text-purple-600 dark:text-purple-300 mb-2 font-medium">
              Projected Sales
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Count</span>
                <span className="font-semibold text-purple-900 dark:text-purple-100">
                  {analytics.projectedSales}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Revenue</span>
                <span className="font-semibold text-purple-900 dark:text-purple-100">
                  {formatCurrency(analytics.projectedRevenue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
