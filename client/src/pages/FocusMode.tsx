import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { Clock, Plus, X, Info } from "lucide-react";

type FocusSession = {
  id: number;
  startTime: string;
  endTime: string | null;
  duration: number;
  completed: boolean;
};

type BlockedWebsite = {
  id: number;
  domain: string;
};

export default function FocusMode() {
  const [newWebsite, setNewWebsite] = useState("");
  const [duration, setDuration] = useState<number>(45);
  const [customDuration, setCustomDuration] = useState<number>(45);
  const [showCustom, setShowCustom] = useState(false);

  // Fetch blocked websites
  const { data: blockedWebsites = [], isLoading: sitesLoading } = useQuery<BlockedWebsite[]>({
    queryKey: ["/api/blocked-websites"],
  });

  // Fetch focus sessions
  const { data: focusSessions = [], isLoading: sessionsLoading } = useQuery<FocusSession[]>({
    queryKey: ["/api/focus-sessions"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
    },
  });

  const handleAddWebsite = () => {
    if (newWebsite.trim()) {
      addWebsiteMutation.mutate(newWebsite.trim());
    }
  };

  const handleStartFocus = () => {
    startFocusMutation.mutate(showCustom ? customDuration : duration);
  };

  const handleRemoveWebsite = (id: number) => {
    removeWebsiteMutation.mutate(id);
  };

  const handleDurationSelect = (value: number) => {
    setDuration(value);
    setShowCustom(false);
  };

  const handleCustomClick = () => {
    setShowCustom(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-700">Focus Mode</h1>
        <p className="text-neutral-500 mt-1">Block distracting websites to stay focused and productive.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Configure Focus Mode</CardTitle>
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
            <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-300 mb-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Blocked Websites during Focus</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {sitesLoading ? (
                  <div className="text-sm text-neutral-500">Loading...</div>
                ) : blockedWebsites.length > 0 ? (
                  blockedWebsites.map((site) => (
                    <div key={site.id} className="bg-neutral-200 px-3 py-1 rounded-full flex items-center text-xs">
                      {site.domain}
                      <button 
                        className="ml-2 text-neutral-500 hover:text-neutral-700"
                        onClick={() => handleRemoveWebsite(site.id)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-neutral-500">No websites added yet</div>
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
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddWebsite}
                  disabled={addWebsiteMutation.isPending || !newWebsite.trim()}
                  className="bg-primary bg-opacity-10 text-primary border-primary border-opacity-20"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <Label className="block text-sm font-medium text-neutral-700 mb-2">Focus Session Duration</Label>
              <div className="flex items-center space-x-3">
                <Button 
                  variant={!showCustom && duration === 25 ? "secondary" : "outline"} 
                  className={!showCustom && duration === 25 ? "bg-primary bg-opacity-10 text-primary border-primary" : ""}
                  onClick={() => handleDurationSelect(25)}
                >
                  25min
                </Button>
                <Button 
                  variant={!showCustom && duration === 45 ? "secondary" : "outline"} 
                  className={!showCustom && duration === 45 ? "bg-primary bg-opacity-10 text-primary border-primary" : ""}
                  onClick={() => handleDurationSelect(45)}
                >
                  45min
                </Button>
                <Button 
                  variant={!showCustom && duration === 60 ? "secondary" : "outline"} 
                  className={!showCustom && duration === 60 ? "bg-primary bg-opacity-10 text-primary border-primary" : ""}
                  onClick={() => handleDurationSelect(60)}
                >
                  1hour
                </Button>
                <Button 
                  variant={showCustom ? "secondary" : "outline"} 
                  className={showCustom ? "bg-primary bg-opacity-10 text-primary border-primary" : ""}
                  onClick={handleCustomClick}
                >
                  Custom
                </Button>
              </div>
              
              {showCustom && (
                <div className="mt-3">
                  <Label htmlFor="custom-duration" className="text-sm">Custom duration (minutes)</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      id="custom-duration"
                      type="number"
                      min="1"
                      max="240"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(Number(e.target.value))}
                      className="w-24 mr-2"
                    />
                    <span className="text-sm text-neutral-500">minutes</span>
                  </div>
                </div>
              )}
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primaryDark text-white px-4 py-3 flex items-center justify-center"
              onClick={handleStartFocus}
              disabled={startFocusMutation.isPending}
            >
              <Clock className="mr-2 h-5 w-5" />
              Start Focus Session
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Focus Session History</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="text-center py-8">
                <div className="text-neutral-500">Loading session history...</div>
              </div>
            ) : focusSessions.length > 0 ? (
              <div className="space-y-3">
                {focusSessions.map((session) => {
                  const date = new Date(session.startTime);
                  const formattedDate = date.toLocaleDateString();
                  const formattedTime = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                  
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-md border border-neutral-300">
                      <div>
                        <div className="text-sm font-medium text-neutral-700">{session.duration}min Focus</div>
                        <div className="text-xs text-neutral-500">{formattedDate}, {formattedTime}</div>
                      </div>
                      <span 
                        className={`text-xs px-2 py-1 rounded-full ${
                          session.completed 
                            ? "bg-success bg-opacity-10 text-success" 
                            : "bg-danger bg-opacity-10 text-danger"
                        }`}
                      >
                        {session.completed ? "Completed" : "Interrupted"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-neutral-500 mb-2">No focus sessions yet</div>
                <p className="text-sm text-neutral-400">
                  Start a focus session to block distracting websites and stay productive.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
