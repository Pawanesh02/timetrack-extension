import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import UsageChart from "@/components/usage-chart";
import { formatTime } from "@/lib/time-utils";
import { ArrowUpRight, ArrowDownRight, Calendar, Clock, PieChart } from "lucide-react";

type ViewPeriod = "day" | "week" | "month" | "year";
type ChartType = "line" | "bar" | "pie";

export default function Analytics() {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>("week");
  const [chartType, setChartType] = useState<ChartType>("line");

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics", viewPeriod],
  });

  // Fetch category data
  const { data: categoryData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories", viewPeriod],
  });

  // Fetch trend data
  const { data: trendData, isLoading: trendsLoading } = useQuery({
    queryKey: ["/api/trends", viewPeriod],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-700">Analytics</h1>
          <p className="text-neutral-500 mt-1">Insights into your browsing patterns and habits</p>
        </div>
        <div className="mt-3 sm:mt-0">
          <Select value={viewPeriod} onValueChange={(value: ViewPeriod) => setViewPeriod(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Time</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-semibold mt-1">
                    {analyticsData?.totalTime ? formatTime(analyticsData.totalTime) : "0h 0m"}
                  </p>
                )}
              </div>
              <div className="bg-primary bg-opacity-10 rounded-full p-2">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
            {!isLoading && analyticsData?.totalTimeTrend && (
              <div className="flex items-center mt-2">
                {analyticsData.totalTimeTrend > 0 ? (
                  <>
                    <span className="text-sm text-danger flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> {analyticsData.totalTimeTrend}%
                    </span>
                    <span className="text-xs text-neutral-500 ml-2">vs. previous {viewPeriod}</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-success flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" /> {Math.abs(analyticsData.totalTimeTrend)}%
                    </span>
                    <span className="text-xs text-neutral-500 ml-2">vs. previous {viewPeriod}</span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Most Active Day</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-semibold mt-1">{analyticsData?.mostActiveDay || "N/A"}</p>
                )}
              </div>
              <div className="bg-amber-500 bg-opacity-10 rounded-full p-2">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            {!isLoading && analyticsData?.mostActiveDayTime && (
              <div className="flex items-center mt-2">
                <span className="text-sm text-neutral-700">{analyticsData.mostActiveDayTime}</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Top Category</p>
                {categoriesLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-semibold mt-1">{categoryData?.topCategory || "N/A"}</p>
                )}
              </div>
              <div className="bg-green-500 bg-opacity-10 rounded-full p-2">
                <PieChart className="h-5 w-5 text-green-500" />
              </div>
            </div>
            {!categoriesLoading && categoryData?.topCategoryTime && (
              <div className="flex items-center mt-2">
                <span className="text-sm text-neutral-700">{categoryData.topCategoryTime}</span>
                <span className="text-xs text-neutral-500 ml-2">({categoryData.topCategoryPercentage}%)</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Websites Visited</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-semibold mt-1">{analyticsData?.uniqueWebsites || 0}</p>
                )}
              </div>
              <div className="bg-indigo-500 bg-opacity-10 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
            </div>
            {!isLoading && analyticsData?.websitesTrend && (
              <div className="flex items-center mt-2">
                {analyticsData.websitesTrend > 0 ? (
                  <>
                    <span className="text-sm text-primary flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> {analyticsData.websitesTrend}%
                    </span>
                    <span className="text-xs text-neutral-500 ml-2">vs. previous {viewPeriod}</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-neutral-500 flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" /> {Math.abs(analyticsData.websitesTrend)}%
                    </span>
                    <span className="text-xs text-neutral-500 ml-2">vs. previous {viewPeriod}</span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Usage Trends</CardTitle>
              <div className="flex space-x-1">
                <Tabs defaultValue={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                  <TabsList>
                    <TabsTrigger value="line">Line</TabsTrigger>
                    <TabsTrigger value="bar">Bar</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <UsageChart chartData={trendData} isLoading={trendsLoading} chartType={chartType} height={300} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : categoryData?.categories?.length ? (
              <div className="space-y-4">
                {categoryData.categories.map((category, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 bg-${category.color}-500`}></div>
                        <span className="text-sm text-neutral-600">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium text-neutral-700">{category.time}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className={`bg-${category.color}-500 h-2 rounded-full`} 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-neutral-500">{category.percentage}% of total</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-neutral-500">No category data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Usage Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <UsageChart chartData={trendData?.hourly} isLoading={trendsLoading} chartType="bar" height={250} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : analyticsData?.timeline?.length ? (
              <div className="space-y-4">
                {analyticsData.timeline.map((item, i) => (
                  <div key={i} className="flex">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-${item.color}-100`}
                    >
                      <span className={`text-${item.color}-600 text-xs`}>{item.icon}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-700">{item.title}</div>
                      <div className="text-xs text-neutral-500">{item.time}</div>
                      <div className="text-xs text-neutral-500 mt-1">{item.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-neutral-500">No activity data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
