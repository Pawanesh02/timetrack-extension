import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileHeader from '@/components/layout/MobileHeader';
import { useTimeTrack } from '@/contexts/TimeTrackContext';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { settings, updateSettings, topSites } = useTimeTrack();
  const { toast } = useToast();
  const [focusDuration, setFocusDuration] = useState(settings?.focusDuration || 25);
  const [breakDuration, setBreakDuration] = useState(settings?.breakDuration || 5);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings?.autoStartBreaks || false);
  const [autoStartSessions, setAutoStartSessions] = useState(settings?.autoStartSessions || false);
  const [dataExportFormat, setDataExportFormat] = useState('json');
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);

  const handleSaveSettings = () => {
    if (settings) {
      updateSettings({
        ...settings,
        focusDuration,
        breakDuration,
        autoStartBreaks,
        autoStartSessions
      });
      
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
        duration: 3000,
      });
    }
  };

  const handleClearData = () => {
    // In a real extension, this would clear all stored data
    localStorage.clear();
    setShowClearDataDialog(false);
    
    toast({
      title: "Data cleared",
      description: "All your tracking data has been removed.",
      variant: "destructive",
      duration: 3000,
    });
  };

  const handleExportData = () => {
    // This would export actual data in a real implementation
    const mockData = {
      settings: settings,
      topSites: topSites,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(mockData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `timetrack-export-${new Date().toISOString().split('T')[0]}.${dataExportFormat}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Data exported",
      description: `Your data has been exported as ${dataExportFormat.toUpperCase()}.`,
      duration: 3000,
    });
  };

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
              <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
              
              {/* Focus Mode Settings */}
              <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-neutral-900 mb-6">Focus Mode Settings</h2>
                
                <div className="space-y-6 max-w-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="focus-duration" className="block text-sm font-medium text-neutral-700">
                        Default focus duration (minutes)
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
                    
                    <div>
                      <label htmlFor="break-duration" className="block text-sm font-medium text-neutral-700">
                        Default break duration (minutes)
                      </label>
                      <input
                        type="number"
                        id="break-duration"
                        className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                        min="1"
                        max="30"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-t border-b border-neutral-200">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Auto-start breaks</h3>
                      <p className="text-sm text-neutral-500">Automatically start break after focus session ends</p>
                    </div>
                    <Switch
                      checked={autoStartBreaks}
                      onCheckedChange={setAutoStartBreaks}
                      aria-label="Auto-start breaks"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-neutral-200">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Auto-start focus sessions</h3>
                      <p className="text-sm text-neutral-500">Automatically start next focus session after break</p>
                    </div>
                    <Switch
                      checked={autoStartSessions}
                      onCheckedChange={setAutoStartSessions}
                      aria-label="Auto-start focus sessions"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      onClick={handleSaveSettings}
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Data Management */}
              <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-neutral-900 mb-6">Data Management</h2>
                
                <div className="space-y-6 max-w-3xl">
                  {/* Export Data */}
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-neutral-700">Export your data</h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          Download a copy of your tracking data
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          className="form-select text-sm"
                          value={dataExportFormat}
                          onChange={(e) => setDataExportFormat(e.target.value)}
                        >
                          <option value="json">JSON</option>
                          <option value="csv">CSV</option>
                        </select>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          onClick={handleExportData}
                        >
                          <span className="material-icons mr-1 text-sm">download</span>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Clear Data */}
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-neutral-700">Clear all data</h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          Remove all tracking data. This action cannot be undone.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-destructive hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
                        onClick={() => setShowClearDataDialog(true)}
                      >
                        <span className="material-icons mr-1 text-sm">delete</span>
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* About Section */}
              <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-neutral-900 mb-6">About TimeTrack</h2>
                
                <div className="space-y-4 max-w-3xl">
                  <p className="text-sm text-neutral-600">
                    TimeTrack is a privacy-focused website usage tracker. All your data is stored locally and never sent to external servers.
                  </p>
                  
                  <div className="flex items-center space-x-4 pt-4 border-t border-neutral-200">
                    <span className="material-icons text-primary">timer</span>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">TimeTrack</h3>
                      <p className="text-xs text-neutral-500">Version 1.0.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Clear data confirmation dialog */}
      {showClearDataDialog && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div className="fixed inset-0 bg-neutral-900 bg-opacity-75 transition-opacity" onClick={() => setShowClearDataDialog(false)}></div>
            
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <span className="material-icons text-destructive">warning</span>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-neutral-900">Clear all data</h3>
                    <div className="mt-2">
                      <p className="text-sm text-neutral-500">
                        Are you sure you want to clear all your tracking data? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-destructive text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleClearData}
                >
                  Clear data
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowClearDataDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
