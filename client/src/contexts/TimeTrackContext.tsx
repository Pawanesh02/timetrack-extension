import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WebsiteVisit, FocusSession, BlockedWebsite, Settings } from '@shared/schema';
import { startTracking, stopTracking, getCurrentTab } from '@/lib/tracker';
import { calculateProjections, getTopWebsites, getDailyUsage, getTotalTimeToday } from '@/lib/analytics';
import { startFocusMode, stopFocusMode, isInFocusMode } from '@/lib/focusMode';
import { apiRequest } from '@/lib/queryClient';

interface TimeTrackContextType {
  // Tracking state
  isTracking: boolean;
  toggleTracking: () => void;
  
  // Analytics data
  topSites: { domain: string; time: number; percentage: number; trend: number }[];
  todayUsage: number; // in minutes
  todayVsYesterday: number; // percentage change
  weeklyProjection: number; // in minutes
  
  // Focus mode
  isInFocusMode: boolean;
  blockedWebsites: BlockedWebsite[];
  focusSessions: FocusSession[];
  todayFocusSessions: number;
  
  // Settings
  settings: Settings | null;
  
  // Actions
  startFocusSession: (duration: number) => void;
  stopFocusSession: () => void;
  addBlockedWebsite: (domain: string) => void;
  removeBlockedWebsite: (id: number) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

const TimeTrackContext = createContext<TimeTrackContextType | undefined>(undefined);

export const useTimeTrack = () => {
  const context = useContext(TimeTrackContext);
  if (!context) {
    throw new Error('useTimeTrack must be used within a TimeTrackProvider');
  }
  return context;
};

interface TimeTrackProviderProps {
  children: ReactNode;
}

export const TimeTrackProvider = ({ children }: TimeTrackProviderProps) => {
  const queryClient = useQueryClient();
  const [isTracking, setIsTracking] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(1); // For demo purposes, we'll use a fixed userId
  
  // Queries
  const { data: visits = [] } = useQuery({
    queryKey: ['/api/visits', currentUserId],
    queryFn: async () => {
      const response = await fetch(`/api/visits?userId=${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch visits');
      return response.json();
    }
  });
  
  const { data: focusSessions = [] } = useQuery({
    queryKey: ['/api/focus-sessions', currentUserId],
    queryFn: async () => {
      const response = await fetch(`/api/focus-sessions?userId=${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch focus sessions');
      return response.json();
    }
  });
  
  const { data: blockedWebsites = [] } = useQuery({
    queryKey: ['/api/blocked-websites', currentUserId],
    queryFn: async () => {
      const response = await fetch(`/api/blocked-websites?userId=${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch blocked websites');
      return response.json();
    }
  });
  
  const { data: settings } = useQuery({
    queryKey: ['/api/settings', currentUserId],
    queryFn: async () => {
      const response = await fetch(`/api/settings?userId=${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });
  
  // Mutations
  const createVisitMutation = useMutation({
    mutationFn: (visit: Omit<WebsiteVisit, 'id'>) => 
      apiRequest('POST', '/api/visits', visit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/visits'] });
    }
  });
  
  const updateVisitMutation = useMutation({
    mutationFn: ({ id, visit }: { id: number; visit: Partial<WebsiteVisit> }) => 
      apiRequest('PUT', `/api/visits/${id}`, visit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/visits'] });
    }
  });
  
  const createFocusSessionMutation = useMutation({
    mutationFn: (session: Omit<FocusSession, 'id'>) => 
      apiRequest('POST', '/api/focus-sessions', session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/focus-sessions'] });
    }
  });
  
  const updateFocusSessionMutation = useMutation({
    mutationFn: ({ id, session }: { id: number; session: Partial<FocusSession> }) => 
      apiRequest('PUT', `/api/focus-sessions/${id}`, session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/focus-sessions'] });
    }
  });
  
  const addBlockedWebsiteMutation = useMutation({
    mutationFn: (website: Omit<BlockedWebsite, 'id'>) => 
      apiRequest('POST', '/api/blocked-websites', website),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blocked-websites'] });
    }
  });
  
  const removeBlockedWebsiteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/blocked-websites/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blocked-websites'] });
    }
  });
  
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: Partial<Settings>) => 
      apiRequest('POST', '/api/settings', { 
        ...settings, 
        userId: currentUserId 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    }
  });
  
