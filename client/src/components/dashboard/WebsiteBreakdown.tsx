import React, { useState } from 'react';
import { useTimeTrack } from '@/contexts/TimeTrackContext';

export default function WebsiteBreakdown() {
  const { topSites } = useTimeTrack();
  const [timeFrame, setTimeFrame] = useState('today');
  
  // Format minutes to hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };
  
  // Get the first letter of the domain for the icon
  const getDomainFirstLetter = (domain: string): string => {
    return domain.charAt(0).toUpperCase();
  };
  
  // Determine the trend indicator
  const getTrendIndicator = (trend: number) => {
    if (trend > 0) {
      return (
        <div className="flex items-center">
          <span className="text-sm text-warning">+{trend}%</span>
          <span className="material-icons ml-1 text-warning text-sm">arrow_upward</span>
        </div>
      );
    } else if (trend < 0) {
      return (
        <div className="flex items-center">
          <span className="text-sm text-secondary">{trend}%</span>
          <span className="material-icons ml-1 text-secondary text-sm">arrow_downward</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <span className="text-sm text-neutral-500">0%</span>
          <span className="material-icons ml-1 text-neutral-500 text-sm">remove</span>
        </div>
      );
    }
  };
  
  // Assign a category to each website (this would be user-defined or AI-categorized in a real app)
  const getCategory = (domain: string): string => {
    const categories: Record<string, string> = {
      'youtube.com': 'Entertainment & Media',
      'github.com': 'Productivity',
      'twitter.com': 'Social Media',
      'google.com': 'Search & Research',
      'facebook.com': 'Social Media',
      'reddit.com': 'Social Media',
      'netflix.com': 'Entertainment & Media',
      'linkedin.com': 'Professional',
      'amazon.com': 'Shopping',
      'stackoverflow.com': 'Productivity',
    };
    
    return categories[domain] || 'Other';
  };
  
  // Handle time frame change
  const handleTimeFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFrame(e.target.value);
  };
  
  return (
    <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-neutral-900">Top websites</h2>
        <div>
          <select 
            className="form-select text-sm rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
            value={timeFrame}
            onChange={handleTimeFrameChange}
          >
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flow-root">
          {topSites.length > 0 ? (
            <ul className="-my-5 divide-y divide-neutral-200">
              {topSites.map((site, index) => (
                <li key={site.domain} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-neutral-100">
                        <span className="text-lg font-semibold text-neutral-700">
                          {getDomainFirstLetter(site.domain)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-neutral-900">{site.domain}</h3>
                        <p className="text-xs text-neutral-500">{getCategory(site.domain)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-5 text-right">
                        <p className="text-sm font-medium text-neutral-900 font-mono">{formatTime(site.time)}</p>
                        <p className="text-xs text-neutral-500">{site.percentage}% of {timeFrame}</p>
                      </div>
                      {getTrendIndicator(site.trend)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">No tracking data available yet.</p>
              <p className="text-sm text-neutral-400 mt-1">Start browsing to collect data.</p>
            </div>
          )}
        </div>
        {topSites.length > 0 && (
          <div className="mt-6">
            <a href="/analytics" className="text-sm font-medium text-primary hover:text-primary-600 flex items-center justify-center">
              View all websites
              <span className="material-icons ml-1 text-sm">chevron_right</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
