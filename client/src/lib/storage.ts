import { WebsiteVisit, FocusSession, BlockedWebsite, Settings } from '@shared/schema';

// This file provides utility functions for local storage operations
// In a real extension, these would interface with browser.storage API

const STORAGE_KEYS = {
  VISITS: 'timetrack_visits',
  FOCUS_SESSIONS: 'timetrack_focus_sessions',
  BLOCKED_WEBSITES: 'timetrack_blocked_websites',
  SETTINGS: 'timetrack_settings'
};

// Website Visits
export function saveVisit(visit: WebsiteVisit): void {
  const visits = getVisits();
  visits.push(visit);
  localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
}

export function updateVisit(id: number, updates: Partial<WebsiteVisit>): void {
  const visits = getVisits();
  const index = visits.findIndex(v => v.id === id);
  
  if (index >= 0) {
    visits[index] = { ...visits[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
  }
}

export function getVisits(): WebsiteVisit[] {
  const storedVisits = localStorage.getItem(STORAGE_KEYS.VISITS);
  return storedVisits ? JSON.parse(storedVisits) : [];
}

export function getVisitsByDomain(domain: string): WebsiteVisit[] {
  return getVisits().filter(visit => visit.domain === domain);
}

export function getVisitsByTimeRange(startTime: Date, endTime: Date): WebsiteVisit[] {
  return getVisits().filter(visit => {
    const visitStart = new Date(visit.startTime);
    const visitEnd = visit.endTime ? new Date(visit.endTime) : new Date();
    
    return visitStart >= startTime && visitEnd <= endTime;
  });
}

// Focus Sessions
export function saveFocusSession(session: FocusSession): void {
  const sessions = getFocusSessions();
  sessions.push(session);
  localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
}

export function updateFocusSession(id: number, updates: Partial<FocusSession>): void {
  const sessions = getFocusSessions();
  const index = sessions.findIndex(s => s.id === id);
  
  if (index >= 0) {
    sessions[index] = { ...sessions[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
  }
}

export function getFocusSessions(): FocusSession[] {
  const storedSessions = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
  return storedSessions ? JSON.parse(storedSessions) : [];
}

export function getFocusSessionsForToday(): FocusSession[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getFocusSessions().filter(session => {
    const sessionStart = new Date(session.startTime);
    return sessionStart >= today && sessionStart < tomorrow;
  });
}

// Blocked Websites
export function saveBlockedWebsite(website: BlockedWebsite): void {
  const websites = getBlockedWebsites();
  websites.push(website);
  localStorage.setItem(STORAGE_KEYS.BLOCKED_WEBSITES, JSON.stringify(websites));
}

export function removeBlockedWebsite(id: number): void {
  const websites = getBlockedWebsites();
  const filteredWebsites = websites.filter(w => w.id !== id);
  localStorage.setItem(STORAGE_KEYS.BLOCKED_WEBSITES, JSON.stringify(filteredWebsites));
}

export function getBlockedWebsites(): BlockedWebsite[] {
  const storedWebsites = localStorage.getItem(STORAGE_KEYS.BLOCKED_WEBSITES);
  return storedWebsites ? JSON.parse(storedWebsites) : [];
}

// Settings
export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getSettings(): Settings | null {
  const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return storedSettings ? JSON.parse(storedSettings) : null;
}

// Clear all data (for testing or user data reset)
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.VISITS);
  localStorage.removeItem(STORAGE_KEYS.FOCUS_SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.BLOCKED_WEBSITES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
