import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeDisplay } from "@/components/ui/time-display";
import { Clock, Globe, Calendar } from "lucide-react";

type SummaryData = {
  totalTime: number;
  totalTimeTrend: number;
  mostVisitedSite: {
    domain: string;
    time: number;
    percentage: number;
  };
  projectedAnnual: {
    time: number;
    trend: number;
  };
};

interface SummaryCardsProps {
  summaryData?: SummaryData;
  isLoading: boolean;
}

export default function SummaryCards({ summaryData, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-8 w-28 mt-2" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-center py-4">
            <p className="text-neutral-500 mb-2">No data available</p>
            <p className="text-sm text-neutral-400">Start browsing to collect data</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Time Today */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-500 mb-1">Total Time Today</h3>
            <p className="text-2xl font-semibold text-neutral-700">
              <TimeDisplay seconds={summaryData.totalTime} />
            </p>
          </div>
          <div className="bg-primary bg-opacity-10 rounded-full p-2">
            <Clock className="text-primary h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center">
          {summaryData.totalTimeTrend > 0 ? (
            <>
              <span className="text-sm text-success flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {summaryData.totalTimeTrend}%
              </span>
              <span className="text-xs text-neutral-500 ml-2">vs. yesterday</span>
            </>
          ) : (
            <>
              <span className="text-sm text-danger flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                {Math.abs(summaryData.totalTimeTrend)}%
              </span>
              <span className="text-xs text-neutral-500 ml-2">vs. yesterday</span>
            </>
          )}
        </div>
      </div>

      {/* Most Visited Site */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-500 mb-1">Most Visited Site</h3>
            <p className="text-2xl font-semibold text-neutral-700">{summaryData.mostVisitedSite.domain}</p>
          </div>
          <div className="bg-amber-500 bg-opacity-10 rounded-full p-2">
            <Globe className="text-amber-500 h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-neutral-700">
            <TimeDisplay seconds={summaryData.mostVisitedSite.time} />
          </span>
          <span className="text-xs text-neutral-500 ml-2">
            ({summaryData.mostVisitedSite.percentage}% of total time)
          </span>
        </div>
      </div>

      {/* Projected Annual Usage */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-500 mb-1">Projected Annual Usage</h3>
            <p className="text-2xl font-semibold text-neutral-700">
              <TimeDisplay seconds={summaryData.projectedAnnual.time} showSeconds={false} />
            </p>
          </div>
          <div className="bg-primaryDark bg-opacity-10 rounded-full p-2">
            <Calendar className="text-primaryDark h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center">
          {summaryData.projectedAnnual.trend > 0 ? (
            <>
              <span className="text-sm text-danger flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {summaryData.projectedAnnual.trend}%
              </span>
              <span className="text-xs text-neutral-500 ml-2">vs. previous 30 days</span>
            </>
          ) : (
            <>
              <span className="text-sm text-success flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                {Math.abs(summaryData.projectedAnnual.trend)}%
              </span>
              <span className="text-xs text-neutral-500 ml-2">vs. previous 30 days</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
