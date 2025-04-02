// This file simulates browser extension functionality for tracking website usage

// Get the current tab (simulated for web app, would use browser.tabs API in real extension)
export async function getCurrentTab(): Promise<{ url?: string; title?: string }> {
  // In a real extension, this would use browser.tabs.query({active: true, currentWindow: true})
  // For demo purposes, we'll return the current window location
  return {
    url: window.location.href,
    title: document.title
  };
}

// Start tracking website usage
export function startTracking(): void {
  // In a real extension, this would:
  // 1. Register listeners for tab changes
  // 2. Start tracking the active tab
  console.log('Tracking started');
  
  // For this demo, we'll store tracking state in localStorage
  localStorage.setItem('timetrack_tracking', 'true');
}

// Stop tracking website usage
export function stopTracking(): void {
  // In a real extension, this would:
  // 1. Unregister listeners for tab changes
  // 2. Stop tracking the active tab
  console.log('Tracking stopped');
  
  // For this demo, we'll store tracking state in localStorage
  localStorage.setItem('timetrack_tracking', 'false');
}

// Check if tracking is active
export function isTracking(): boolean {
  return localStorage.getItem('timetrack_tracking') === 'true';
}

// Log a website visit (for demo purposes)
export function logWebsiteVisit(domain: string, url: string, duration: number): void {
  const visits = getStoredVisits();
  visits.push({
    domain,
    url,
    startTime: new Date(Date.now() - duration * 1000),
    endTime: new Date(),
    duration
  });
  
  localStorage.setItem('timetrack_visits', JSON.stringify(visits));
}

// Get stored visits (for demo purposes)
export function getStoredVisits(): any[] {
  const storedVisits = localStorage.getItem('timetrack_visits');
  return storedVisits ? JSON.parse(storedVisits) : [];
}
