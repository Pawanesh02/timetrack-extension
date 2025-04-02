import { websiteVisits, focusSessions, blockedWebsites, users } from "@shared/schema";
import type { WebsiteVisit, FocusSession, BlockedWebsite, InsertWebsiteVisit, InsertFocusSession, InsertBlockedWebsite } from "@shared/schema";

// More detailed settings type
export type Settings = {
  startTracking: boolean;
  showNotifications: boolean;
  startOnBoot: boolean;
  focusMode?: {
    active: boolean;
    duration: number;
    blockedWebsites: string[];
  };
  dataSettings?: {
    storageLimit: number;
    autoDelete: number;
  };
};

// Interface for storage operations
export interface IStorage {
  // User methods (existing)
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Website visits
  getWebsiteVisits(): Promise<WebsiteVisit[]>;
  getWebsiteVisitsByPeriod(period: string, previous?: boolean): Promise<WebsiteVisit[]>;
  getPreviousPeriodVisits(period: string): Promise<WebsiteVisit[]>;
  createWebsiteVisit(visit: InsertWebsiteVisit): Promise<WebsiteVisit>;
  
  // Focus sessions
  getFocusSessions(): Promise<FocusSession[]>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: number, data: Partial<FocusSession>): Promise<FocusSession | null>;
  
  // Blocked websites
  getBlockedWebsites(): Promise<BlockedWebsite[]>;
  createBlockedWebsite(website: InsertBlockedWebsite): Promise<BlockedWebsite>;
  deleteBlockedWebsite(id: number): Promise<boolean>;
  
  // Settings
  getSettings(): Promise<Settings | null>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
  
  // Analytics
  getChartData(period: string): Promise<any>;
  getTopWebsites(period: string, limit: number): Promise<any[]>;
  getProjections(): Promise<any>;
  getAnalytics(period: string): Promise<any>;
  getCategoriesData(period: string): Promise<any>;
  getTrendsData(period: string): Promise<any>;
  
  // Data management
  clearAllData(): Promise<void>;
  exportData(): Promise<any>;
}

