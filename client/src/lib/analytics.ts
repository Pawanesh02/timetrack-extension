import { WebsiteVisit, FocusSession } from '@shared/schema';

// Get total time spent today
export function getTotalTimeToday(visits: WebsiteVisit[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayVisits = visits.filter(visit => {
    const visitStart = new Date(visit.startTime);
    return visitStart >= today && visitStart < tomorrow;
  });
  
  return todayVisits.reduce((total, visit) => {
    const duration = visit.duration || 0;
    return total + (duration / 60); // Convert seconds to minutes
  }, 0);
}

// Get top websites by usage time
export function getTopWebsites(visits: WebsiteVisit[], limit: number = 10) {
  // Group visits by domain
  const domainMap: Record<string, { time: number; visits: WebsiteVisit[] }> = {};
  
  visits.forEach(visit => {
    if (!domainMap[visit.domain]) {
      domainMap[visit.domain] = { time: 0, visits: [] };
    }
    
    domainMap[visit.domain].time += (visit.duration || 0);
    domainMap[visit.domain].visits.push(visit);
  });
  
  // Convert to array and sort by time
  const domains = Object.keys(domainMap).map(domain => {
    const totalTime = domainMap[domain].time;
    const visits = domainMap[domain].visits;
    
    // Calculate trend (% change from yesterday)
    const trend = calculateTrend(domain, visits);
    
    // Calculate percentage of total time
    const percentage = calculatePercentage(totalTime, visits);
    
    return {
      domain,
      time: totalTime / 60, // Convert seconds to minutes
      percentage,
      trend
    };
  });
  
  // Sort by time (descending) and limit the results
  return domains
    .sort((a, b) => b.time - a.time)
    .slice(0, limit);
}

// Calculate trend (% change from yesterday)
function calculateTrend(domain: string, visits: WebsiteVisit[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayVisits = visits.filter(visit => {
    const visitStart = new Date(visit.startTime);
    return visitStart >= today;
  });
  
  const yesterdayVisits = visits.filter(visit => {
    const visitStart = new Date(visit.startTime);
    return visitStart >= yesterday && visitStart < today;
  });
  
  const todayTime = todayVisits.reduce((total, visit) => total + (visit.duration || 0), 0);
  const yesterdayTime = yesterdayVisits.reduce((total, visit) => total + (visit.duration || 0), 0);
  
  if (yesterdayTime === 0) return 0;
  
  return Math.round(((todayTime - yesterdayTime) / yesterdayTime) * 100);
}

// Calculate percentage of total time
function calculatePercentage(domainTime: number, allVisits: WebsiteVisit[]): number {
  const totalTime = allVisits.reduce((total, visit) => total + (visit.duration || 0), 0);
  
  if (totalTime === 0) return 0;
  
  return Math.round((domainTime / totalTime) * 100);
}

// Get daily usage for the past 7 days
export function getDailyUsage(visits: WebsiteVisit[]): { date: Date; time: number }[] {
  const result: { date: Date; time: number }[] = [];
  
  // Get the past 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Filter visits for this day
    const dayVisits = visits.filter(visit => {
      const visitStart = new Date(visit.startTime);
      return visitStart >= date && visitStart < nextDay;
    });
    
    // Calculate total time for this day
    const totalTime = dayVisits.reduce((total, visit) => total + (visit.duration || 0), 0);
    
    result.push({
      date,
      time: totalTime / 60 // Convert seconds to minutes
    });
  }
  
  return result;
}

// Calculate projections based on current usage patterns
export function calculateProjections(visits: WebsiteVisit[], days: number = 365): any {
  const topSites = getTopWebsites(visits);
  
  // Calculate average daily usage
  const dailyUsage = getDailyUsage(visits);
  const averageDailyMinutes = dailyUsage.reduce((total, day) => total + day.time, 0) / dailyUsage.length;
  
  // Project annually
  const projectedAnnualHours = (averageDailyMinutes * days) / 60;
  
  // Project for each top site
  const siteProjections = topSites.map(site => {
    const dailyAverage = site.time / dailyUsage.length;
    const annualProjection = (dailyAverage * days) / 60; // in hours
    
    return {
      domain: site.domain,
      dailyAverage,
      annualProjection,
      percentage: site.percentage
    };
  });
  
  return {
    totalProjection: projectedAnnualHours,
    siteProjections
  };
}

// Generate insights based on usage patterns
export function generateInsights(visits: WebsiteVisit[], focusSessions: FocusSession[]): string[] {
  const insights: string[] = [];
  const topSites = getTopWebsites(visits);
  
  // Check if top site usage is high
  if (topSites.length > 0 && topSites[0].time > 60) { // More than 1 hour per day
    insights.push(`Reducing ${topSites[0].domain} by 30min/day would save you ${Math.round((30 * 365) / 60)} hours annually`);
  }
  
  // Check for increasing trends
  const increasingSites = topSites.filter(site => site.trend > 10);
  if (increasingSites.length > 0) {
    insights.push(`${increasingSites[0].domain} usage has increased ${increasingSites[0].trend}% recently`);
  }
  
  // Check focus session effectiveness
  if (focusSessions.length > 0) {
    const completedSessions = focusSessions.filter(session => session.completed);
    const completionRate = Math.round((completedSessions.length / focusSessions.length) * 100);
    
    if (completionRate < 50) {
      insights.push(`Only ${completionRate}% of focus sessions completed - consider shorter sessions`);
    } else if (completionRate > 80) {
      insights.push(`Great job! ${completionRate}% of focus sessions completed`);
    }
  }
  
  return insights;
}
