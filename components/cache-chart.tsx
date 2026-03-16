'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { CardWrapper } from './card-wrapper';
import { mockChartData } from '@/lib/mock-data';

const COLORS = ['hsl(210, 85%, 55%)', 'hsl(180, 100%, 50%)', 'hsl(280, 85%, 65%)', 'hsl(60, 100%, 50%)'];

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${value}%`}
    </text>
  );
};

const renderCustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '8px',
      paddingTop: '8px',
    }}>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#ffffff',
          fontSize: '11px',
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '2px',
            backgroundColor: entry.color,
            flexShrink: 0,
          }} />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function CacheChart() {
  return (
    <CardWrapper title="Revenue by Category" subtitle="Product Mix">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={mockChartData.revenueByCategory}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {mockChartData.revenueByCategory.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e1e2e',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#ffffff',
            }}
            itemStyle={{ color: '#ffffff' }}
            formatter={(value) => [`${value}%`, 'Share']}
          />
          <Legend content={renderCustomLegend} />
        </PieChart>
      </ResponsiveContainer>
    </CardWrapper>
  );
}