import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { formatTime } from "@/lib/time-utils";

type ProjectionData = {
  websites: {
    domain: string;
    color: string;
    annualTime: number;
    dailyTime: number;
    trend: number;
  }[];
  timeSavings: {
    potential: number;
    percentage: number;
  };
};

export default function ProjectionsSection() {
  // Fetch projection data
  const { data: projectionData, isLoading } = useQuery<ProjectionData>({
    queryKey: ["/api/projections"],
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Usage Projections</CardTitle>
          <div className="relative inline-block has-tooltip">
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5 text-neutral-500" />
            </Button>
            <div className="custom-tooltip absolute z-10 -top-2 right-0 transform translate-y-full w-64 px-4 py-3 bg-neutral-700 text-white text-xs rounded shadow-lg">
              Usage projections show your estimated time spent on websites based on your current habits. Use this data to make more informed decisions about your online time.
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-700 mb-1 sm:mb-0">Projected Annual Usage</h3>
            <div className="flex items-center">
              <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-1 rounded">Based on last 30 days</span>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ) : projectionData && projectionData.websites.length > 0 ? (
            <div className="space-y-4">
              {projectionData.websites.map((site, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 bg-${site.color}-500 rounded-full mr-2`}></div>
                      <span className="text-sm text-neutral-600">{site.domain}</span>
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
                      {formatTime(site.annualTime, { showSeconds: false, compact: true })}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`bg-${site.color}-500 h-2 rounded-full`} 
                      style={{ width: `${Math.min(100, (site.annualTime / (365 * 24 * 60 * 60)) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-neutral-500">
                      Current: {formatTime(site.dailyTime, { showHours: true, showMinutes: true, compact: true })}/day
                    </span>
                    {site.trend > 0 ? (
                      <span className="text-xs text-danger flex items-center">
                        <ArrowUpIcon className="h-3 w-3 mr-1" /> {site.trend}% vs. last month
                      </span>
                    ) : (
                      <span className="text-xs text-success flex items-center">
                        <ArrowDownIcon className="h-3 w-3 mr-1" /> {Math.abs(site.trend)}% vs. last month
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-neutral-500">No projection data available</p>
              <p className="text-sm text-neutral-400 mt-2">Continue browsing to generate projections</p>
            </div>
          )}
        </div>

        {projectionData && projectionData.timeSavings && (
          <div>
            <h3 className="text-sm font-medium text-neutral-700 mb-3">Time Saved Insights</h3>
            <div className="bg-primary bg-opacity-5 border border-primary border-opacity-20 rounded-lg p-4">
              <div className="flex items-start mb-3">
                <div className="bg-primary bg-opacity-10 rounded-full p-2 mr-3">
                  <Clock className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Potential Time Savings</h4>
                  <p className="text-xs text-neutral-600">
                    Reducing your social media usage by {projectionData.timeSavings.percentage}% could save you{" "}
                    <span className="font-medium text-primary">
                      {formatTime(projectionData.timeSavings.potential, { showSeconds: false })}
                    </span>{" "}
                    annually.
                  </p>
                </div>
              </div>
              <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5 mb-3">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${projectionData.timeSavings.percentage}%` }}
                ></div>
              </div>
              <Button 
                variant="link" 
                className="text-primary text-xs font-medium hover:text-primaryDark p-0 h-auto"
              >
                Create a reduction goal
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
