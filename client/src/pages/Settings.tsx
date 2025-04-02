import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  TrashIcon, 
  SaveIcon, 
  RefreshCw, 
  Shield, 
  Database, 
  Settings as SettingsIcon,
  BellRing
} from "lucide-react";

type GeneralSettings = {
  startTracking: boolean;
  showNotifications: boolean;
  startOnBoot: boolean;
};

type DataSettings = {
  storageLimit: number;
  autoDelete: number;
};

export default function Settings() {
  // Fetch general settings
  const { data: generalSettings, isLoading: generalLoading } = useQuery<GeneralSettings>({
    queryKey: ["/api/settings/general"],
  });

  // Fetch data settings
  const { data: dataSettings, isLoading: dataLoading } = useQuery<DataSettings>({
    queryKey: ["/api/settings/data"],
  });

  const [general, setGeneral] = useState<GeneralSettings>({
    startTracking: true,
    showNotifications: true,
    startOnBoot: true,
  });

  const [data, setData] = useState<DataSettings>({
    storageLimit: 90,
    autoDelete: 30,
  });

  // Update settings when data is loaded
  useState(() => {
    if (generalSettings) {
      setGeneral(generalSettings);
    }
    if (dataSettings) {
      setData(dataSettings);
    }
  });

  // Update general settings
  const updateGeneralSettings = useMutation({
    mutationFn: (settings: GeneralSettings) => 
      apiRequest("POST", "/api/settings/general", settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/general"] });
      toast({
        title: "Settings updated",
        description: "Your general settings have been saved.",
      });
    },
  });

  // Update data settings
  const updateDataSettings = useMutation({
    mutationFn: (settings: DataSettings) => 
      apiRequest("POST", "/api/settings/data", settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/data"] });
      toast({
        title: "Data settings updated",
        description: "Your data settings have been saved.",
      });
    },
  });

  // Clear all data
  const clearAllData = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/data/clear"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/top-websites"] });
      toast({
        title: "Data cleared",
        description: "All your browsing data has been deleted.",
      });
    },
  });

  // Export data
  const exportData = async () => {
    try {
      const res = await fetch("/api/data/export", {
        method: "GET",
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to export data");
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timetrack-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleGeneralChange = (key: keyof GeneralSettings, value: boolean) => {
    setGeneral(prev => ({ ...prev, [key]: value }));
  };

  const handleDataChange = (key: keyof DataSettings, value: number) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const saveGeneralSettings = () => {
    updateGeneralSettings.mutate(general);
  };

  const saveDataSettings = () => {
    updateDataSettings.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-700">Settings</h1>
        <p className="text-neutral-500 mt-1">Configure your TimeTrack extension preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>Configure how TimeTrack works on your browser</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Start tracking automatically</Label>
                    <p className="text-sm text-neutral-500">Track your website usage when the browser starts</p>
                  </div>
                  <Switch 
                    checked={general.startTracking} 
                    onCheckedChange={(checked) => handleGeneralChange('startTracking', checked)} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Show notifications</Label>
                    <p className="text-sm text-neutral-500">Display notifications for focus sessions and insights</p>
                  </div>
                  <Switch 
                    checked={general.showNotifications} 
                    onCheckedChange={(checked) => handleGeneralChange('showNotifications', checked)} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Launch on browser startup</Label>
                    <p className="text-sm text-neutral-500">Start TimeTrack when your browser launches</p>
                  </div>
                  <Switch 
                    checked={general.startOnBoot} 
                    onCheckedChange={(checked) => handleGeneralChange('startOnBoot', checked)} 
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={saveGeneralSettings}
                  disabled={updateGeneralSettings.isPending}
                >
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data Management
              </CardTitle>
              <CardDescription>Manage your browsing data and export options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base mb-2 block">Storage Preferences</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="storageLimit" className="text-sm">Keep data for (days)</Label>
                      <Input 
                        id="storageLimit"
                        type="number" 
                        min="1" 
                        max="365" 
                        value={data.storageLimit} 
                        onChange={(e) => handleDataChange('storageLimit', parseInt(e.target.value))} 
                        className="mt-1"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Maximum number of days to store browsing data</p>
                    </div>
                    <div>
                      <Label htmlFor="autoDelete" className="text-sm">Auto-delete after (days)</Label>
                      <Input 
                        id="autoDelete"
                        type="number" 
                        min="1" 
                        max="365" 
                        value={data.autoDelete} 
                        onChange={(e) => handleDataChange('autoDelete', parseInt(e.target.value))} 
                        className="mt-1"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Automatically delete data older than this</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={saveDataSettings}
                    disabled={updateDataSettings.isPending}
                  >
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save Data Settings
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <Label className="text-base mb-4 block">Data Actions</Label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      variant="outline" 
                      onClick={exportData}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export Data
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear all your browsing data? This action cannot be undone.')) {
                          clearAllData.mutate();
                        }
                      }}
                      disabled={clearAllData.isPending}
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About TimeTrack</CardTitle>
              <CardDescription>Information about this extension</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">TimeTrack Browser Extension</h3>
                <p className="text-sm text-neutral-500 mt-1">Version 1.0.0</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Track time spent on websites</li>
                  <li>Analyze your browsing habits</li>
                  <li>Project future usage based on patterns</li>
                  <li>Block distracting websites with Focus Mode</li>
                  <li>View detailed analytics and insights</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Privacy</h4>
                <p className="text-sm text-neutral-500">
                  TimeTrack stores all your data locally in your browser. No data is sent to remote servers.
                  Your browsing activity remains private and is only stored on your device.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
