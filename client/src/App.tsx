import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { DatasetProvider } from "./context/DatasetContext";
import { Layout } from "./components/Layout";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Analytics from "./pages/Analytics";
import Analysis from "./pages/Analysis";
import Recommendations from "./pages/Recommendations";
import Simulation from "./pages/Simulation";
import Forecasting from "./pages/Forecasting";
import Copilot from "./pages/Copilot";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      
      {/* Dashboard Routes wrapped in Layout */}
      <Route path="/dashboard"><Layout><Dashboard /></Layout></Route>
      <Route path="/upload"><Layout><Upload /></Layout></Route>
      <Route path="/analytics"><Layout><Analytics /></Layout></Route>
      <Route path="/analysis"><Layout><Analysis /></Layout></Route>
      <Route path="/recommendations"><Layout><Recommendations /></Layout></Route>
      <Route path="/simulation"><Layout><Simulation /></Layout></Route>
      <Route path="/forecasting"><Layout><Forecasting /></Layout></Route>
      <Route path="/copilot"><Layout><Copilot /></Layout></Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DatasetProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </DatasetProvider>
    </QueryClientProvider>
  );
}

export default App;
