// TimeTrack - Options JavaScript
// This script handles the options page interactions

// DOM elements
const focusDurationInput = document.getElementById('focus-duration');
const breakDurationInput = document.getElementById('break-duration');
const autoStartBreaksCheckbox = document.getElementById('auto-start-breaks');
const autoStartSessionsCheckbox = document.getElementById('auto-start-sessions');
const newDomainInput = document.getElementById('new-domain');
const addDomainButton = document.getElementById('add-domain');
const blockedListElement = document.getElementById('blocked-list');
const exportDataButton = document.getElementById('export-data');
const clearDataButton = document.getElementById('clear-data');
const dataExportFormatSelect = document.getElementById('data-export-format');
const saveSettingsButton = document.getElementById('save-settings');
const alertElement = document.getElementById('alert');

// State variables
let settings = {
  focusDuration: 25,
  breakDuration: 5,
  autoStartBreaks: false,
  autoStartSessions: false
};
let blockedDomains = [];

// Initialize the options page
document.addEventListener('DOMContentLoaded', () => {
  // Load settings from storage
  loadSettings();
  
  // Set up event listeners
  setupEventListeners();
});

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(['settings', 'blockedDomains'], (result) => {
    // Load settings
    if (result.settings) {
      settings = result.settings;
      
      focusDurationInput.value = settings.focusDuration;
      breakDurationInput.value = settings.breakDuration;
      autoStartBreaksCheckbox.checked = settings.autoStartBreaks;
      autoStartSessionsCheckbox.checked = settings.autoStartSessions;
    }
    
    // Load blocked domains
    if (result.blockedDomains) {
      blockedDomains = result.blockedDomains;
      renderBlockedList();
    }
  });
}

// Set up event listeners
function setupEventListeners() {
  // Add domain button
  addDomainButton.addEventListener('click', () => {
    addBlockedDomain();
  });
  
  // New domain input (for pressing Enter)
  newDomainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addBlockedDomain();
    }
  });
  
  // Export data button
  exportDataButton.addEventListener('click', () => {
    exportData();
  });
  
  // Clear data button
  clearDataButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all tracking data? This cannot be undone.')) {
      clearData();
    }
  });
  
  // Save settings button
  saveSettingsButton.addEventListener('click', () => {
    saveSettings();
  });
}

// Render the list of blocked domains
function renderBlockedList() {
  // Clear the list
  blockedListElement.innerHTML = '';
  
  // Check if there are any domains
  if (blockedDomains.length === 0) {
    blockedListElement.innerHTML = '<li class="blocked-item empty-state">No websites blocked yet</li>';
    return;
  }
  
  // Add each domain to the list
  blockedDomains.forEach((domain) => {
    const listItem = document.createElement('li');
    listItem.className = 'blocked-item';
    
    const domainSpan = document.createElement('span');
    domainSpan.textContent = domain;
    
    const removeButton = document.createElement('button');
    removeButton.className = 'button secondary';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      removeBlockedDomain(domain);
    });
    
    listItem.appendChild(domainSpan);
    listItem.appendChild(removeButton);
    
    blockedListElement.appendChild(listItem);
  });
}

// Add a new blocked domain
function addBlockedDomain() {
  const domain = newDomainInput.value.trim();
  
  if (!domain) {
    showAlert('Please enter a domain', 'error');
    return;
  }
  
  // Check if it's already in the list
  if (blockedDomains.includes(domain)) {
    showAlert('This domain is already blocked', 'error');
    return;
  }
  
  // Add to the list
  blockedDomains.push(domain);
  
  // Update storage
  chrome.storage.local.set({ blockedDomains: blockedDomains });
  
  // Send message to background script
  chrome.runtime.sendMessage({
    action: 'addBlockedWebsite',
    domain: domain
  });
  
  // Clear the input
  newDomainInput.value = '';
  
  // Re-render the list
  renderBlockedList();
  
  // Show success message
  showAlert(`Added ${domain} to blocked websites`, 'success');
}

// Remove a blocked domain
function removeBlockedDomain(domain) {
  // Remove from the array
  const index = blockedDomains.indexOf(domain);
  
  if (index !== -1) {
    blockedDomains.splice(index, 1);
    
    // Update storage
    chrome.storage.local.set({ blockedDomains: blockedDomains });
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'removeBlockedWebsite',
      domain: domain
    });
    
    // Re-render the list
    renderBlockedList();
    
    // Show success message
    showAlert(`Removed ${domain} from blocked websites`, 'success');
  }
}

// Export data
function exportData() {
  chrome.storage.local.get(['visits', 'focusSessions', 'settings', 'blockedDomains'], (result) => {
    const format = dataExportFormatSelect.value;
    let dataStr = '';
    
    if (format === 'json') {
      // Export as JSON
      dataStr = JSON.stringify(result, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      downloadData(dataUri, `timetrack-export-${new Date().toISOString().split('T')[0]}.json`);
    } else if (format === 'csv') {
      // Export as CSV
      // This is a simplified CSV export focused on visits
      const visits = result.visits || [];
      
      // Create CSV header
      const header = 'domain,url,title,startTime,endTime,duration\n';
      
      // Create CSV content
      const content = visits.map((visit) => {
        return `"${visit.domain}","${visit.url}","${visit.title || ''}","${visit.startTime}","${visit.endTime || ''}",${visit.duration || 0}`;
      }).join('\n');
      
      dataStr = header + content;
      const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(dataStr)}`;
      downloadData(dataUri, `timetrack-export-${new Date().toISOString().split('T')[0]}.csv`);
    }
    
    showAlert('Data exported successfully', 'success');
  });
}

// Download data helper
function downloadData(dataUri, filename) {
  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Clear all data
function clearData() {
  chrome.storage.local.set({
    visits: [],
    focusSessions: []
  }, () => {
    showAlert('All tracking data has been cleared', 'success');
  });
}

// Save settings
function saveSettings() {
  // Get values from form
  const focusDuration = parseInt(focusDurationInput.value, 10) || 25;
  const breakDuration = parseInt(breakDurationInput.value, 10) || 5;
  const autoStartBreaks = autoStartBreaksCheckbox.checked;
  const autoStartSessions = autoStartSessionsCheckbox.checked;
  
  // Validate input
  if (focusDuration < 5 || focusDuration > 180) {
    showAlert('Focus duration must be between 5 and 180 minutes', 'error');
    return;
  }
  
  if (breakDuration < 1 || breakDuration > 30) {
    showAlert('Break duration must be between 1 and 30 minutes', 'error');
    return;
  }
  
  // Update settings object
  settings = {
    ...settings,
    focusDuration,
    breakDuration,
    autoStartBreaks,
    autoStartSessions
  };
  
  // Save to storage
  chrome.storage.local.set({ settings: settings }, () => {
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: settings
    });
    
    showAlert('Settings saved successfully', 'success');
  });
}

// Show alert message
function showAlert(message, type) {
  alertElement.textContent = message;
  alertElement.className = `alert ${type}`;
  alertElement.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    alertElement.style.display = 'none';
  }, 3000);
}