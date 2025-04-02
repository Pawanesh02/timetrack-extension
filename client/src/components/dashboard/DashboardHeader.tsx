import React from 'react';
import TrackingToggle from './TrackingToggle';
import { useTimeTrack } from '@/contexts/TimeTrackContext';

export default function DashboardHeader() {
  const { isTracking, toggleTracking } = useTimeTrack();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        
        {/* Status Badge */}
        <div className="mt-3 md:mt-0 flex items-center">
          <span className="text-sm mr-2">Tracking:</span>
          <TrackingToggle isActive={isTracking} onToggle={toggleTracking} />
          <div className="ml-4 flex items-center">
            {isTracking ? (
              <>
                <span className="material-icons text-secondary animate-pulse-slow">fiber_manual_record</span>
                <span className="ml-1 text-sm font-medium text-neutral-700">Active</span>
              </>
            ) : (
              <>
                <span className="material-icons text-neutral-400">fiber_manual_record</span>
                <span className="ml-1 text-sm font-medium text-neutral-700">Paused</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
