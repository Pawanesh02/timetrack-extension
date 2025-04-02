import { getWebsiteData } from './storage';
import { calculateSeconds, calculatePercentage, calculateTrend } from './time-utils';

/**
 * Types for projection data
 */
export type ProjectionWebsite = {
  domain: string;
  color: string;
  annualTime: number; // projected annual time in seconds
  dailyTime: number; // average daily time in seconds
  trend: number; // percentage change vs previous period
};

export type TimeSavings = {
  potential: number; // potential time savings in seconds
  percentage: number; // reduction percentage
};

export type ProjectionData = {
  websites: ProjectionWebsite[];
  timeSavings: TimeSavings;
};

/**
 * Color mapping for different website categories
 */
const colorMap: Record<string, string> = {
  "Entertainment": "red",
  "Social Media": "blue",
  "Productivity": "green",
  "Development": "gray",
  "Shopping": "amber",
  "News": "purple",
  "Education": "indigo",
  "Uncategorized": "neutral"
};

/**
 * Calculate a website's daily average usage
 */
export function calculateDailyAverage(visits: any[], domain: string): number {
  if (visits.length === 0) return 0;
  
  // Filter visits for the specific domain
  const domainVisits = visits.filter(visit => visit.domain === domain);
  
  if (domainVisits.length === 0) return 0;
  
  // Calculate total duration
  const totalDuration = domainVisits.reduce((total, visit) => total + visit.duration, 0);
  
  // Find the date range
  const startDates = domainVisits.map(visit => new Date(visit.startTime).getTime());
  const firstDate = new Date(Math.min(...startDates));
  const lastDate = new Date(Math.max(...startDates));
  
  // Calculate the number of days in the range
  const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Return the daily average in seconds
  return totalDuration / daysDiff;
}

/**
 * Calculate projected annual usage based on daily average
 */
export function calculateAnnualProjection(dailyAverage: number): number {
  return dailyAverage * 365; // Project to annual usage in seconds
}

/**
 * Calculate usage trend compared to previous period
 */
export function calculateUsageTrend(currentVisits: any[], previousVisits: any[], domain: string): number {
  const currentDomainVisits = currentVisits.filter(visit => visit.domain === domain);
  const previousDomainVisits = previousVisits.filter(visit => visit.domain === domain);
  
  const currentTotal = currentDomainVisits.reduce((total, visit) => total + visit.duration, 0);
  const previousTotal = previousDomainVisits.reduce((total, visit) => total + visit.duration, 0);
  
  return calculateTrend(currentTotal, previousTotal);
}

/**
 * Get top domains by usage
 */
export function getTopDomains(visits: any[], limit: number = 5): string[] {
  // Group visits by domain
  const domainMap: Record<string, number> = {};
  
  visits.forEach(visit => {
    if (!domainMap[visit.domain]) {
      domainMap[visit.domain] = 0;
    }
    domainMap[visit.domain] += visit.duration;
  });
  
  // Sort domains by total duration
  const sortedDomains = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1])
    .map(([domain]) => domain);
  
  return sortedDomains.slice(0, limit);
}

/**
 * Calculate potential time savings
 */
export function calculatePotentialSavings(visits: any[]): TimeSavings {
  // Focus on social media and entertainment categories
  const targetCategories = ["Social Media", "Entertainment"];
  const targetVisits = visits.filter(visit => targetCategories.includes(visit.category));
  
  if (targetVisits.length === 0) {
    return { potential: 0, percentage: 0 };
  }
  
  const totalTargetTime = targetVisits.reduce((total, visit) => total + visit.duration, 0);
  
  // Suggest a 25% reduction by default
  const reductionPercentage = 25;
  const potentialSavings = Math.floor(totalTargetTime * (reductionPercentage / 100));
  
  return {
    potential: potentialSavings * 365, // Annualized savings in seconds
    percentage: reductionPercentage
  };
}

/**
 * Get projection data for a specific time period
 */
export async function getProjectionData(): Promise<ProjectionData> {
  // Get current month's data
  const currentMonthData = await getWebsiteData('month');
  
  // Get previous month's data (for trend calculation)
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1);
  
  // Note: In a real extension, we'd have access to historical data
  // Here we're simulating by using a subset of current data
  const previousMonthData = currentMonthData.filter(visit => {
    const visitDate = new Date(visit.startTime);
    return visitDate.getMonth() === previousMonth.getMonth() && 
           visitDate.getFullYear() === previousMonth.getFullYear();
  });
  
  // Get top domains
  const topDomains = getTopDomains(currentMonthData, 3);
  
  // Calculate projections for each top domain
  const websites: ProjectionWebsite[] = topDomains.map(domain => {
    const domainVisits = currentMonthData.filter(visit => visit.domain === domain);
    const category = domainVisits[0]?.category || "Uncategorized";
    const color = colorMap[category] || "gray";
    
    const dailyTime = calculateDailyAverage(currentMonthData, domain);
    const annualTime = calculateAnnualProjection(dailyTime);
    const trend = calculateUsageTrend(currentMonthData, previousMonthData, domain);
    
    return {
      domain,
      color,
      annualTime,
      dailyTime,
      trend
    };
  });
  
  // Calculate potential time savings
  const timeSavings = calculatePotentialSavings(currentMonthData);
  
  return {
    websites,
    timeSavings
  };
}

/**
 * Get summary data for dashboard
 */