// Memory-based storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private visits: Map<number, WebsiteVisit>;
  private sessions: Map<number, FocusSession>;
  private blockedSites: Map<number, BlockedWebsite>;
  private settings: Settings | null;
  
  currentUserId: number;
  currentVisitId: number;
  currentSessionId: number;
  currentBlockedSiteId: number;

  constructor() {
    this.users = new Map();
    this.visits = new Map();
    this.sessions = new Map();
    this.blockedSites = new Map();
    this.settings = {
      startTracking: true,
      showNotifications: true,
      startOnBoot: true,
      dataSettings: {
        storageLimit: 90,
        autoDelete: 30
      }
    };
    
    this.currentUserId = 1;
    this.currentVisitId = 1;
    this.currentSessionId = 1;
    this.currentBlockedSiteId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  // User methods (existing)
  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Website visits
  async getWebsiteVisits(): Promise<WebsiteVisit[]> {
    return Array.from(this.visits.values());
  }
  
  async getWebsiteVisitsByPeriod(period: string, previous: boolean = false): Promise<WebsiteVisit[]> {
    const visits = Array.from(this.visits.values());
    const now = new Date();
    let startDate = new Date();
    
    if (previous) {
      // For previous period
      if (period === 'day') {
        startDate.setDate(now.getDate() - 2);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        return visits.filter(v => 
          new Date(v.startTime) >= startDate && 
          new Date(v.startTime) < endDate
        );
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - now.getDay() - 7);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        return visits.filter(v => 
          new Date(v.startTime) >= startDate && 
          new Date(v.startTime) < endDate
        );
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        return visits.filter(v => 
          new Date(v.startTime) >= startDate && 
          new Date(v.startTime) < endDate
        );
      }
    } else {
      // For current period
      if (period === 'day') {
        startDate.setHours(0, 0, 0, 0);
        return visits.filter(v => new Date(v.startTime) >= startDate);
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        return visits.filter(v => new Date(v.startTime) >= startDate);
      } else if (period === 'month') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        return visits.filter(v => new Date(v.startTime) >= startDate);
      } else if (period === 'year') {
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        return visits.filter(v => new Date(v.startTime) >= startDate);
      }
    }
    
    return visits;
  }
  
  async getPreviousPeriodVisits(period: string): Promise<WebsiteVisit[]> {
    return this.getWebsiteVisitsByPeriod(period, true);
  }
  
  async createWebsiteVisit(visitData: InsertWebsiteVisit): Promise<WebsiteVisit> {
    const id = this.currentVisitId++;
    const visit: WebsiteVisit = { ...visitData, id };
    this.visits.set(id, visit);
    return visit;
  }
  
  // Focus sessions
  async getFocusSessions(): Promise<FocusSession[]> {
    return Array.from(this.sessions.values());
  }
  
  async createFocusSession(sessionData: InsertFocusSession): Promise<FocusSession> {
    const id = this.currentSessionId++;
    const session: FocusSession = { 
      ...sessionData, 
      id, 
      endTime: null,
      completed: false 
    };
    this.sessions.set(id, session);
    return session;
  }
  
  async updateFocusSession(id: number, data: Partial<FocusSession>): Promise<FocusSession | null> {
    const session = this.sessions.get(id);
    if (!session) return null;
    
    const updatedSession = { ...session, ...data };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // Blocked websites
  async getBlockedWebsites(): Promise<BlockedWebsite[]> {
    return Array.from(this.blockedSites.values());
  }
  
  async createBlockedWebsite(websiteData: InsertBlockedWebsite): Promise<BlockedWebsite> {
    const id = this.currentBlockedSiteId++;
    const website: BlockedWebsite = { ...websiteData, id };
    this.blockedSites.set(id, website);
    return website;
  }
  
  async deleteBlockedWebsite(id: number): Promise<boolean> {
    if (!this.blockedSites.has(id)) return false;
    return this.blockedSites.delete(id);
  }
  
  // Settings
  async getSettings(): Promise<Settings | null> {
    return this.settings;
  }
  
  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    this.settings = { ...this.settings, ...settings } as Settings;
    return this.settings;
  }
  
  // Analytics
  async getChartData(period: string): Promise<any> {
    const visits = await this.getWebsiteVisitsByPeriod(period);
    
    // Create chart labels based on period
    const labels: string[] = [];
    const now = new Date();
    
    if (period === 'day') {
      // Hourly labels
      for (let i = 0; i < 24; i++) {
        labels.push(`${i}:00`);
      }
    } else if (period === 'week') {
      // Day of week labels
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7; i++) {
        labels.push(days[i]);
      }
    } else if (period === 'month') {
      // Day of month labels
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        labels.push(`${i}`);
      }
    }
    
    // Group by category
    const categories = ['Entertainment', 'Social Media', 'Productivity'];
    const categoryData: Record<string, number[]> = {};
    
    categories.forEach(category => {
      categoryData[category] = Array(labels.length).fill(0);
    });
    
    // Add "Other" category
    categoryData['Other'] = Array(labels.length).fill(0);
    
    // Populate category data
    visits.forEach(visit => {
      let category = visit.category || 'Uncategorized';
      if (!categories.includes(category)) {
        category = 'Other';
      }
      
      const date = new Date(visit.startTime);
      let index = 0;
      
      if (period === 'day') {
        index = date.getHours();
      } else if (period === 'week') {
        index = date.getDay();
      } else if (period === 'month') {
        index = date.getDate() - 1;
      }
      
      if (index >= 0 && index < labels.length) {
        categoryData[category][index] += visit.duration / 60; // Convert to minutes
      }
    });
    
    // Create datasets
    const datasets = Object.keys(categoryData).map(category => {
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
        data: categoryData[category],
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
  
  async getTopWebsites(period: string, limit: number): Promise<any[]> {
    const visits = await this.getWebsiteVisitsByPeriod(period);
    
    // Group by domain
    const domainMap: Record<string, {
      domain: string;
      time: number;
      category: string;
      color?: string;
    }> = {};
    
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
    
    visits.forEach(visit => {
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
      .map((site, index) => ({
        ...site,
        color: colorMap[site.category] || "gray",
        id: index + 1 // Simple ID for demo
      }));
    
    return websites;
  }
  
  async getProjections(): Promise<any> {
    const monthVisits = await this.getWebsiteVisitsByPeriod('month');
    const previousMonthVisits = await this.getPreviousPeriodVisits('month');
    
    // Get top domains
    const domainMap: Record<string, {
      domain: string;
      time: number;
      category: string;
    }> = {};
    
    monthVisits.forEach(visit => {
      if (!domainMap[visit.domain]) {
        domainMap[visit.domain] = {
          domain: visit.domain,
          time: 0,
          category: visit.category || "Uncategorized"
        };
      }
      domainMap[visit.domain].time += visit.duration;
    });
    
    // Get top 3 domains
    const topDomains = Object.entries(domainMap)
      .sort((a, b) => b[1].time - a[1].time)
      .slice(0, 3)
      .map(([domain, data]) => domain);
    
    // Calculate daily averages
    const dailyAverages: Record<string, number> = {};
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    topDomains.forEach(domain => {
      const domainVisits = monthVisits.filter(visit => visit.domain === domain);
      const totalTime = domainVisits.reduce((total, visit) => total + visit.duration, 0);
      dailyAverages[domain] = totalTime / daysInMonth;
    });
    
    // Calculate trends
    const trends: Record<string, number> = {};
    
    topDomains.forEach(domain => {
      const currentVisits = monthVisits.filter(visit => visit.domain === domain);
      const previousVisits = previousMonthVisits.filter(visit => visit.domain === domain);
      
      const currentTotal = currentVisits.reduce((total, visit) => total + visit.duration, 0);
      const previousTotal = previousVisits.reduce((total, visit) => total + visit.duration, 0);
      
      trends[domain] = previousTotal === 0 ? 0 : 
        Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
    });
    
    // Prepare websites data
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
    
    const websites = topDomains.map(domain => {
      const category = domainMap[domain].category;
      return {
        domain,
        color: colorMap[category] || "gray",
        annualTime: dailyAverages[domain] * 365,
        dailyTime: dailyAverages[domain],
        trend: trends[domain]
      };
    });
    
    // Calculate potential time savings
    const socialMediaAndEntertainment = monthVisits.filter(
      v => v.category === 'Social Media' || v.category === 'Entertainment'
    );
    
    const totalTargetTime = socialMediaAndEntertainment.reduce(
      (total, visit) => total + visit.duration, 0
    );
    
    const timeSavings = {
      potential: Math.round(totalTargetTime * 0.25 * 365), // 25% reduction, annualized
      percentage: 25
    };
    
    return {
      websites,
      timeSavings
    };
  }
  
  async getAnalytics(period: string): Promise<any> {
    const visits = await this.getWebsiteVisitsByPeriod(period);
    const previousVisits = await this.getPreviousPeriodVisits(period);
    
    // Calculate total time
    const totalTime = visits.reduce((total, visit) => total + visit.duration, 0);
    const previousTotal = previousVisits.reduce((total, visit) => total + visit.duration, 0);
    const totalTimeTrend = previousTotal === 0 ? 0 : 
      Math.round(((totalTime - previousTotal) / previousTotal) * 100);
    
    // Find most active day
    const dayMap: Record<string, number> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    visits.forEach(visit => {
      const date = new Date(visit.startTime);
      const day = dayNames[date.getDay()];
      if (!dayMap[day]) {
        dayMap[day] = 0;
      }
      dayMap[day] += visit.duration;
    });
    
    const mostActiveDay = Object.entries(dayMap)
      .sort((a, b) => b[1] - a[1])
      .map(([day]) => day)[0] || 'N/A';
    
    const mostActiveDayTime = dayMap[mostActiveDay] ? 
      this.formatTime(dayMap[mostActiveDay]) : 'N/A';
    
    // Count unique websites
    const uniqueDomains = new Set(visits.map(v => v.domain));
    const uniqueWebsites = uniqueDomains.size;
    
    // Calculate website trend
    const previousUniqueDomains = new Set(previousVisits.map(v => v.domain));
    const previousUniqueWebsites = previousUniqueDomains.size;
    
    const websitesTrend = previousUniqueWebsites === 0 ? 0 :
      Math.round(((uniqueWebsites - previousUniqueWebsites) / previousUniqueWebsites) * 100);
    
    // Create a simple activity timeline
    const timeline = visits
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5)
      .map(visit => {
        const startTime = new Date(visit.startTime);
        return {
          title: visit.domain,
          time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: this.formatTime(visit.duration),
          icon: visit.domain.substring(0, 2).toUpperCase(),
          color: visit.category === 'Entertainment' ? 'red' : 
                 visit.category === 'Social Media' ? 'blue' :
                 visit.category === 'Productivity' ? 'green' : 'gray'
        };
      });
    
    return {
      totalTime,
      totalTimeTrend,
      mostActiveDay,
      mostActiveDayTime,
      uniqueWebsites,
      websitesTrend,
      timeline
    };
  }
  
  async getCategoriesData(period: string): Promise<any> {
    const visits = await this.getWebsiteVisitsByPeriod(period);
    
    // Group by category
    const categoryMap: Record<string, number> = {};
    
    visits.forEach(visit => {
      const category = visit.category || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += visit.duration;
    });
    
    // Calculate total time
    const totalTime = Object.values(categoryMap).reduce((total, time) => total + time, 0);
    
    // Sort categories by time
    const sortedCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1]);
    
    // Get top category
    const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'N/A';
    const topCategoryTime = sortedCategories.length > 0 ? this.formatTime(sortedCategories[0][1]) : 'N/A';
    const topCategoryPercentage = sortedCategories.length > 0 && totalTime > 0 ? 
      Math.round((sortedCategories[0][1] / totalTime) * 100) : 0;
    
    // Create categories data for chart
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
    
    const categories = sortedCategories.map(([category, time]) => ({
      name: category,
      time: this.formatTime(time),
      percentage: totalTime > 0 ? Math.round((time / totalTime) * 100) : 0,
      color: colorMap[category] || "gray"
    }));
    
    return {
      topCategory,
      topCategoryTime,
      topCategoryPercentage,
      categories
    };
  }
  
  async getTrendsData(period: string): Promise<any> {
    // Get chart data
    const chartData = await this.getChartData(period);
    
    // Create hourly usage pattern data for analytics page
    const hourlyLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const visits = await this.getWebsiteVisitsByPeriod('day');
    
    // Group by hour
    const hourlyData: number[] = Array(24).fill(0);
    
    visits.forEach(visit => {
      const hour = new Date(visit.startTime).getHours();
      hourlyData[hour] += visit.duration / 60; // Convert to minutes
    });
    
    const hourlyDataset = {
      label: 'Hourly Usage',
      data: hourlyData,
      backgroundColor: 'rgba(79, 129, 232, 0.6)',
      borderColor: 'rgba(79, 129, 232, 1)',
      borderWidth: 1
    };
    
    return {
      ...chartData,
      hourly: {
        labels: hourlyLabels,
        datasets: [hourlyDataset]
      }
    };
  }
  
  // Data management
  async clearAllData(): Promise<void> {
    this.visits.clear();
    this.sessions.clear();
    this.currentVisitId = 1;
    this.currentSessionId = 1;
    
    // Don't clear blocked websites and settings
  }
  
  async exportData(): Promise<any> {
    return {
      visits: Array.from(this.visits.values()),
      sessions: Array.from(this.sessions.values()),
      blockedWebsites: Array.from(this.blockedSites.values()),
      settings: this.settings
    };
  }
  
  // Helper methods
  private formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    } else {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      return `${days}d ${hours}h`;
    }
  }
  
  // Initialize with sample data for testing
  private initializeSampleData() {
    // Sample categories
    const categories = ['Entertainment', 'Social Media', 'Productivity', 'Development', 'News'];
    
    // Sample domains by category
    const domainsByCategory: Record<string, string[]> = {
      'Entertainment': ['youtube.com', 'netflix.com', 'twitch.tv'],
      'Social Media': ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com'],
      'Productivity': ['gmail.com', 'outlook.com', 'notion.so', 'trello.com'],
      'Development': ['github.com', 'stackoverflow.com', 'replit.com'],
      'News': ['cnn.com', 'bbc.com', 'nytimes.com']
    };
    
    // Generate sample visits for the past month
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - 1);
    
    let visitId = 1;
    
    while (startDate <= now) {
      // Generate 3-8 visits per day
      const visitsPerDay = 3 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < visitsPerDay; i++) {
        // Pick a random category
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        // Pick a random domain from the category
        const domains = domainsByCategory[category];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        
        // Generate visit duration (5-120 minutes in seconds)
        const duration = (5 + Math.floor(Math.random() * 116)) * 60;
        
        // Generate visit start time
        const visitDate = new Date(startDate);
        visitDate.setHours(9 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
        
        // Create end time
        const endDate = new Date(visitDate);
        endDate.setSeconds(endDate.getSeconds() + duration);
        
        // Create visit
        const visit: WebsiteVisit = {
          id: visitId++,
          url: `https://${domain}/some-path`,
          domain,
          title: `Page on ${domain}`,
          category,
          startTime: visitDate,
          endTime: endDate,
          duration
        };
        
        this.visits.set(visit.id, visit);
      }
      
      // Move to next day
      startDate.setDate(startDate.getDate() + 1);
    }
    
    // Sample focus sessions
    const sessionStatuses = [true, true, false]; // 2/3 completed, 1/3 interrupted
    
    for (let i = 0; i < 5; i++) {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - i);
      sessionDate.setHours(10 + i, 0, 0, 0);
      
      const duration = [25, 45, 60][Math.floor(Math.random() * 3)];
      const completed = sessionStatuses[Math.floor(Math.random() * sessionStatuses.length)];
      
      const endDate = completed ? new Date(sessionDate.getTime() + duration * 60 * 1000) : null;
      
      const session: FocusSession = {
        id: i + 1,
        startTime: sessionDate,
        endTime,
        duration,
        completed
      };
      
      this.sessions.set(session.id, session);
    }
    
    // Sample blocked websites
    const blockedDomains = ['facebook.com', 'youtube.com', 'twitter.com', 'instagram.com'];
    
    blockedDomains.forEach((domain, index) => {
      const blockedSite: BlockedWebsite = {
        id: index + 1,
        domain,
        userId: 1
      };
      
      this.blockedSites.set(blockedSite.id, blockedSite);
    });
    
    this.currentVisitId = visitId;
    this.currentSessionId = 6;
    this.currentBlockedSiteId = 5;
  }
}

export const storage = new MemStorage();
