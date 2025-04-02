import React from 'react';
import { useTimeTrack } from '@/contexts/TimeTrackContext';

export default function ProjectionChart() {
  // This would be calculated from real data in a real implementation
  const projectionData = [
    { domain: 'youtube.com', hours: 245, percentage: 38, color: 'bg-warning' },
    { domain: 'github.com', hours: 153, percentage: 24, color: 'bg-primary' },
    { domain: 'twitter.com', hours: 129, percentage: 20, color: 'bg-secondary' },
  ];
  
  // Sample insights
  const insights = [
    {
      icon: 'insights',
      text: 'Reducing YouTube by 30min/day would save you 122 hours annually',
      color: 'text-primary'
    },
    {
      icon: 'trending_up',
      text: 'Social media usage has increased 18% in the last month',
      color: 'text-warning'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-neutral-900 mb-6">Yearly projections</h2>
      
      <div className="mb-6">
        <div className="bg-neutral-50 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-neutral-700">Annual usage projection</h3>
              <div className="mt-1 flex items-baseline">
                <p className="text-2xl font-semibold text-neutral-900 font-mono">642h</p>
                <p className="ml-2 flex items-baseline text-sm text-neutral-500">
                  <span>based on current patterns</span>
                </p>
              </div>
            </div>
            <button type="button" className="ml-4 bg-white rounded-full p-1" title="More information">
              <span className="material-icons text-neutral-400">info</span>
            </button>
          </div>
        </div>
        
        {/* Website projections */}
        <div className="space-y-4">
          {projectionData.map((site) => (
            <div key={site.domain} className="bg-neutral-50 rounded p-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{site.domain}</span>
                <span className="text-xs font-mono">{site.hours}h / year</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className={`${site.color} rounded-full h-2`} style={{ width: `${site.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Productivity insights */}
      <div className="pt-5 border-t border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-700 mb-3">Insights</h3>
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start space-x-3 mb-3">
            <span className={`material-icons ${insight.color} flex-shrink-0`}>{insight.icon}</span>
            <p className="text-sm text-neutral-600">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
