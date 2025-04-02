import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileHeader from '@/components/layout/MobileHeader';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SummaryCards from '@/components/dashboard/SummaryCards';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import WebsiteBreakdown from '@/components/dashboard/WebsiteBreakdown';
import ProjectionChart from '@/components/dashboard/ProjectionChart';
import FocusMode from '@/components/dashboard/FocusMode';

export default function Dashboard() {
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
            {/* Dashboard header with tracking toggle */}
            <DashboardHeader />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Summary cards */}
              <SummaryCards />
              
              {/* Weekly chart */}
              <WeeklyChart />
              
              {/* Website breakdown and projections */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
                <WebsiteBreakdown />
                <ProjectionChart />
              </div>
              
              {/* Focus mode section */}
              <FocusMode />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