export async function getSummaryData() {
  // Get today's data
  const todayData = await getWebsiteData('day');
  
  // Get yesterday's data for comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Note: In a real extension, we'd have access to historical data
  // Here we're simulating by using a subset of current data
  const yesterdayData = todayData.filter(visit => {
    const visitDate = new Date(visit.startTime);
    return visitDate.getDate() === yesterday.getDate() && 
           visitDate.getMonth() === yesterday.getMonth() && 
           visitDate.getFullYear() === yesterday.getFullYear();
  });
  
  // Calculate total time today
  const totalTime = todayData.reduce((total, visit) => total + visit.duration, 0);
  const totalTimeYesterday = yesterdayData.reduce((total, visit) => total + visit.duration, 0);
  const totalTimeTrend = calculateTrend(totalTime, totalTimeYesterday);
  
  // Get most visited site
  const topDomains = getTopDomains(todayData, 1);
  const mostVisitedSite = topDomains[0] || '';
  
  const mostVisitedTime = todayData
    .filter(visit => visit.domain === mostVisitedSite)
    .reduce((total, visit) => total + visit.duration, 0);
  
  const mostVisitedPercentage = totalTime > 0 ? Math.round((mostVisitedTime / totalTime) * 100) : 0;
  
  // Calculate projected annual usage
  const monthData = await getWebsiteData('month');
  const dailyAverage = monthData.length > 0 
    ? monthData.reduce((total, visit) => total + visit.duration, 0) / 30
    : totalTime;
  
  const projectedAnnual = dailyAverage * 365;
  
  // Get previous month data for trend
  const previousMonthAverage = dailyAverage * 0.92; // Simulated value for demo
  const projectionTrend = calculateTrend(dailyAverage, previousMonthAverage);
  
  return {
    totalTime,
    totalTimeTrend,
    mostVisitedSite: {
      domain: mostVisitedSite,
      time: mostVisitedTime,
      percentage: mostVisitedPercentage
    },
    projectedAnnual: {
      time: projectedAnnual,
      trend: projectionTrend
    }
  };
}

/**
 * Get chart data for usage visualization
 */
export async function getChartData(period: 'day' | 'week' | 'month' = 'week') {
  const data = await getWebsiteData(period);
  
  // Group data by category
  const categoryMap: Record<string, number[]> = {};
  const labels: string[] = [];
  
  // Generate labels based on period
  const now = new Date();
  
  if (period === 'day') {
    // Hourly labels
    for (let i = 0; i < 24; i++) {
      labels.push(`${i}:00`);
    }
  } else if (period === 'week') {
    // Day of week labels
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = now.getDay();
    for (let i = 0; i < 7; i++) {
      const dayIndex = (today - 6 + i + 7) % 7;
      labels.push(days[dayIndex]);
    }
  } else if (period === 'month') {
    // Day of month labels
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      labels.push(`${i}`);
    }
  }
  
  // Initialize datasets for main categories
  const categories = ['Entertainment', 'Social Media', 'Productivity'];
  categories.forEach(category => {
    categoryMap[category] = Array(labels.length).fill(0);
  });
  
  // Populate category data
  data.forEach(visit => {
    let category = visit.category || "Uncategorized";
    if (!categories.includes(category)) {
      category = "Other";
      if (!categoryMap[category]) {
        categoryMap[category] = Array(labels.length).fill(0);
      }
    }
    
    const date = new Date(visit.startTime);
    let index = 0;
    
    if (period === 'day') {
      index = date.getHours();
    } else if (period === 'week') {
      const today = now.getDay();
      index = (date.getDay() - today + 7) % 7;
    } else if (period === 'month') {
      index = date.getDate() - 1;
    }
    
    if (index >= 0 && index < labels.length) {
      categoryMap[category][index] += visit.duration / 60; // Convert to minutes
    }
  });
  
  // Create datasets
  const datasets = Object.entries(categoryMap).map(([category, data]) => {
    let color: string;
    
    switch (category) {
      case 'Entertainment':
        color = 'rgba(237, 100, 100, 1)';
        break;
      case 'Social Media':
        color = 'rgba(79, 129, 232, 1)';
        break;
      case 'Productivity':
        color = 'rgba(16, 124, 16, 1)';
        break;
      default:
        color = 'rgba(150, 150, 150, 1)';
    }
    
    return {
      label: category,
      data,
      backgroundColor: color.replace('1)', '0.2)'),
      borderColor: color,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 3
    };
  });
  
  return {
    labels,
    datasets
  };
}

/**
 * Get top websites data
 */
export async function getTopWebsites(period: 'day' | 'week' | 'month' = 'day', limit: number = 5) {
  const data = await getWebsiteData(period);
  
  // Group by domain
  const domainMap: Record<string, {
    domain: string;
    time: number;
    category: string;
    color?: string;
  }> = {};
  
  data.forEach(visit => {
    if (!domainMap[visit.domain]) {
      domainMap[visit.domain] = {
        domain: visit.domain,
        time: 0,
        category: visit.category || "Uncategorized"
      };
    }
    domainMap[visit.domain].time += visit.duration;
  });
  
  // Convert to array and sort
  const websites = Object.values(domainMap)
    .sort((a, b) => b.time - a.time)
    .slice(0, limit)
    .map(site => ({
      ...site,
      color: colorMap[site.category] || "gray",
      id: site.domain.hashCode() // Custom hashcode for demo
    }));
  
  return websites;
}

// Extension to add hashCode to strings (used for demo ID generation)
declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    hash = ((hash << 5) - hash) + this.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};
