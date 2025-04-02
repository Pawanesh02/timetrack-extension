import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileHeader from '@/components/layout/MobileHeader';
import { useTimeTrack } from '@/contexts/TimeTrackContext';

export default function FocusModePage() {
  const { blockedWebsites, addBlockedWebsite, removeBlockedWebsite, startFocusSession, isInFocusMode, stopFocusSession, settings } = useTimeTrack();
  const [newWebsite, setNewWebsite] = useState('');
  const [focusDuration, setFocusDuration] = useState(settings?.focusDuration || 25);
  const [remainingTime, setRemainingTime] = useState(0);
  const [activeTab, setActiveTab] = useState('timer');
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle adding a new blocked website
  const handleAddBlockedWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWebsite.trim()) {
      addBlockedWebsite(newWebsite.trim());
      setNewWebsite('');
    }
  };
  
  // Handle starting a focus session
  const handleStartFocusSession = () => {
    startFocusSession(focusDuration);
  };
  
  // Handle stopping a focus session
  const handleStopFocusSession = () => {
    stopFocusSession();
  };
  
  // Update the countdown timer
  useEffect(() => {
    let intervalId: number;
    
    if (isInFocusMode) {
      setRemainingTime(focusDuration * 60);
      
      intervalId = window.setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalId);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isInFocusMode, focusDuration]);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <MobileHeader />
        
        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <h1 className="text-2xl font-semibold text-neutral-900">Focus Mode</h1>
                
                {/* Tabs */}
                <div className="mt-3 md:mt-0">
                  <div className="flex space-x-2 border border-neutral-200 rounded-md">
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'timer' 
                          ? 'bg-primary text-white' 
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                      onClick={() => setActiveTab('timer')}
                    >
                      Timer
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'blocked' 
                          ? 'bg-primary text-white' 
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                      onClick={() => setActiveTab('blocked')}
                    >
                      Blocked Sites
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Timer tab */}
              {activeTab === 'timer' && (
                <>
                  {/* Focus timer */}
                  <div className="mt-8 bg-white shadow rounded-lg p-6">
                    {isInFocusMode ? (
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Focus Mode Active</h2>
                        <div className="text-6xl font-mono font-bold text-primary my-8">
                          {formatTime(remainingTime)}
                        </div>
                        <p className="text-neutral-600 mb-6">
                          Stay focused! Distracting websites are blocked.
                        </p>
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-danger hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger"
                          onClick={handleStopFocusSession}
                        >
                          <span className="material-icons mr-2">stop</span>
                          End focus session
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="md:flex md:items-center md:justify-between">
                          <div>
                            <h2 className="text-lg font-medium text-neutral-900">Pomodoro Timer</h2>
                            <p className="mt-1 text-sm text-neutral-500">
                              Set your focus duration and start a session
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-6 max-w-md mx-auto">
                          <div className="space-y-6">
                            <div>
                              <label htmlFor="focus-duration" className="block text-sm font-medium text-neutral-700">
                                Focus Duration (minutes)
                              </label>
                              <input
                                type="number"
                                id="focus-duration"
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                                value={focusDuration}
                                onChange={(e) => setFocusDuration(parseInt(e.target.value) || 25)}
                                min="1"
                                max="120"
                              />
                            </div>
                            
                            <div className="flex justify-center">
                              <button
                                type="button"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                onClick={handleStartFocusSession}
                              >
                                <span className="material-icons mr-2">play_arrow</span>
                                Start Focus Session
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Focus tips */}
                  <div className="mt-8 bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-neutral-900 mb-4">Focus Tips</h2>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="material-icons text-primary mr-3 flex-shrink-0">check_circle</span>
                        <span className="text-sm text-neutral-600">Break down large tasks into smaller, manageable chunks</span>
                      </li>
                      <li className="flex items-start">
                        <span className="material-icons text-primary mr-3 flex-shrink-0">check_circle</span>
                        <span className="text-sm text-neutral-600">Remove distractions from your environment</span>
                      </li>
                      <li className="flex items-start">
                        <span className="material-icons text-primary mr-3 flex-shrink-0">check_circle</span>
                        <span className="text-sm text-neutral-600">Take short breaks to maintain productivity</span>
                      </li>
                      <li className="flex items-start">
                        <span className="material-icons text-primary mr-3 flex-shrink-0">check_circle</span>
                        <span className="text-sm text-neutral-600">Stay hydrated and maintain good posture</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
              
              {/* Blocked sites tab */}
              {activeTab === 'blocked' && (
                <div className="mt-8 bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-neutral-900 mb-6">Manage Blocked Websites</h2>
                  
                  <form onSubmit={handleAddBlockedWebsite} className="mb-6">
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Enter website domain (e.g., facebook.com)"
                        className="flex-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-l-md"
                        value={newWebsite}
                        onChange={(e) => setNewWebsite(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Add Website
                      </button>
                    </div>
                  </form>
                  
                  {blockedWebsites.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Domain
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                          {blockedWebsites.map((website) => (
                            <tr key={website.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {website.domain}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  type="button"
                                  className="text-danger hover:text-danger-700"
                                  onClick={() => removeBlockedWebsite(website.id)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-md bg-neutral-50">
                      <span className="material-icons text-4xl text-neutral-400 mb-2">block</span>
                      <p className="text-neutral-600 mb-1">No websites are currently blocked</p>
                      <p className="text-sm text-neutral-500">Add websites above to block them during focus sessions</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
