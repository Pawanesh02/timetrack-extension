// TimeTrack - Content Script
// This script runs in the context of web pages

// Check if we should block this site
chrome.runtime.sendMessage({ action: 'checkIfBlocked', url: window.location.href }, (response) => {
  if (response && response.blocked) {
    // If we're in focus mode and this site is blocked, replace content
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        text-align: center;
        padding: 2rem;
      ">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Site Blocked</h1>
        <p style="font-size: 1.25rem; max-width: 600px; margin-bottom: 2rem;">
          This site is currently blocked because you're in Focus Mode.
        </p>
        <div style="
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 2rem;
          backdrop-filter: blur(10px);
          max-width: 500px;
        ">
          <p style="margin-bottom: 1.5rem;">
            Focus Mode is active. If you need to access this site, you can:
          </p>
          <button id="endFocusMode" style="
            background-color: white;
            color: #6366f1;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
          ">End Focus Mode</button>
          <p style="margin-top: 1.5rem; font-size: 0.875rem; opacity: 0.9;">
            Or wait until your focus session ends
          </p>
        </div>
      </div>
    `;
    
    // Add event listener to the button
    document.getElementById('endFocusMode').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'endFocusMode' }, () => {
        // Reload the page after ending focus mode
        window.location.reload();
      });
    });
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'blockSite') {
    // Replace the page content with a blocked message
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        text-align: center;
        padding: 2rem;
      ">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Site Blocked</h1>
        <p style="font-size: 1.25rem; max-width: 600px; margin-bottom: 2rem;">
          This site is currently blocked because you're in Focus Mode.
        </p>
        <div style="
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 2rem;
          backdrop-filter: blur(10px);
          max-width: 500px;
        ">
          <p style="margin-bottom: 1.5rem;">
            Focus Mode is active. If you need to access this site, you can:
          </p>
          <button id="endFocusMode" style="
            background-color: white;
            color: #6366f1;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
          ">End Focus Mode</button>
          <p style="margin-top: 1.5rem; font-size: 0.875rem; opacity: 0.9;">
            Or wait until your focus session ends
          </p>
        </div>
      </div>
    `;
    
    // Add event listener to the button
    document.getElementById('endFocusMode').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'endFocusMode' }, () => {
        // Reload the page after ending focus mode
        window.location.reload();
      });
    });
    
    sendResponse({ success: true });
    return true;
  }
});