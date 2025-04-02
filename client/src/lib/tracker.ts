import { getDomain } from './time-utils';
import { storeVisit, getWebsiteData, getSettings } from './storage';

let isTracking = false;
let currentTab: chrome.tabs.Tab | null = null;
let startTime: number | null = null;
let activeTimeout: NodeJS.Timeout | null = null;

/**
 * Initialize the tracker when the extension loads
 */
export function setupTracker() {
  // Check if we're in a browser extension environment
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    // Get tracking status from storage
    getSettings().then(settings => {
      if (settings?.startTracking) {
        startTracking();
      }
    });

    // Listen for tab changes
    chrome.tabs.onActivated.addListener(handleTabChange);
    
    // Listen for tab updates
    chrome.tabs.onUpdated.addListener(handleTabUpdate);
    
    // Listen for window focus changes
    chrome.windows.onFocusChanged.addListener(handleWindowFocusChange);
    
    // Check for browser closing to save final session
    window.addEventListener('beforeunload', recordCurrentSession);
  } else {
    console.log("Tracker initialized in development mode (not a browser extension)");
    
    // For development/testing purposes, simulate tracking with mock data
    isTracking = true;
  }
}

/**
 * Start tracking website usage
 */
export function startTracking() {
  if (isTracking) return;
  
  isTracking = true;
  
  // Get the current active tab
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        currentTab = tabs[0];
        startTime = Date.now();
      }
    });
  }
  
  return isTracking;
}

/**
 * Stop tracking website usage
 */
export function stopTracking() {
  if (!isTracking) return;
  
  // Record the current session before stopping
  recordCurrentSession();
  
  isTracking = false;
  currentTab = null;
  startTime = null;
  
  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }
  
  return !isTracking;
}

/**
 * Toggle tracking state
 */
export function toggleTracking() {
  return isTracking ? stopTracking() : startTracking();
}

/**
 * Get current tracking status
 */
export function getTrackingStatus() {
  return isTracking;
}

/**
 * Handle tab change event
 */
function handleTabChange(activeInfo: chrome.tabs.TabActiveInfo) {
  if (!isTracking) return;
  
  // Record current session
  recordCurrentSession();
  
  // Get info about the new tab
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    currentTab = tab;
    startTime = Date.now();
  });
}

/**
 * Handle tab update event
 */
function handleTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
  if (!isTracking || !currentTab || tabId !== currentTab.id) return;
  
  // If the URL has changed in the current tab, record the previous session
  if (changeInfo.url && currentTab.url !== changeInfo.url) {
    recordCurrentSession();
    
    // Update current tab info
    currentTab = tab;
    startTime = Date.now();
  }
}

/**
 * Handle window focus change
 */
function handleWindowFocusChange(windowId: number) {
  if (!isTracking) return;
  
  // When focus is lost (windowId === -1), record the current session
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    recordCurrentSession();
    currentTab = null;
    startTime = null;
  } else {
    // Focus gained, get the current active tab
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs.length > 0) {
        currentTab = tabs[0];
        startTime = Date.now();
      }
    });
  }
}

/**
 * Record the current browsing session
 */
function recordCurrentSession() {
  if (!isTracking || !currentTab || !startTime) return;
  
  const url = currentTab.url;
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    // Don't track Chrome internal pages
    return;
  }
  
  const endTime = Date.now();
  const duration = Math.floor((endTime - startTime) / 1000); // Convert to seconds
  
  if (duration < 1) {
    // Don't record sessions shorter than 1 second
    return;
  }
  
  const visit = {
    url,
    domain: getDomain(url),
    title: currentTab.title || '',
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    duration
  };
  
  // Store the visit
  storeVisit(visit);
  
  // Reset start time for the next session
  startTime = endTime;
}

/**
 * Check if a website is being blocked during focus mode
 */
export async function isWebsiteBlocked(url: string) {
  // Get the domain from the URL
  const domain = getDomain(url);
  
  // Get focus mode status and blocked websites
  const focusMode = await getSettings().then(settings => settings.focusMode);
  if (!focusMode || !focusMode.active) {
    return false;
  }
  
  // Check if the domain is in the blocked list
  return focusMode.blockedWebsites.some(
    (blockedSite: string) => domain.includes(blockedSite)
  );
}

/**
 * Apply focus mode to block websites
 */
export async function applyFocusMode(enabled: boolean, duration?: number) {
  if (typeof chrome === 'undefined' || !chrome.webRequest) {
    console.log("Focus mode requires browser extension APIs");
    return false;
  }
  
  if (enabled) {
    // Set up listener to block requests to blocked websites
    chrome.webRequest.onBeforeRequest.addListener(
      blockRequestHandler,
      { urls: ["<all_urls>"] },
      ["blocking"]
    );
    
    // Set up timer to disable focus mode after duration
    if (duration) {
      setTimeout(() => {
        applyFocusMode(false);
      }, duration * 60 * 1000); // Convert minutes to milliseconds
    }
    
    return true;
  } else {
    // Remove the listener
    if (chrome.webRequest.onBeforeRequest.hasListener(blockRequestHandler)) {
      chrome.webRequest.onBeforeRequest.removeListener(blockRequestHandler);
    }
    return false;
  }
}

/**
 * Handler for blocking web requests during focus mode
 */
async function blockRequestHandler(details: chrome.webRequest.WebRequestDetails) {
  const blocked = await isWebsiteBlocked(details.url);
  
  if (blocked) {
    // Redirect to a "site blocked" page
    return { 
      redirectUrl: chrome.runtime.getURL("blocked.html") 
    };
  }
  
  // Allow the request to proceed
  return { cancel: false };
}
