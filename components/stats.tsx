'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Users, ShoppingCart } from 'lucide-react';

const BACKEND_URL = 'https://querydash-production.up.railway.app';

export function Stats() {
  const [stats, setStats] = useState({
    total_revenue: '$0',
    ytd_growth: '+0%',
    total_orders: '0',
    avg_order_value: '$0',
    top_region: '...',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/stats`);
        const data = await response.json();
        if (data.success) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    {
      label: 'Total Revenue',
      value: loading ? '...' : stats.total_revenue,
      change: 'From all sales in dataset',
      icon: <DollarSign className="w-5 h-5 text-accent" />,
    },
    {
      label: 'YTD Growth',
      value: loading ? '...' : stats.ytd_growth,
      change: 'Q1 vs Q4 comparison',
      icon: <TrendingUp className="w-5 h-5 text-accent" />,
    },
    {
      label: 'Total Orders',
      value: loading ? '...' : stats.total_orders.toLocaleString(),
      change: 'Total transactions',
      icon: <Users className="w-5 h-5 text-accent" />,
    },
    {
      label: 'Avg Order Value',
      value: loading ? '...' : stats.avg_order_value,
      change: `Top region: ${loading ? '...' : stats.top_region}`,
      icon: <ShoppingCart className="w-5 h-5 text-accent" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => (
        <div key={stat.label} className="glass p-4 chart-animation">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold mt-2 ${loading ? 'animate-pulse text-white/30' : ''}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
            </div>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
} 