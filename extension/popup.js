// TimeTrack - Popup JavaScript
// This script handles the popup UI interactions

// State variables
let isTracking = true;
let focusModeActive = false;
let focusTimer = null;
let remainingTime = 0;
let settings = {
  focusDuration: 25,
  breakDuration: 5
};

// DOM elements
const trackingToggle = document.getElementById('tracking-toggle');
const totalTimeElement = document.getElementById('total-time');
const topSiteElement = document.getElementById('top-site');
const focusModeStatus = document.getElementById('focus-mode-status');
const focusModeInactive = document.getElementById('focus-mode-inactive');
const focusModeActive = document.getElementById('focus-mode-active');
const focusDurationSelect = document.getElementById('focus-duration');
const startFocusButton = document.getElementById('start-focus');
const endFocusButton = document.getElementById('end-focus');
const focusTimerElement = document.getElementById('focus-timer');
const openDashboardLink = document.getElementById('open-dashboard');
const navButtons = {
  home: document.getElementById('nav-home'),
  blocked: document.getElementById('nav-blocked'),
  stats: document.getElementById('nav-stats'),
  settings: document.getElementById('nav-settings')
};

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
  // Load initial state
  loadState();
  
  // Update usage statistics
  updateUsageStats();
  
  // Set up event listeners
  setupEventListeners();
});

// Load the current state from storage
function loadState() {
  chrome.storage.local.get(['isTracking', 'focusModeActive', 'settings', 'focusEndTime'], (result) => {
    // Update tracking state
    isTracking = result.isTracking !== undefined ? result.isTracking : true;
    trackingToggle.checked = isTracking;
    
    // Update focus mode state
    focusModeActive = result.focusModeActive || false;
    updateFocusModeUI();
    
    // Update settings
    if (result.settings) {
      settings = result.settings;
    }
    
    // Update focus timer if active
    if (focusModeActive && result.focusEndTime) {
      const now = new Date().getTime();
      const endTime = new Date(result.focusEndTime).getTime();
      
      if (endTime > now) {
        remainingTime = Math.floor((endTime - now) / 1000);
        startFocusTimer();
      } else {
        // Focus session should have ended, but wasn't updated
        endFocusMode();
      }
    }
  });
}

// Update usage statistics
function updateUsageStats() {
  chrome.storage.local.get(['visits'], (result) => {
    const visits = result.visits || [];
    
    // Filter for today's visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayVisits = visits.filter(visit => {
      const visitDate = new Date(visit.startTime);
      return visitDate >= today;
    });
    
    // Calculate total time
    const totalTimeSeconds = todayVisits.reduce((total, visit) => total + (visit.duration || 0), 0);
    totalTimeElement.textContent = formatTime(totalTimeSeconds);
    
    // Calculate top site
    if (todayVisits.length > 0) {
      const sitesMap = {};
      
      todayVisits.forEach(visit => {
        if (!sitesMap[visit.domain]) {
          sitesMap[visit.domain] = 0;
        }
        sitesMap[visit.domain] += visit.duration || 0;
      });
      
      let topSite = null;
      let topTime = 0;
      
      Object.entries(sitesMap).forEach(([domain, time]) => {
        if (time > topTime) {
          topSite = domain;
          topTime = time;
        }
      });
      
      if (topSite) {
        topSiteElement.textContent = `${topSite} (${formatTime(topTime)})`;
      } else {
        topSiteElement.textContent = 'No data yet';
      }
    } else {
      totalTimeElement.textContent = '0m';
      topSiteElement.textContent = 'No data yet';
    }
  });
}

// Set up event listeners
function setupEventListeners() {
  // Tracking toggle
  trackingToggle.addEventListener('change', () => {
    isTracking = trackingToggle.checked;
    chrome.runtime.sendMessage({
      action: 'toggleTracking',
      enabled: isTracking
    });
  });
  
  // Start focus mode
  startFocusButton.addEventListener('click', () => {
    const duration = parseInt(focusDurationSelect.value, 10);
    startFocusMode(duration);
  });
  
  // End focus mode
  endFocusButton.addEventListener('click', () => {
    endFocusMode();
  });
  
  // Open dashboard
  openDashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  });
  
  // Navigation buttons
  Object.entries(navButtons).forEach(([page, button]) => {
    button.addEventListener('click', () => {
      navigateTo(page);
    });
  });
}

// Update the focus mode UI based on current state
function updateFocusModeUI() {
  if (focusModeActive) {
    focusModeStatus.textContent = 'Active';
    focusModeStatus.style.backgroundColor = '#dcfce7';
    focusModeStatus.style.color = '#166534';
    focusModeInactive.style.display = 'none';
    focusModeActive.style.display = 'block';
  } else {
    focusModeStatus.textContent = 'Inactive';
    focusModeStatus.style.backgroundColor = '#f3f4f6';
    focusModeStatus.style.color = '#4b5563';
    focusModeInactive.style.display = 'block';
    focusModeActive.style.display = 'none';
    
    // Reset the focus duration select to default
    focusDurationSelect.value = settings.focusDuration.toString();
  }
}

// Start focus mode
function startFocusMode(duration) {
  focusModeActive = true;
  
  // Calculate end time
  const now = new Date();
  const endTime = new Date(now.getTime() + duration * 60 * 1000);
  
  // Store in local storage
  chrome.storage.local.set({ 
    focusModeActive: true,
    focusEndTime: endTime.toISOString()
  });
  
  // Send message to background script
  chrome.runtime.sendMessage({
    action: 'startFocusMode',
    duration: duration
  });
  
  // Update UI
  updateFocusModeUI();
  
  // Start the timer
  remainingTime = duration * 60;
  startFocusTimer();
}

// End focus mode
function endFocusMode() {
  focusModeActive = false;
  
  // Update storage
  chrome.storage.local.set({ 
    focusModeActive: false,
    focusEndTime: null
  });
  
  // Send message to background script
  chrome.runtime.sendMessage({
    action: 'endFocusMode'
  });
  
  // Update UI
  updateFocusModeUI();
  
  // Stop the timer
  if (focusTimer) {
    clearInterval(focusTimer);
    focusTimer = null;
  }
}

// Start the focus timer
function startFocusTimer() {
  // Clear any existing timer
  if (focusTimer) {
    clearInterval(focusTimer);
  }
  
  // Update the timer display
  updateTimerDisplay();
  
  // Start a new interval
  focusTimer = setInterval(() => {
    remainingTime--;
    
    // Update the display
    updateTimerDisplay();
    
    // Check if the timer has ended
    if (remainingTime <= 0) {
      clearInterval(focusTimer);
      focusTimer = null;
      endFocusMode();
    }
  }, 1000);
}

// Update the timer display
function updateTimerDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  
  focusTimerElement.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
}

// Navigate to a page
function navigateTo(page) {
  // In a real extension, this would navigate between different views
  // For now, we'll just update the active button
  Object.values(navButtons).forEach(button => {
    button.classList.remove('active');
  });
  
  navButtons[page].classList.add('active');
  
  if (page === 'settings') {
    chrome.runtime.openOptionsPage();
  } else if (page !== 'home') {
    // For other pages, open them in a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL(`${page}.html`) });
  }
}

// Format time in seconds to a readable format
function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

// Pad a number with leading zero if needed
function padZero(num) {
  return num.toString().padStart(2, '0');
}