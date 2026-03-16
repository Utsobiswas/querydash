# Business Insights - Natural Language BI Dashboard

A modern, dark-themed business intelligence dashboard built with Next.js, React, and Recharts. Business Insights lets executives ask questions about their business in plain English and instantly see visual analytics—no SQL knowledge required.

## Features

- **Natural Language Interface**: Ask questions like "Show me monthly sales by region" without any technical knowledge
- **Dark Enterprise Theme**: Professional dark interface with glassmorphism effects and smooth animations
- **Business Analytics**: Key KPI metrics including revenue, growth, customer count, and average order value
- **Multi-Chart Visualizations**: Line charts, bar charts, and pie charts for comprehensive business insights
- **Recent Questions Sidebar**: Quick access to previous business questions with timestamps
- **Responsive Design**: Fully responsive layout that adapts seamlessly to mobile, tablet, and desktop screens
- **Performance Optimized**: Efficient rendering with smooth animations and loading states

## Dashboard Components

### Navbar
- Sticky navigation with Business Insights branding
- Mobile menu toggle
- Data sync status indicator
- Settings access

### Sidebar
- Recent questions with timestamps
- Smooth slide-in/out animations
- Mobile-optimized drawer
- Easy question replay

### Business KPI Stats Cards
- **Total Revenue**: $792K (+18.5% vs last year)
- **YTD Growth**: +24.2% (+8.3% vs prior period)
- **Total Customers**: 1,547 (+142 new this month)
- **Average Order Value**: $512 (+6.2% improvement)

### Natural Language Query Interface
- Plain English text input for business questions
- "Generate Dashboard" button with blue-purple gradient
- Example questions for quick templates
- Question display showing what generated current charts

### Chart Visualizations
- **Monthly Revenue**: Line chart showing 2024 revenue trend (Jan-Dec)
- **Sales by Region**: Bar chart comparing North, South, East, West performance
- **Revenue by Category**: Pie chart breaking down Software, Services, Hardware, Consulting

## Business Metrics

The dashboard showcases key business metrics that executives care about:
- Monthly and yearly revenue trends
- Regional sales performance
- Product category breakdown
- Customer growth metrics
- Order value trends

## Color Scheme

The dashboard uses a carefully selected color palette optimized for dark mode:

- **Background**: Very dark navy (`#0a0a0f`)
- **Cards**: Slightly lighter navy (`#12121a`)
- **Primary Accent**: Vibrant blue (`hsl(210, 85%, 55%)`)
- **Secondary Accent**: Cyan/Teal (`hsl(180, 100%, 50%)`)
- **Gradient Button**: Blue to purple to teal (`from-primary via-purple-500 to-accent`)
- **Text**: Off-white (`#f8f8fa`)
- **Borders**: Subtle white overlays with low opacity

## Animations

All components feature smooth, performance-optimized animations:

- **Fade-in**: Components slide in from below with fade effect (0.5s)
- **Chart Animation**: Charts slide up on mount (0.6s)
- **Shimmer**: Loading skeletons with pulsing effect
- **Pulse**: Subtle breathing animation on status indicators

## Layout & Responsive Design

The dashboard uses a flexible grid system:

- **Mobile**: Single-column layout with hamburger menu sidebar
- **Tablet**: Two-column grid for charts
- **Desktop**: 3-column layout for charts with full-width KPI grid at top

All components use Tailwind CSS with flexbox for layouts and responsive prefixes (`md:`, `lg:`) for breakpoint-specific styling.

## Technology Stack

- **Framework**: Next.js 16+ with App Router
- **Styling**: Tailwind CSS with custom animations
- **Charts**: Recharts with custom dark theme configuration
- **Icons**: Lucide React (no SQL icons visible)
- **State Management**: React hooks (useState)
- **Animations**: CSS keyframes with custom utilities

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Customization

### Colors
Edit the CSS variables in `app/globals.css` under the `.dark` class to customize the color scheme.

### Business Data
Business metrics and example questions are stored in `lib/mock-data.ts`. Update with your actual business data:
```typescript
export const mockChartData = {
  monthlyRevenue: [...],      // Update with your monthly revenue
  salesByRegion: [...],       // Update with your regional sales
  revenueByCategory: [...]    // Update with your product categories
}
```

### Business Questions
Add your own business questions to `exampleQuestions` in `lib/mock-data.ts`:
```typescript
export const exampleQuestions = [
  'Show me monthly sales trends',
  'Compare regional performance',
  // Add your questions here
]
```

### Components
All components are modular and business-focused:
- `components/navbar.tsx` - Business Insights branding
- `components/sidebar.tsx` - Recent questions history
- `components/query-interface.tsx` - Natural language input
- `components/requests-chart.tsx` - Revenue trends
- `components/transfer-chart.tsx` - Regional sales
- `components/cache-chart.tsx` - Category breakdown
- `components/stats.tsx` - Business KPIs

## Performance Considerations

- Charts use Recharts' built-in performance optimizations
- Loading states prevent UI blocking
- Animations use GPU-accelerated transforms
- Responsive images and lazy loading ready
- Component memoization for expensive renders

## Future Enhancements

- Backend integration for real business data
- AI-powered question interpretation
- Custom date range filters
- Export reports to PDF/Excel
- Dark/Light mode toggle
- User authentication and role-based access
- Saved custom dashboards
- Real-time data refresh

## License

Created with v0.app
