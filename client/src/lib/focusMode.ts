// This file simulates browser extension focus mode functionality

// Store focus mode state
let focusModeActive = false;
let blockedDomains: string[] = [];
let focusModeEndTime: Date | null = null;

// Start focus mode
export function startFocusMode(domains: string[], durationMinutes: number): void {
  // In a real extension, this would use browser.webRequest.onBeforeRequest to block sites
  focusModeActive = true;
  blockedDomains = domains;
  
  // Set end time
  const endTime = new Date();
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);
  focusModeEndTime = endTime;
  
  // Store in localStorage for persistence
  localStorage.setItem('timetrack_focus_active', 'true');
  localStorage.setItem('timetrack_focus_domains', JSON.stringify(domains));
  localStorage.setItem('timetrack_focus_end_time', endTime.toISOString());
  
  console.log(`Focus mode started for ${durationMinutes} minutes, blocking:`, domains);
}

// Stop focus mode
export function stopFocusMode(): void {
  // In a real extension, this would remove the blocking listener
  focusModeActive = false;
  blockedDomains = [];
  focusModeEndTime = null;
  
  // Clear localStorage
  localStorage.removeItem('timetrack_focus_active');
  localStorage.removeItem('timetrack_focus_domains');
  localStorage.removeItem('timetrack_focus_end_time');
  
  console.log('Focus mode stopped');
}

// Check if focus mode is active
export function isInFocusMode(): boolean {
  // Check localStorage first (for persistence across page reloads)
  const storedActive = localStorage.getItem('timetrack_focus_active');
  
  if (storedActive === 'true') {
    // Check if focus mode has expired
    const storedEndTime = localStorage.getItem('timetrack_focus_end_time');
    
    if (storedEndTime) {
      const endTime = new Date(storedEndTime);
      const now = new Date();
      
      if (now > endTime) {
        // Focus mode has expired, clean up
        stopFocusMode();
        return false;
      }
      
      // Sync with in-memory state
      focusModeActive = true;
      focusModeEndTime = endTime;
      
      const storedDomains = localStorage.getItem('timetrack_focus_domains');
      blockedDomains = storedDomains ? JSON.parse(storedDomains) : [];
      
      return true;
    }
  }
  
  return focusModeActive;
}

// Get remaining focus mode time in minutes
export function getRemainingFocusTime(): number {
  if (!isInFocusMode() || !focusModeEndTime) return 0;
  
  const now = new Date();
  const remaining = focusModeEndTime.getTime() - now.getTime();
  
  // Convert ms to minutes
  return Math.max(0, Math.floor(remaining / (1000 * 60)));
}

// Check if a domain is blocked
export function isDomainBlocked(domain: string): boolean {
  return isInFocusMode() && blockedDomains.includes(domain);
}

// Add domain to blocked list
export function addBlockedDomain(domain: string): void {
  if (!blockedDomains.includes(domain)) {
    blockedDomains.push(domain);
    
    // Update localStorage
    localStorage.setItem('timetrack_focus_domains', JSON.stringify(blockedDomains));
  }
}

// Remove domain from blocked list
export function removeBlockedDomain(domain: string): void {
  blockedDomains = blockedDomains.filter(d => d !== domain);
  
  // Update localStorage
  localStorage.setItem('timetrack_focus_domains', JSON.stringify(blockedDomains));
}

// Get all blocked domains
export function getBlockedDomains(): string[] {
  return [...blockedDomains];
}
