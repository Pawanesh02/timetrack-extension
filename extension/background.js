// TimeTrack - Background Script
// This script runs in the background and tracks website usage

// Global variables
let currentTab = null;
let startTime = null;
let isTracking = true;
let focusModeActive = false;
let blockedDomains = [];
let settings = {
  focusDuration: 25,
  breakDuration: 5,
  autoStartBreaks: false,
  autoStartSessions: false,
  trackingEnabled: true
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('TimeTrack extension installed');
  
  // Set default settings
  chrome.storage.local.set({
    isTracking: true,
    focusModeActive: false,
    blockedDomains: [],
    settings: settings,
    visits: [],
    focusSessions: []
  });
  
  // Create alarm for periodic data saving
  chrome.alarms.create('saveData', { periodInMinutes: 1 });
});

// Listen for tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!isTracking) return;
  
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    handleTabChange(tab);
  } catch (error) {
    console.error('Error getting tab info:', error);
  }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!isTracking || changeInfo.status !== 'complete') return;
  
  if (tab.active) {
    handleTabChange(tab);
  }
});

// Handle tab changes and record time
async function handleTabChange(tab) {
  // Check if tab has a URL (not new tab page, etc.)
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    return;
  }
  
  const now = new Date();
  
  // If there's a current tab being tracked, log the visit
  if (currentTab && startTime) {
    const duration = Math.floor((now - startTime) / 1000); // Duration in seconds
    
    if (duration > 1) { // Only log if spent more than 1 second on the site
      logVisit(currentTab, startTime, now, duration);
    }
  }
  
  // Check if we're in focus mode and if this domain is blocked
  const url = new URL(tab.url);
  const domain = url.hostname;
  
  if (focusModeActive && blockedDomains.includes(domain)) {
    // This site is blocked - redirect to the focus mode page
    chrome.tabs.update(tab.id, { url: chrome.runtime.getURL('focus-mode.html') });
    return;
  }
  
  // Update current tab and start time
  currentTab = tab;
  startTime = now;
}

// Log a website visit
function logVisit(tab, start, end, duration) {
  try {
    const url = new URL(tab.url);
    const domain = url.hostname;
    
    const visit = {
      domain: domain,
      url: tab.url,
      title: tab.title,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration: duration
    };
    
    // Add to local storage
    chrome.storage.local.get(['visits'], (result) => {
      const visits = result.visits || [];
      visits.push(visit);
      chrome.storage.local.set({ visits: visits });
    });
    
  } catch (error) {
    console.error('Error logging visit:', error);
  }
}

// Toggle tracking on/off
function toggleTracking(enabled) {
  isTracking = enabled;
  
  chrome.storage.local.set({ isTracking: enabled });
  
  if (enabled) {
    // Resume tracking with current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        handleTabChange(tabs[0]);
      }
    });
  } else {
    // Stop tracking current tab
    if (currentTab && startTime) {
      const now = new Date();
      const duration = Math.floor((now - startTime) / 1000);
      
      if (duration > 1) {
        logVisit(currentTab, startTime, now, duration);
      }
      
      currentTab = null;
      startTime = null;
    }
  }
}

// Start focus mode
function startFocusMode(duration) {
  focusModeActive = true;
  chrome.storage.local.set({ focusModeActive: true });
  
  // Create a new focus session
  const now = new Date();
  const session = {
    id: Date.now(),
    startTime: now.toISOString(),
    endTime: null,
    duration: duration * 60, // Convert minutes to seconds
    completed: false
  };
  
  // Add to storage
  chrome.storage.local.get(['focusSessions'], (result) => {
    const sessions = result.focusSessions || [];
    sessions.push(session);
    chrome.storage.local.set({ focusSessions: sessions });
  });
  
  // Create alarm to end focus mode
  chrome.alarms.create('endFocusMode', { delayInMinutes: duration });
  
  // Check all open tabs and redirect if they're blocked
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        try {
          const url = new URL(tab.url);
          const domain = url.hostname;
          
          if (blockedDomains.includes(domain)) {
            chrome.tabs.update(tab.id, { url: chrome.runtime.getURL('focus-mode.html') });
          }
        } catch (error) {
          console.error('Error checking tab:', error);
        }
      }
    });
  });
  
  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.svg',
    title: 'Focus Mode Started',
    message: `Focus mode active for ${duration} minutes. Stay productive!`,
    priority: 2
  });
}

