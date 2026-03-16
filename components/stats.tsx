'use client';

import { TrendingUp, DollarSign, Users, ShoppingCart } from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

const stats: StatItem[] = [
  {
    label: 'Total Revenue',
    value: '$792K',
    change: '+18.5% vs last year',
    icon: <DollarSign className="w-5 h-5 text-accent" />,
  },
  {
    label: 'YTD Growth',
    value: '+24.2%',
    change: '+8.3% vs prior period',
    icon: <TrendingUp className="w-5 h-5 text-accent" />,
  },
  {
    label: 'Total Customers',
    value: '1,547',
    change: '+142 new this month',
    icon: <Users className="w-5 h-5 text-accent" />,
  },
  {
    label: 'Avg Order Value',
    value: '$512',
    change: '+6.2% improvement',
    icon: <ShoppingCart className="w-5 h-5 text-accent" />,
  },
];

export function Stats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass p-4 chart-animation">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
            </div>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
