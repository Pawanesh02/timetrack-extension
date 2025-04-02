import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';

export default function MobileHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/analytics', label: 'Analytics', icon: 'pie_chart' },
    { path: '/focus', label: 'Focus Mode', icon: 'focus' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];
  
  return (
    <>
      <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-neutral-800 text-white flex items-center">
        <button 
          type="button" 
          className="inline-flex items-center justify-center h-10 w-10 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <span className="material-icons">menu</span>
        </button>
        <span className="ml-2 text-xl font-semibold">TimeTrack</span>
      </div>
      
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-neutral-900 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          {/* Sidebar panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-neutral-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <span className="material-icons text-white">close</span>
              </button>
            </div>
            
            {/* Sidebar content */}
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="flex items-center">
                  <span className="material-icons text-primary mr-2">timer</span>
                  <h1 className="text-white text-xl font-semibold">TimeTrack</h1>
                </div>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className={`${
                      isActive(item.path) 
                        ? 'bg-neutral-900 text-white' 
                        : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className={`material-icons mr-3 ${isActive(item.path) ? 'text-primary' : 'text-neutral-300'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* User profile */}
            <div className="flex-shrink-0 flex border-t border-neutral-700 p-4">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Local Data</p>
                  <p className="text-xs text-neutral-300">All data stored locally</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
