import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Clock, Menu, X } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get tracking state
  const { data: isTracking, isLoading: trackingLoading } = useQuery({
    queryKey: ["/api/tracking/status"],
  });

  // Toggle tracking mutation
  const toggleTrackingMutation = useMutation({
    mutationFn: (enabled: boolean) => 
      apiRequest("POST", "/api/tracking/toggle", { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracking/status"] });
    },
  });

  // Start focus session mutation
  const startFocusMutation = useMutation({
    mutationFn: (duration: number) => 
      apiRequest("POST", "/api/focus-sessions", { duration: duration }),
    onSuccess: () => {
      // Navigate to focus page
      window.location.href = "/focus";
    },
  });

  const handleToggleTracking = (checked: boolean) => {
    toggleTrackingMutation.mutate(checked);
  };

  const handleStartFocus = () => {
    startFocusMutation.mutate(45); // Default to 45 mins
  };

  return (
    <div className="bg-white shadow-sm border-b border-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Nav Links */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Clock className="text-primary h-6 w-6 mr-2" />
              <span className="text-lg font-semibold text-neutral-700">TimeTrack</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`${location === '/' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-400'} border-b-2 px-1 pt-1 text-sm font-medium`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/focus">
                <a className={`${location === '/focus' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-400'} border-b-2 px-1 pt-1 text-sm font-medium`}>
                  Focus Mode
                </a>
              </Link>
              <Link href="/analytics">
                <a className={`${location === '/analytics' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-400'} border-b-2 px-1 pt-1 text-sm font-medium`}>
                  Analytics
                </a>
              </Link>
              <Link href="/settings">
                <a className={`${location === '/settings' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-400'} border-b-2 px-1 pt-1 text-sm font-medium`}>
                  Settings
                </a>
              </Link>
            </div>
          </div>

          {/* Toggle Tracking and Focus Button */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm font-medium text-neutral-500 hidden sm:inline">Tracking</span>
              <ToggleSwitch 
                checked={isTracking}
                onCheckedChange={handleToggleTracking}
                disabled={trackingLoading || toggleTrackingMutation.isPending}
              />
            </div>
            <div className="hidden sm:flex items-center">
              <Button 
                className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                onClick={handleStartFocus}
                disabled={startFocusMutation.isPending}
              >
                <Clock className="mr-2 h-4 w-4" />
                Start Focus Session
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-neutral-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-neutral-300">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/">
              <a className={`${location === '/' ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral-600 hover:bg-neutral-100'} block px-3 py-2 rounded-md text-base font-medium`}>
                Dashboard
              </a>
            </Link>
            <Link href="/focus">
              <a className={`${location === '/focus' ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral-600 hover:bg-neutral-100'} block px-3 py-2 rounded-md text-base font-medium`}>
                Focus Mode
              </a>
            </Link>
            <Link href="/analytics">
              <a className={`${location === '/analytics' ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral-600 hover:bg-neutral-100'} block px-3 py-2 rounded-md text-base font-medium`}>
                Analytics
              </a>
            </Link>
            <Link href="/settings">
              <a className={`${location === '/settings' ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral-600 hover:bg-neutral-100'} block px-3 py-2 rounded-md text-base font-medium`}>
                Settings
              </a>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-neutral-300">
            <div className="flex items-center justify-between px-3">
              <Button 
                className="w-full bg-primary hover:bg-primaryDark text-white rounded-md text-sm font-medium flex items-center justify-center"
                onClick={handleStartFocus}
                disabled={startFocusMutation.isPending}
              >
                <Clock className="mr-2 h-4 w-4" />
                Start Focus Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
