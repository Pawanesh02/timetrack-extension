import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TimeTrackProvider } from "@/contexts/TimeTrackContext";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import FocusModePage from "@/pages/FocusModePage";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/focus" component={FocusModePage} />
      <Route path="/settings" component={Settings} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TimeTrackProvider>
        <Router />
        <Toaster />
      </TimeTrackProvider>
    </QueryClientProvider>
  );
}

export default App;
