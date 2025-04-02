import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileHeader from '@/components/layout/MobileHeader';
import { useTimeTrack } from '@/contexts/TimeTrackContext';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export default function Analytics() {
  const { topSites } = useTimeTrack();
  const [timeRange, setTimeRange] = useState('week');
  
  // Format minutes to hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <MobileHeader />
        
        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <h1 className="text-2xl font-semibold text-neutral-900">Analytics</h1>
                
                {/* Time range selector */}
                <div className="mt-3 md:mt-0">
                  <select 
                    className="form-select text-sm rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="day">Today</option>
                    <option value="week">This week</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
                  </select>
                </div>
              </div>
              
              {/* Analytics content */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category breakdown */}
                <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-neutral-900 mb-6">Usage by category</h2>
                  <div className="h-80">
                    {/* This would be a pie chart or bar chart */}
                    <div className="flex items-center justify-center h-full">
                      <p className="text-neutral-500">Category breakdown chart would go here</p>
                    </div>
                  </div>
                </div>
                
                {/* Time trends */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-neutral-900 mb-6">Usage trends</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Average daily usage:</span>
                      <span className="text-sm font-medium">3h 45m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Most active day:</span>
                      <span className="text-sm font-medium">Wednesday</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Most active time:</span>
                      <span className="text-sm font-medium">2pm - 5pm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Longest streak:</span>
                      <span className="text-sm font-medium">4h 12m</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Detailed website breakdown */}
              <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-neutral-900 mb-6">Detailed website breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Website
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Total time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          % of total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {topSites.map((site) => (
                        <tr key={site.domain}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                            {site.domain}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            Entertainment
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 font-mono">
                            {formatTime(site.time)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            {site.percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={site.trend > 0 ? 'text-warning' : site.trend < 0 ? 'text-secondary' : 'text-neutral-500'}>
                              {site.trend > 0 ? '+' : ''}{site.trend}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Export data section */}
              <div className="mt-8 bg-white shadow rounded-lg p-6">
                <div className="md:flex md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-neutral-900">Export your data</h2>
                    <p className="mt-1 text-sm text-neutral-500">Download your usage data for personal analysis</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-3">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md shadow-sm text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <span className="material-icons mr-2 text-sm">download</span>
                      CSV
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md shadow-sm text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <span className="material-icons mr-2 text-sm">download</span>
                      JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
