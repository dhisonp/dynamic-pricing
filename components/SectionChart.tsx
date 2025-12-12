'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SectionData } from '@/lib/csvTypes';

interface SectionChartProps {
  data: SectionData[];
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981'];

export default function SectionChart({ data }: SectionChartProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(0)}`;
  };

  const chartData = data.map((section) => ({
    section: section.section,
    avgPrice: section.averagePrice,
    sales: section.totalSales,
    revenue: section.totalRevenue,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
        Section Analytics
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">
            Average Price by Section
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="section" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis tickFormatter={formatCurrency} stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Avg Price']}
              />
              <Bar dataKey="avgPrice" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">
            Total Sales by Section
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="section" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
                formatter={(value: number) => [value, 'Sales']}
              />
              <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((section, index) => (
          <div
            key={section.section}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            style={{ borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}
          >
            <h5 className="font-semibold text-gray-800 dark:text-white mb-2">
              {section.section}
            </h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Total Sales</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {section.totalSales}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Avg Price</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(section.averagePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Revenue</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(section.totalRevenue)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
