export const mockChartData = {
  monthlyRevenue: [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
    { month: 'Jul', revenue: 72000 },
    { month: 'Aug', revenue: 68000 },
    { month: 'Sep', revenue: 75000 },
    { month: 'Oct', revenue: 78000 },
    { month: 'Nov', revenue: 82000 },
    { month: 'Dec', revenue: 89000 },
  ],
  salesByRegion: [
    { region: 'North', sales: 245000 },
    { region: 'South', sales: 198000 },
    { region: 'East', sales: 312000 },
    { region: 'West', sales: 287000 },
  ],
  revenueByCategory: [
    { name: 'Software', value: 35 },
    { name: 'Services', value: 28 },
    { name: 'Hardware', value: 22 },
    { name: 'Consulting', value: 15 },
  ],
};

export const queryHistory = [
  { id: 1, query: 'Show me monthly sales by region for Q3', timestamp: '2 min ago' },
  { id: 2, query: 'What are my top performing product categories?', timestamp: '15 min ago' },
  { id: 3, query: 'Compare Q2 vs Q3 revenue growth', timestamp: '1 hour ago' },
  { id: 4, query: 'Show regional breakdown for the last 90 days', timestamp: '3 hours ago' },
  { id: 5, query: 'What was my total revenue last month?', timestamp: '5 hours ago' },
];

export const exampleQuestions = [
  'Show me monthly sales by region',
  'What are my top performing products?',
  'Compare revenue growth quarter-over-quarter',
  'Show customer acquisition trends',
];