  // Computed values
  const topSites = getTopWebsites(visits);
  const todayUsage = getTotalTimeToday(visits);
  const todayVsYesterday = 18; // Would calculate from visits in real implementation
  const weeklyProjection = 1575; // 26h 15m in minutes
  const todayFocusSessions = focusSessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.startTime);
    return sessionDate.getDate() === today.getDate() &&
           sessionDate.getMonth() === today.getMonth() &&
           sessionDate.getFullYear() === today.getFullYear();
  }).length;
  
  // Effects
  useEffect(() => {
    if (settings) {
      setIsTracking(settings.trackingEnabled);
    }
  }, [settings]);
  
  useEffect(() => {
    let currentVisitId: number | null = null;
    let intervalId: number | undefined;
    
    if (isTracking) {
      // Start tracking
      const trackCurrentTab = async () => {
        const tab = await getCurrentTab();
        if (tab && tab.url) {
          const url = new URL(tab.url);
          const domain = url.hostname;
          
          if (!currentVisitId) {
            // Create a new visit
            try {
              const response = await createVisitMutation.mutateAsync({
                domain,
                url: tab.url,
                title: tab.title || '',
                startTime: new Date(),
                userId: currentUserId
              } as any);
              
              currentVisitId = response.id;
            } catch (error) {
              console.error('Failed to create visit', error);
            }
          } else {
            // Update the existing visit
            try {
              await updateVisitMutation.mutateAsync({
                id: currentVisitId,
                visit: {
                  endTime: new Date(),
                  duration: calculateDuration(currentVisitId, visits)
                }
              });
            } catch (error) {
              console.error('Failed to update visit', error);
            }
          }
        }
      };
      
      // Track immediately and then every 5 seconds
      trackCurrentTab();
      intervalId = window.setInterval(trackCurrentTab, 5000);
    } else {
      // Stop tracking
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      
      // Update the current visit's end time if there is one
      if (currentVisitId) {
        updateVisitMutation.mutate({
          id: currentVisitId,
          visit: {
            endTime: new Date(),
            duration: calculateDuration(currentVisitId, visits)
          }
        });
        currentVisitId = null;
      }
    }
    
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isTracking, currentUserId, createVisitMutation, updateVisitMutation, visits]);
  
  // Helper function to calculate duration of a visit
  const calculateDuration = (visitId: number, visits: WebsiteVisit[]): number => {
    const visit = visits.find(v => v.id === visitId);
    if (!visit || !visit.startTime) return 0;
    
    const start = new Date(visit.startTime).getTime();
    const end = new Date().getTime();
    return Math.floor((end - start) / 1000); // duration in seconds
  };
  
  // Actions
  const toggleTracking = () => {
    const newTrackingState = !isTracking;
    setIsTracking(newTrackingState);
    
    if (settings) {
      updateSettingsMutation.mutate({
        ...settings,
        trackingEnabled: newTrackingState
      });
    }
    
    if (newTrackingState) {
      startTracking();
    } else {
      stopTracking();
    }
  };
  
  const startFocusSession = (duration: number) => {
    if (isInFocusMode()) return;
    
    const session: Omit<FocusSession, 'id'> = {
      startTime: new Date(),
      duration: duration * 60, // convert minutes to seconds
      userId: currentUserId,
      completed: false
    } as any;
    
    createFocusSessionMutation.mutate(session, {
      onSuccess: (newSession) => {
        startFocusMode(blockedWebsites.map(site => site.domain), duration);
        
        // Set a timer to end the focus session
        setTimeout(() => {
          stopFocusSession();
        }, duration * 60 * 1000);
      }
    });
  };
  
  const stopFocusSession = () => {
    if (!isInFocusMode()) return;
    
    stopFocusMode();
    
    // Find the active focus session and update it
    const activeSession = [...focusSessions]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .find(session => !session.endTime);
    
    if (activeSession) {
      updateFocusSessionMutation.mutate({
        id: activeSession.id,
        session: {
          endTime: new Date(),
          completed: true
        }
      });
    }
  };
  
  const addBlockedWebsite = (domain: string) => {
    addBlockedWebsiteMutation.mutate({
      domain,
      userId: currentUserId
    } as any);
  };
  
  const removeBlockedWebsite = (id: number) => {
    removeBlockedWebsiteMutation.mutate(id);
  };
  
  const updateSettings = (newSettings: Partial<Settings>) => {
    if (settings) {
      updateSettingsMutation.mutate({
        ...settings,
        ...newSettings
      });
    }
  };
  
  const contextValue = {
    isTracking,
    toggleTracking,
    topSites,
    todayUsage,
    todayVsYesterday,
    weeklyProjection,
    isInFocusMode: isInFocusMode(),
    blockedWebsites,
    focusSessions,
    todayFocusSessions,
    settings: settings || null,
    startFocusSession,
    stopFocusSession,
    addBlockedWebsite,
    removeBlockedWebsite,
    updateSettings
  };
  
  return (
    <TimeTrackContext.Provider value={contextValue}>
      {children}
    </TimeTrackContext.Provider>
  );
};
