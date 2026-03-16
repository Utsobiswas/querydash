'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CardWrapper } from './card-wrapper';
import { mockChartData } from '@/lib/mock-data';

export function TransferChart() {
  return (
    <CardWrapper title="Sales by Region" subtitle="Regional Performance">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={mockChartData.salesByRegion}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="region" stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" formatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(18, 18, 26, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
            formatter={(value) => `$${(value as number).toLocaleString()}`}
          />
          <Bar dataKey="sales" fill="hsl(180, 100%, 50%)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardWrapper>
  );
}
