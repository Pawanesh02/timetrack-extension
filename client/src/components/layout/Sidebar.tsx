import React from 'react';
import { Link, useLocation } from 'wouter';

export default function Sidebar() {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/analytics', label: 'Analytics', icon: 'pie_chart' },
    { path: '/focus', label: 'Focus Mode', icon: 'focus' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-neutral-800 border-r border-neutral-700">
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
    </div>
  );
}
