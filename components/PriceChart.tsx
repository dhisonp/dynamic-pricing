'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import type { TimeSeriesDataPoint } from '@/lib/csvTypes';

interface PriceChartProps {
  data: TimeSeriesDataPoint[];
}

export default function PriceChart({ data }: PriceChartProps) {
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM yy');
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

  // Ardent Colors
  const COLOR_HISTORICAL = '#1A7A9C'; // Ocean
  const COLOR_PROJECTED = '#D4A012';  // Goldenrod

  return (
    <div className="mb-12 border border-default p-6 bg-white dark:bg-black">
      <h3 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-6">
        Analytics // Price_Timeline
      </h3>

      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              stroke="#525252"
              tick={{ fontSize: 11, fontFamily: 'var(--font-ibm-plex-mono)' }}
              tickLine={false}
              axisLine={{ stroke: '#525252' }}
            />
            <YAxis
              tickFormatter={formatPrice}
              stroke="#525252"
              tick={{ fontSize: 11, fontFamily: 'var(--font-ibm-plex-mono)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#000000',
                border: '1px solid #000000',
                borderRadius: '0px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'var(--font-ibm-plex-mono)',
              }}
              itemStyle={{ color: '#FFFFFF' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              labelFormatter={(label: number) => format(new Date(label), 'MMM dd, yyyy')}
              cursor={{ stroke: '#000000', strokeWidth: 1 }}
            />
            <Legend 
              wrapperStyle={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11px', paddingTop: '20px' }}
            />
            <ReferenceLine
              x={Date.now()}
              stroke="#000000"
              strokeDasharray="3 3"
              label={{ 
                value: 'TODAY', 
                position: 'top', 
                fill: '#000000', 
                fontSize: 10,
                fontFamily: 'var(--font-ibm-plex-mono)'
              }}
            />
            <Line
              type="stepAfter" // Ardent preference for "Precise/Engineered" look? Monotone is fine too, but step is more data-honest. Let's stick to monotone for readability but reduce curve.
              dataKey="historical"
              stroke={COLOR_HISTORICAL}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: COLOR_HISTORICAL }}
              name="HISTORICAL"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke={COLOR_PROJECTED}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4, fill: COLOR_PROJECTED }}
              name="PROJECTED"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}