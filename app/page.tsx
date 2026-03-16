'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { QueryInterface } from '@/components/query-interface';
import { Stats } from '@/components/stats';
import { SkeletonCard } from '@/components/skeleton-card';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';

interface ChartData {
  id: string;
  title: string;
  subtitle: string;
  chart_type: string;
  color: string;
  data: { name: string; value: number }[];
}

interface DashboardData {
  success: boolean;
  question_understood: string;
  charts: ChartData[];
  insight: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

function DynamicChart({ chart }: { chart: ChartData }) {
  const { chart_type, data, color, title, subtitle } = chart;

  const renderChart = () => {
    if (chart_type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ fill: color, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    if (chart_type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  if (chart_type === 'pie') {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          outerRadius={75}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
          }
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend wrapperStyle={{ color: '#ffffff', fontSize: '11px', paddingTop: '8px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
    if (chart_type === 'area') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
            <Area type="monotone" dataKey="value" stroke={color} fill={`${color}33`} strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  return (
    <div className="glass rounded-xl p-5 border border-white/10 hover:border-accent/50 transition-all chart-animation">
      <div className="mb-3">
        <h3 className="text-white font-semibold text-base">{title}</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{subtitle}</p>
      </div>
      {renderChart()}
    </div>
  );
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<string>('');
  const [isQueryExecuted, setIsQueryExecuted] = useState(false);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const handleQuerySubmit = (question: string, data: DashboardData) => {
    setLastQuestion(question);
    setIsQueryExecuted(true);
    setDashboardData(data);
    setIsSidebarOpen(false);
    setChatHistory([]);
  };

  const handleFollowUp = async () => {
    if (!followUpQuestion.trim()) return;
    setIsLoadingCharts(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: followUpQuestion,
          session_id: 'default',
          use_uploaded: false,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data);
        setChatHistory(prev => [...prev, followUpQuestion]);
        setLastQuestion(followUpQuestion);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowUpQuestion('');
      setIsLoadingCharts(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar onMenuToggle={setIsSidebarOpen} />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="flex-1">
          <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">

            <div className="fade-in">
              <h2 className="text-4xl font-bold mb-2">Business Intelligence</h2>
              <p className="text-muted-foreground text-lg">Ask questions about your business in plain English</p>
            </div>

            <Stats />

            <div className="fade-in">
              <QueryInterface onQuerySubmit={handleQuerySubmit} onLoadingChange={setIsLoadingCharts} />
            </div>

            {isQueryExecuted && lastQuestion && (
              <div className="glass p-4 border-l-2 border-accent chart-animation">
                <p className="text-sm">
                  <span className="text-accent font-semibold">Your Question:</span>
                  <span className="ml-2 text-foreground">{lastQuestion}</span>
                </p>
                {dashboardData?.insight && (
                  <p className="text-xs text-muted-foreground mt-1">💡 {dashboardData.insight}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {isLoadingCharts ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : dashboardData?.charts ? (
                dashboardData.charts.map((chart) => (
                  <DynamicChart key={chart.id} chart={chart} />
                ))
              ) : (
                <div className="col-span-3 text-center py-16 text-muted-foreground">
                  <p className="text-lg">Ask a question above to generate your dashboard ✨</p>
                  <p className="text-sm mt-2">Try: "Show me monthly revenue for 2024"</p>
                </div>
              )}
            </div>

            {dashboardData && (
              <div className="glass rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  💬 Chat with your Dashboard
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                    placeholder="Ask a follow-up... e.g. Now filter this to only show North region"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent transition-all"
                  />
                  <button
                    onClick={handleFollowUp}
                    disabled={!followUpQuestion.trim() || isLoadingCharts}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-all"
                  >
                    {isLoadingCharts ? '...' : 'Ask'}
                  </button>
                </div>
                {chatHistory.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {chatHistory.map((item, index) => (
                      <p key={index} className="text-xs text-white/40">💬 {item}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="h-8"></div>
          </div>
        </main>
      </div>
    </div>
  );
}