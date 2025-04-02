import { getDomain } from './time-utils';

/**
 * Types for website visit data
 */
export type WebsiteVisit = {
  id?: number;
  url: string;
  domain: string;
  title: string;
  category?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
};

/**
 * Types for focus session data
 */
export type FocusSession = {
  id?: number;
  startTime: Date;
  endTime?: Date | null;
  duration: number; // in minutes
  completed: boolean;
};

/**
 * Type for blocked website data
 */
export type BlockedWebsite = {
  id?: number;
  domain: string;
};

/**
 * Type for settings data
 */
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

/**
 * Categorize a website based on its domain
 */
function categorizeWebsite(domain: string): string {
  const categories: Record<string, string[]> = {
    "Entertainment": ["youtube", "netflix", "twitch", "tiktok", "vimeo", "spotify", "hulu", "disney"],
    "Social Media": ["facebook", "twitter", "instagram", "linkedin", "reddit", "pinterest", "snapchat", "tiktok"],
    "Productivity": ["gmail", "outlook", "notion", "trello", "asana", "slack", "zoom", "docs.google", "office"],
    "Shopping": ["amazon", "ebay", "etsy", "walmart", "target", "bestbuy", "aliexpress", "shopify"],
    "News": ["cnn", "bbc", "nytimes", "theguardian", "reuters", "bloomberg", "wsj", "medium"],
    "Development": ["github", "stackoverflow", "gitlab", "bitbucket", "codepen", "replit", "vercel", "netlify"]
  };
  
  for (const [category, domains] of Object.entries(categories)) {
    if (domains.some(d => domain.includes(d))) {
      return category;
    }
  }
  
  return "Uncategorized";
}

/**
 * Store a website visit in local storage
 */
export async function storeVisit(visit: Omit<WebsiteVisit, 'id' | 'category'>): Promise<WebsiteVisit> {
  // Add category
  const visitWithCategory = {
    ...visit,
    category: categorizeWebsite(visit.domain)
  };
  
  // Get current visits from storage
  const visits = await getWebsiteVisits();
  
  // Generate ID
  const id = visits.length ? Math.max(...visits.map(v => v.id || 0)) + 1 : 1;
  const newVisit = { ...visitWithCategory, id };
  
  // Add to storage
  visits.push(newVisit);
  
  // Apply storage limits
  const settings = await getSettings();
  const storageLimit = settings.dataSettings?.storageLimit || 90; // Default to 90 days
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - storageLimit);
  
  // Filter out visits older than the limit
  const filteredVisits = visits.filter(v => new Date(v.startTime) >= limitDate);
  
  // Save to storage
  localStorage.setItem('websiteVisits', JSON.stringify(filteredVisits));
  
  // Post to server if available
  try {
    fetch('/api/website-visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVisit)
    });
  } catch (error) {
    console.log('Unable to connect to server, storing locally only');
  }
  
  return newVisit;
}

/**
 * Get all website visits from storage
 */
export async function getWebsiteVisits(): Promise<WebsiteVisit[]> {
  try {
    // Try fetching from server first
    const response = await fetch('/api/website-visits');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Unable to fetch from server, using local storage');
  }
  
  // Fall back to local storage
  const visitsJson = localStorage.getItem('websiteVisits');
  if (!visitsJson) return [];
  
  try {
    const visits = JSON.parse(visitsJson);
    
    // Ensure dates are Date objects
    return visits.map((visit: any) => ({
      ...visit,
      startTime: new Date(visit.startTime),
      endTime: new Date(visit.endTime)
    }));
  } catch (error) {
    console.error('Error parsing website visits:', error);
    return [];
  }
}

/**
 * Get website data for analytics
 */
export async function getWebsiteData(period: 'day' | 'week' | 'month' | 'year' = 'day'): Promise<WebsiteVisit[]> {
  const visits = await getWebsiteVisits();
  
  // Filter by period
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'year':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
  }
  
  return visits.filter(visit => new Date(visit.startTime) >= startDate);
}

/**
 * Store a focus session
 */
export async function storeFocusSession(session: Omit<FocusSession, 'id'>): Promise<FocusSession> {
  // Get current sessions
  const sessions = await getFocusSessions();
  
  // Generate ID
  const id = sessions.length ? Math.max(...sessions.map(s => s.id || 0)) + 1 : 1;
  const newSession = { ...session, id };
  
  // Add to storage
  sessions.push(newSession);
  localStorage.setItem('focusSessions', JSON.stringify(sessions));
  
  // Post to server if available
  try {
    fetch('/api/focus-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession)
    });
  } catch (error) {
    console.log('Unable to connect to server, storing locally only');
  }
  
  return newSession;
}

/**
 * Complete a focus session
 */
