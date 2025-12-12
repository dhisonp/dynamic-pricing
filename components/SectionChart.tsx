'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SectionData } from '@/lib/csvTypes';

interface SectionChartProps {
  data: SectionData[];
}

// Ardent Palette Cycle
const COLORS = ['#1A7A9C', '#10A860', '#D4A012', '#DC2626', '#525252'];

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
    <div className="mb-12 border border-default p-6 bg-white dark:bg-black">
      <h3 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-6">
        Analytics // Section_Performance
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h4 className="font-mono text-xs text-gray-400 mb-4 uppercase">
            Avg Price by Section
          </h4>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis 
                  dataKey="section" 
                  stroke="#525252" 
                  tick={{ fontSize: 11, fontFamily: 'var(--font-ibm-plex-mono)' }}
                  tickLine={false}
                  axisLine={{ stroke: '#525252' }}
                />
                <YAxis 
                  tickFormatter={formatCurrency} 
                  stroke="#525252" 
                  tick={{ fontSize: 11, fontFamily: 'var(--font-ibm-plex-mono)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{
                    backgroundColor: '#000000',
                    border: '1px solid #000000',
                    borderRadius: '0px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'var(--font-ibm-plex-mono)',
                  }}
                  itemStyle={{ color: '#FFFFFF' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Avg Price']}
                />
                <Bar dataKey="avgPrice" radius={[0, 0, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="font-mono text-xs text-gray-400 mb-4 uppercase">
            Total Sales by Section
          </h4>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis 
                  dataKey="section" 
                  stroke="#525252" 
                  tick={{ fontSize: 11, fontFamily: 'var(--font-ibm-plex-mono)' }}
                  tickLine={false}
                  axisLine={{ stroke: '#525252' }}
                />
                <YAxis 
                  stroke="#525252" 
                  tick={{ fontSize: 11, fontFamily: 'var(--font-ibm-plex-mono)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{
                    backgroundColor: '#000000',
                    border: '1px solid #000000',
                    borderRadius: '0px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'var(--font-ibm-plex-mono)',
                  }}
                  itemStyle={{ color: '#FFFFFF' }}
                  formatter={(value: number) => [value, 'Sales']}
                />
                <Bar dataKey="sales" radius={[0, 0, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-default pt-6">
        {data.map((section, index) => (
          <div
            key={section.section}
            className="p-4 bg-gray-50 dark:bg-gray-900 border-l-2"
            style={{ borderLeftColor: COLORS[index % COLORS.length] }}
          >
            <h5 className="font-mono text-xs font-bold uppercase mb-3">
              Section {section.section}
            </h5>
            <div className="space-y-1 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Vol</span>
                <span className="font-medium">
                  {section.totalSales}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Avg</span>
                <span className="font-medium">
                  {formatCurrency(section.averagePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rev</span>
                <span className="font-medium">
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