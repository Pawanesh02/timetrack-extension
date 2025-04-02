import React from 'react';
import { useTimeTrack } from '@/contexts/TimeTrackContext';

export default function SummaryCards() {
  const { todayUsage, todayVsYesterday, topSites, weeklyProjection, todayFocusSessions } = useTimeTrack();
  
  // Format minutes to hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };
  
  // Format weekly projection (in minutes)
  const formatWeeklyProjection = (minutes: number): string => {
    return formatTime(minutes);
  };
  
  // Get top site info
  const topSite = topSites && topSites.length > 0 ? topSites[0] : null;
  
  return (
    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total time today */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <span className="material-icons text-primary">schedule</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-neutral-500 truncate">Today's usage</dt>
                <dd>
                  <div className="text-lg font-semibold text-neutral-900 font-mono">
                    {formatTime(todayUsage)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-neutral-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <span className={`font-medium ${todayVsYesterday >= 0 ? 'text-warning' : 'text-secondary'}`}>
              {todayVsYesterday > 0 ? '+' : ''}{todayVsYesterday}% from yesterday
            </span>
          </div>
        </div>
      </div>

      {/* Most visited site */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
              <span className="material-icons text-secondary">star</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-neutral-500 truncate">Most visited</dt>
                <dd>
                  <div className="text-lg font-semibold text-neutral-900">
                    {topSite ? topSite.domain : 'No data yet'}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-neutral-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <span className="font-medium text-secondary">
              {topSite ? `${formatTime(topSite.time)} today` : 'Start tracking to see data'}
            </span>
          </div>
        </div>
      </div>

      {/* Weekly projection */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-warning-100 rounded-md p-3">
              <span className="material-icons text-warning">trending_up</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-neutral-500 truncate">Weekly projection</dt>
                <dd>
                  <div className="text-lg font-semibold text-neutral-900 font-mono">
                    {formatWeeklyProjection(weeklyProjection)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-neutral-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <span className="font-medium text-warning">
              +5.2% from last week
            </span>
          </div>
        </div>
      </div>

      {/* Focus sessions */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <span className="material-icons text-primary">do_not_disturb</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-neutral-500 truncate">Focus sessions</dt>
                <dd>
                  <div className="text-lg font-semibold text-neutral-900">{todayFocusSessions} today</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-neutral-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <a href="/focus" className="font-medium text-primary hover:text-primary-600 flex items-center">
              Start a focus session
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
