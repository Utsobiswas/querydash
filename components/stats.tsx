'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Users, ShoppingCart } from 'lucide-react';

const BACKEND_URL = 'https://querydash-production.up.railway.app';

interface StatsProps {
  isUploaded?: boolean;
  uploadedCSVData?: any;
}

export function Stats({ isUploaded = false, uploadedCSVData = null }: StatsProps) {
  const [defaultStats, setDefaultStats] = useState({
    total_revenue: '$0',
    ytd_growth: '+0%',
    total_orders: '0',
    avg_order_value: '$0',
    top_region: '...',
  });
  const [loading, setLoading] = useState(true);

  // Fetch default stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/stats`);
        const data = await response.json();
        if (data.success) {
          setDefaultStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Decide which stats to show
  const activeStats = isUploaded && uploadedCSVData ? uploadedCSVData : defaultStats;
  const isLoadingActive = loading && !isUploaded;

  const statItems = [
    {
      label: 'Total Revenue',
      value: isLoadingActive ? '...' : activeStats.total_revenue,
      change: isUploaded ? '📁 From uploaded CSV' : 'From all sales in dataset',
      icon: <DollarSign className="w-5 h-5 text-accent" />,
    },
    {
      label: 'YTD Growth',
      value: isLoadingActive ? '...' : activeStats.ytd_growth,
      change: isUploaded ? '📁 From uploaded CSV' : 'Q1 vs Q4 comparison',
      icon: <TrendingUp className="w-5 h-5 text-accent" />,
    },
    {
      label: 'Total Orders',
      value: isLoadingActive ? '...' : String(activeStats.total_orders),
      change: isUploaded ? '📁 From uploaded CSV' : 'Total transactions',
      icon: <Users className="w-5 h-5 text-accent" />,
    },
    {
      label: 'Avg Order Value',
      value: isLoadingActive ? '...' : activeStats.avg_order_value,
      change: `Top region: ${isLoadingActive ? '...' : activeStats.top_region}`,
      icon: <ShoppingCart className="w-5 h-5 text-accent" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {isUploaded && (
        <div className="col-span-full mb-1">
          <p className="text-xs text-green-400 flex items-center gap-1">
            📁 Showing stats from your uploaded CSV — 
            <span className="text-white/40">remove file to see default data</span>
          </p>
        </div>
      )}
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className={`glass p-4 chart-animation border ${
            isUploaded ? 'border-green-400/20' : 'border-white/5'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold mt-2 ${isLoadingActive ? 'animate-pulse text-white/30' : ''}`}>
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