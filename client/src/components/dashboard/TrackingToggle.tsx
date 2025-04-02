import React from 'react';

interface TrackingToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export default function TrackingToggle({ isActive, onToggle }: TrackingToggleProps) {
  return (
    <button
      type="button"
      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isActive ? 'bg-secondary' : 'bg-neutral-200'}`}
      role="switch"
      aria-checked={isActive}
      onClick={onToggle}
    >
      <span className="sr-only">Toggle tracking</span>
      <span 
        aria-hidden="true" 
        className={`${
          isActive ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
      ></span>
    </button>
  );
}
