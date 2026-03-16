'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CardWrapper } from './card-wrapper';
import { mockChartData } from '@/lib/mock-data';

export function RequestsChart() {
  return (
    <CardWrapper title="Monthly Revenue" subtitle="2024 Revenue Trend">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={mockChartData.monthlyRevenue}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" formatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(18, 18, 26, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
            formatter={(value) => `$${(value as number).toLocaleString()}`}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(210, 85%, 55%)"
            strokeWidth={3}
            isAnimationActive={true}
            dot={{ fill: 'hsl(210, 85%, 55%)', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardWrapper>
  );
}
