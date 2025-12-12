'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import type { TimeSeriesDataPoint } from '@/lib/csvTypes';

interface PriceChartProps {
  data: TimeSeriesDataPoint[];
}

export default function PriceChart({ data }: PriceChartProps) {
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM yyyy');
  };

  const formatPrice = (value: number) => {
    return `$${value.toFixed(0)}`;
  };

  const historicalData = data.filter((d) => d.isHistorical);
  const projectedData = data.filter((d) => !d.isHistorical);

  const combinedData = data.map((point) => ({
    timestamp: point.timestamp,
    date: format(new Date(point.timestamp), 'MMM dd, yyyy'),
    historical: point.isHistorical ? point.price : null,
    projected: !point.isHistorical ? point.price : null,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
        Price Timeline (24 Months)
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatDate}
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tickFormatter={formatPrice}
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
            labelFormatter={(label: number) => format(new Date(label), 'MMM dd, yyyy')}
          />
          <Legend />
          <ReferenceLine
            x={Date.now()}
            stroke="#9CA3AF"
            strokeDasharray="3 3"
            label={{ value: 'Today', position: 'top', fill: '#9CA3AF' }}
          />
          <Line
            type="monotone"
            dataKey="historical"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            name="Historical"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="#A855F7"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Projected"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-300">
            Historical ({historicalData.length} sales)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-purple-500 border-dashed"></div>
          <span className="text-gray-600 dark:text-gray-300">
            Projected ({projectedData.length} sales)
          </span>
        </div>
      </div>
    </div>
  );
}
