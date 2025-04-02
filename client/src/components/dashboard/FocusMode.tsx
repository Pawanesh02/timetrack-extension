import React, { useState } from 'react';
import { useTimeTrack } from '@/contexts/TimeTrackContext';

export default function FocusMode() {
  const { blockedWebsites, startFocusSession, addBlockedWebsite, removeBlockedWebsite, settings } = useTimeTrack();
  const [newWebsite, setNewWebsite] = useState('');
  const [focusDuration, setFocusDuration] = useState(settings?.focusDuration || 25);
  const [breakDuration, setBreakDuration] = useState(settings?.breakDuration || 5);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings?.autoStartBreaks || false);
  const [autoStartSessions, setAutoStartSessions] = useState(settings?.autoStartSessions || false);
  
  // Handle starting a focus session
  const handleStartFocusSession = () => {
    startFocusSession(focusDuration);
  };
  
  // Handle adding a new blocked website
  const handleAddBlockedWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWebsite.trim()) {
      addBlockedWebsite(newWebsite.trim());
      setNewWebsite('');
    }
  };
  
  // Handle removing a blocked website
  const handleRemoveBlockedWebsite = (id: number) => {
    removeBlockedWebsite(id);
  };
  
  return (
    <div className="mt-8 bg-white shadow rounded-lg p-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-medium text-neutral-900">Focus mode</h2>
          <p className="mt-1 text-sm text-neutral-500">Block distracting websites to stay productive</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={handleStartFocusSession}
          >
            <span className="material-icons mr-2 text-sm">timer</span>
            Start focus session
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Focus timer configuration */}
        <div className="bg-neutral-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Configure timer</h3>
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="focus-duration" className="block text-xs font-medium text-neutral-600">Session duration</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  name="focus-duration"
                  id="focus-duration"
                  className="focus:ring-primary focus:border-primary flex-1 block w-full rounded-md sm:text-sm border-neutral-300"
                  placeholder="25"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(parseInt(e.target.value) || 25)}
                  min="1"
                  max="120"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-neutral-300 bg-neutral-50 text-neutral-500 text-sm">
                  minutes
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="break-duration" className="block text-xs font-medium text-neutral-600">Break duration</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  name="break-duration"
                  id="break-duration"
                  className="focus:ring-primary focus:border-primary flex-1 block w-full rounded-md sm:text-sm border-neutral-300"
                  placeholder="5"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                  min="1"
                  max="30"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-neutral-300 bg-neutral-50 text-neutral-500 text-sm">
                  minutes
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <input
                id="auto-start-breaks"
                name="auto-start-breaks"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                checked={autoStartBreaks}
                onChange={(e) => setAutoStartBreaks(e.target.checked)}
              />
              <label htmlFor="auto-start-breaks" className="ml-2 block text-sm text-neutral-700">
                Auto-start breaks
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="auto-start-sessions"
                name="auto-start-sessions"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                checked={autoStartSessions}
                onChange={(e) => setAutoStartSessions(e.target.checked)}
              />
              <label htmlFor="auto-start-sessions" className="ml-2 block text-sm text-neutral-700">
                Auto-start next focus session
              </label>
            </div>
          </div>
        </div>

        {/* Blocked websites */}
        <div className="bg-neutral-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Blocked websites during focus</h3>
          <form onSubmit={handleAddBlockedWebsite}>
            <div className="mt-1 relative">
              <input
                type="text"
                name="new-website"
                placeholder="Add a website to block..."
                className="shadow-sm focus:ring-primary focus:border-primary block w-full pr-12 sm:text-sm border-neutral-300 rounded-md"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <button
                  type="submit"
                  className="inline-flex items-center border border-neutral-200 rounded px-2 text-sm font-sans font-medium text-neutral-400 hover:text-neutral-600"
                >
                  Add
                </button>
              </div>
            </div>
          </form>

          <div className="mt-3 max-h-48 overflow-y-auto">
            <div className="flow-root">
              {blockedWebsites.length > 0 ? (
                <ul className="-my-5">
                  {blockedWebsites.map((website) => (
                    <li key={website.id} className="py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="material-icons text-neutral-400 text-sm">block</span>
                          <span className="ml-2 text-sm text-neutral-700">{website.domain}</span>
                        </div>
                        <button
                          type="button"
                          className="text-neutral-400 hover:text-neutral-600"
                          onClick={() => handleRemoveBlockedWebsite(website.id)}
                        >
                          <span className="material-icons text-sm">close</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500 text-center py-4">
                  No websites blocked yet. Add some to stay focused.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