export async function completeFocusSession(id: number, completed: boolean = true): Promise<FocusSession | null> {
  const sessions = await getFocusSessions();
  const sessionIndex = sessions.findIndex(s => s.id === id);
  
  if (sessionIndex === -1) return null;
  
  // Update the session
  const session = sessions[sessionIndex];
  const updatedSession = {
    ...session,
    endTime: new Date(),
    completed
  };
  
  // Save to storage
  sessions[sessionIndex] = updatedSession;
  localStorage.setItem('focusSessions', JSON.stringify(sessions));
  
  // Update on server if available
  try {
    fetch(`/api/focus-sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed, endTime: updatedSession.endTime })
    });
  } catch (error) {
    console.log('Unable to connect to server, updating locally only');
  }
  
  return updatedSession;
}

/**
 * Get all focus sessions
 */
export async function getFocusSessions(): Promise<FocusSession[]> {
  try {
    // Try fetching from server first
    const response = await fetch('/api/focus-sessions');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Unable to fetch from server, using local storage');
  }
  
  // Fall back to local storage
  const sessionsJson = localStorage.getItem('focusSessions');
  if (!sessionsJson) return [];
  
  try {
    const sessions = JSON.parse(sessionsJson);
    
    // Ensure dates are Date objects
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : null
    }));
  } catch (error) {
    console.error('Error parsing focus sessions:', error);
    return [];
  }
}

/**
 * Add a blocked website
 */
export async function addBlockedWebsite(domain: string): Promise<BlockedWebsite> {
  // Normalize the domain
  domain = domain.toLowerCase().trim();
  if (domain.startsWith('www.')) {
    domain = domain.substring(4);
  }
  
  // Get current blocked websites
  const blockedSites = await getBlockedWebsites();
  
  // Check if already exists
  if (blockedSites.some(site => site.domain === domain)) {
    throw new Error(`${domain} is already blocked`);
  }
  
  // Generate ID
  const id = blockedSites.length ? Math.max(...blockedSites.map(s => s.id || 0)) + 1 : 1;
  const newSite = { domain, id };
  
  // Add to storage
  blockedSites.push(newSite);
  localStorage.setItem('blockedWebsites', JSON.stringify(blockedSites));
  
  // Post to server if available
  try {
    fetch('/api/blocked-websites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSite)
    });
  } catch (error) {
    console.log('Unable to connect to server, storing locally only');
  }
  
  return newSite;
}

/**
 * Remove a blocked website
 */
export async function removeBlockedWebsite(id: number): Promise<boolean> {
  const blockedSites = await getBlockedWebsites();
  const updatedSites = blockedSites.filter(site => site.id !== id);
  
  if (updatedSites.length === blockedSites.length) {
    return false; // No site was removed
  }
  
  // Save to storage
  localStorage.setItem('blockedWebsites', JSON.stringify(updatedSites));
  
  // Delete from server if available
  try {
    fetch(`/api/blocked-websites/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.log('Unable to connect to server, updating locally only');
  }
  
  return true;
}

/**
 * Get all blocked websites
 */
export async function getBlockedWebsites(): Promise<BlockedWebsite[]> {
  try {
    // Try fetching from server first
    const response = await fetch('/api/blocked-websites');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Unable to fetch from server, using local storage');
  }
  
  // Fall back to local storage
  const sitesJson = localStorage.getItem('blockedWebsites');
  if (!sitesJson) return [];
  
  try {
    return JSON.parse(sitesJson);
  } catch (error) {
    console.error('Error parsing blocked websites:', error);
    return [];
  }
}

/**
 * Get settings
 */
export async function getSettings(): Promise<Settings> {
  try {
    // Try fetching from server first
    const response = await fetch('/api/settings');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Unable to fetch from server, using local storage');
  }
  
  // Fall back to local storage
  const settingsJson = localStorage.getItem('settings');
  if (!settingsJson) {
    // Default settings
    return {
      startTracking: true,
      showNotifications: true,
      startOnBoot: true,
      dataSettings: {
        storageLimit: 90,
        autoDelete: 30
      }
    };
  }
  
  try {
    return JSON.parse(settingsJson);
  } catch (error) {
    console.error('Error parsing settings:', error);
    return {
      startTracking: true,
      showNotifications: true,
      startOnBoot: true
    };
  }
}

/**
 * Update settings
 */
export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const currentSettings = await getSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  
  // Save to storage
  localStorage.setItem('settings', JSON.stringify(updatedSettings));
  
  // Update on server if available
  try {
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSettings)
    });
  } catch (error) {
    console.log('Unable to connect to server, updating locally only');
  }
  
  return updatedSettings;
}

/**
 * Clear all data
 */
export async function clearAllData(): Promise<boolean> {
  try {
    // Clear local storage data
    localStorage.removeItem('websiteVisits');
    localStorage.removeItem('focusSessions');
    localStorage.removeItem('blockedWebsites');
    
    // Keep settings
    
    // Clear server data if available
    try {
      await fetch('/api/data/clear', { method: 'DELETE' });
    } catch (error) {
      console.log('Unable to connect to server, clearing local data only');
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}
