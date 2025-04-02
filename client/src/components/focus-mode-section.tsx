import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Info, Clock, Plus, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type BlockedWebsite = {
  id: number;
  domain: string;
};

type FocusSession = {
  id: number;
  startTime: string;
  endTime: string | null;
  duration: number;
  completed: boolean;
};

export default function FocusModeSection() {
  const [newWebsite, setNewWebsite] = useState("");

  // Fetch blocked websites
  const { data: blockedWebsites = [], isLoading: sitesLoading } = useQuery<BlockedWebsite[]>({
    queryKey: ["/api/blocked-websites"],
  });

  // Fetch recent focus sessions
  const { data: focusSessions = [], isLoading: sessionsLoading } = useQuery<FocusSession[]>({
    queryKey: ["/api/focus-sessions/recent"],
  });

  // Add new blocked website
  const addWebsiteMutation = useMutation({
    mutationFn: (domain: string) => 
      apiRequest("POST", "/api/blocked-websites", { domain }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocked-websites"] });
      setNewWebsite("");
    },
  });

  // Remove blocked website
  const removeWebsiteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/blocked-websites/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocked-websites"] });
    },
  });

  // Start focus session
  const startFocusMutation = useMutation({
    mutationFn: (duration: number) => 
      apiRequest("POST", "/api/focus-sessions", { duration }),
    onSuccess: () => {
      window.location.href = "/focus";
    },
  });

  const handleAddWebsite = () => {
    if (newWebsite.trim()) {
      addWebsiteMutation.mutate(newWebsite.trim());
    }
  };

  const handleRemoveWebsite = (id: number) => {
    removeWebsiteMutation.mutate(id);
  };

  const handleStartFocus = () => {
    startFocusMutation.mutate(45); // Default to 45 minutes
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Focus Mode</CardTitle>
          <div className="relative inline-block has-tooltip">
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5 text-neutral-500" />
            </Button>
            <div className="custom-tooltip absolute z-10 -top-2 right-0 transform translate-y-full w-64 px-4 py-3 bg-neutral-700 text-white text-xs rounded shadow-lg">
              Focus Mode blocks distracting websites for a set period to help you stay productive. Define which sites to block and customize your focus session duration.
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-300 mb-4">
            <h3 className="text-sm font-medium text-neutral-700 mb-2">Blocked Websites during Focus</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {sitesLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : blockedWebsites.length > 0 ? (
                <>
                  {blockedWebsites.map((site) => (
                    <div key={site.id} className="bg-neutral-200 px-3 py-1 rounded-full flex items-center text-xs">
                      {site.domain}
                      <button 
                        className="ml-2 text-neutral-500 hover:text-neutral-700"
                        onClick={() => handleRemoveWebsite(site.id)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-xs text-neutral-500">No websites added to block list</div>
              )}
            </div>
            <div className="flex">
              <Input
                type="text"
                placeholder="example.com"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                className="text-sm mr-2"
              />
              <Button 
                size="sm"
                variant="outline"
                className="bg-primary bg-opacity-10 text-primary"
                onClick={handleAddWebsite}
                disabled={addWebsiteMutation.isPending || !newWebsite.trim()}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Website
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Focus Session Duration</label>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="flex-1 py-2 px-4"
              >
                25min
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 py-2 px-4 border-primary bg-primary bg-opacity-10 text-primary"
              >
                45min
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 py-2 px-4"
              >
                1hour
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 py-2 px-4"
              >
                Custom
              </Button>
            </div>
          </div>

          <Button 
            className="w-full bg-primary hover:bg-primaryDark text-white px-4 py-3 flex items-center justify-center"
            onClick={handleStartFocus}
            disabled={startFocusMutation.isPending}
          >
            <Clock className="mr-2 h-5 w-5" />
            Start Focus Session
          </Button>
        </div>

        <div>
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Recent Focus Sessions</h3>
          {sessionsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : focusSessions.length > 0 ? (
            <div className="space-y-3">
              {focusSessions.map((session) => {
                const date = new Date(session.startTime);
                const formattedTime = formatDistanceToNow(date, { addSuffix: true });
                
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-md border border-neutral-300">
                    <div>
                      <div className="text-sm font-medium text-neutral-700">{session.duration}min Focus</div>
                      <div className="text-xs text-neutral-500">{formattedTime}</div>
                    </div>
                    <span 
                      className={`text-xs px-2 py-1 ${
                        session.completed 
                          ? "bg-success bg-opacity-10 text-success" 
                          : "bg-danger bg-opacity-10 text-danger"
                      } rounded-full`}
                    >
                      {session.completed ? "Completed" : "Interrupted"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-neutral-500">No recent focus sessions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
