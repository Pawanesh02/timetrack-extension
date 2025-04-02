import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SummaryCards from "@/components/summary-cards";
import UsageChart from "@/components/usage-chart";
import TopWebsites from "@/components/top-websites";
import FocusModeSection from "@/components/focus-mode-section";
import ProjectionsSection from "@/components/projections-section";

type ViewPeriod = "Today" | "This Week" | "This Month" | "Custom Range";

export default function Dashboard() {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>("Today");

  // Fetch data for summary cards
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/summary", viewPeriod],
  });

  // Fetch data for charts
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["/api/chart", viewPeriod],
  });

  // Fetch top websites
  const { data: topWebsites, isLoading: sitesLoading } = useQuery({
    queryKey: ["/api/top-websites", viewPeriod],
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Summary Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-2xl font-semibold text-neutral-700 mb-2 md:mb-0">Your Website Usage Overview</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-500">View:</span>
            <div className="relative inline-block">
              <select 
                className="appearance-none bg-white border border-neutral-300 rounded-md py-2 pl-3 pr-8 text-sm leading-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={viewPeriod}
                onChange={(e) => setViewPeriod(e.target.value as ViewPeriod)}
              >
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>Custom Range</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <SummaryCards summaryData={summaryData} isLoading={summaryLoading} />
      </div>

      {/* Website Usage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-300 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-neutral-700">Daily Website Usage</h2>
            <div className="flex space-x-2">
              <button type="button" className="text-sm text-neutral-500 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button type="button" className="text-sm text-neutral-500 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>
          <UsageChart chartData={chartData} isLoading={chartLoading} />
        </div>

        <TopWebsites topWebsites={topWebsites} isLoading={sitesLoading} />
      </div>

      {/* Focus Mode & Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FocusModeSection />
        <ProjectionsSection />
      </div>
    </main>
  );
}