// End focus mode
function endFocusMode() {
  focusModeActive = false;
  chrome.storage.local.set({ focusModeActive: false });
  
  // Update the current focus session
  chrome.storage.local.get(['focusSessions'], (result) => {
    const sessions = result.focusSessions || [];
    
    // Find the most recent session
    if (sessions.length > 0) {
      const lastSession = sessions[sessions.length - 1];
      
      if (!lastSession.endTime) {
        lastSession.endTime = new Date().toISOString();
        lastSession.completed = true;
        
        chrome.storage.local.set({ focusSessions: sessions });
      }
    }
  });
  
  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.svg',
    title: 'Focus Mode Ended',
    message: 'Great job! Your focus session is complete.',
    priority: 2
  });
}

// Add a blocked website
function addBlockedWebsite(domain) {
  chrome.storage.local.get(['blockedDomains'], (result) => {
    const domains = result.blockedDomains || [];
    
    if (!domains.includes(domain)) {
      domains.push(domain);
      blockedDomains = domains;
      chrome.storage.local.set({ blockedDomains: domains });
    }
  });
}

// Remove a blocked website
function removeBlockedWebsite(domain) {
  chrome.storage.local.get(['blockedDomains'], (result) => {
    const domains = result.blockedDomains || [];
    const index = domains.indexOf(domain);
    
    if (index !== -1) {
      domains.splice(index, 1);
      blockedDomains = domains;
      chrome.storage.local.set({ blockedDomains: domains });
    }
  });
}

// Update settings
function updateSettings(newSettings) {
  settings = { ...settings, ...newSettings };
  chrome.storage.local.set({ settings: settings });
}

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'endFocusMode') {
    endFocusMode();
    
    // If auto-start breaks is enabled, create an alarm for the break
    if (settings.autoStartBreaks) {
      chrome.alarms.create('endBreak', { delayInMinutes: settings.breakDuration });
      
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.svg',
        title: 'Break Started',
        message: `Time for a ${settings.breakDuration} minute break!`,
        priority: 2
      });
    }
  } else if (alarm.name === 'endBreak') {
    // If auto-start sessions is enabled, start another focus session
    if (settings.autoStartSessions) {
      startFocusMode(settings.focusDuration);
    } else {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.svg',
        title: 'Break Ended',
        message: 'Break time is over. Ready for another focus session?',
        priority: 2
      });
    }
  }
});

// Listen for messages from the UI
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getStatus':
      sendResponse({
        isTracking: isTracking,
        focusModeActive: focusModeActive,
        settings: settings
      });
      break;
    
    case 'toggleTracking':
      toggleTracking(request.enabled);
      sendResponse({ success: true });
      break;
    
    case 'startFocusMode':
      startFocusMode(request.duration || settings.focusDuration);
      sendResponse({ success: true });
      break;
    
    case 'endFocusMode':
      endFocusMode();
      sendResponse({ success: true });
      break;
    
    case 'addBlockedWebsite':
      addBlockedWebsite(request.domain);
      sendResponse({ success: true });
      break;
    
    case 'removeBlockedWebsite':
      removeBlockedWebsite(request.domain);
      sendResponse({ success: true });
      break;
    
    case 'updateSettings':
      updateSettings(request.settings);
      sendResponse({ success: true });
      break;
    
    default:
      sendResponse({ error: 'Unknown action' });
  }
  
  return true; // Keep the messaging channel open for async responses
});

// Load data when the background script starts
chrome.storage.local.get(['isTracking', 'focusModeActive', 'blockedDomains', 'settings'], (result) => {
  if (result.isTracking !== undefined) isTracking = result.isTracking;
  if (result.focusModeActive !== undefined) focusModeActive = result.focusModeActive;
  if (result.blockedDomains) blockedDomains = result.blockedDomains;
  if (result.settings) settings = result.settings;
});