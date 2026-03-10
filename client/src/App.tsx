import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useCurrentUser } from "@/hooks/use-auth";

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

function RouteGuard({
  children,
  requireAuth,
}: {
  children: React.ReactNode;
  requireAuth: boolean;
}) {
  const { data: currentUser, isLoading } = useCurrentUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (requireAuth && !currentUser) {
      setLocation("/auth");
      return;
    }

    if (!requireAuth && currentUser) {
      setLocation("/dashboard");
    }
  }, [currentUser, isLoading, requireAuth, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (requireAuth && !currentUser) {
    return null;
  }

  if (!requireAuth && currentUser) {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth">
        <RouteGuard requireAuth={false}>
          <Auth />
        </RouteGuard>
      </Route>
      
      {/* Dashboard Routes wrapped in Layout */}
      <Route path="/dashboard"><RouteGuard requireAuth={true}><Layout><Dashboard /></Layout></RouteGuard></Route>
      <Route path="/upload"><RouteGuard requireAuth={true}><Layout><Upload /></Layout></RouteGuard></Route>
      <Route path="/analytics"><RouteGuard requireAuth={true}><Layout><Analytics /></Layout></RouteGuard></Route>
      <Route path="/analysis"><RouteGuard requireAuth={true}><Layout><Analysis /></Layout></RouteGuard></Route>
      <Route path="/recommendations"><RouteGuard requireAuth={true}><Layout><Recommendations /></Layout></RouteGuard></Route>
      <Route path="/simulation"><RouteGuard requireAuth={true}><Layout><Simulation /></Layout></RouteGuard></Route>
      <Route path="/forecasting"><RouteGuard requireAuth={true}><Layout><Forecasting /></Layout></RouteGuard></Route>
      <Route path="/copilot"><RouteGuard requireAuth={true}><Layout><Copilot /></Layout></RouteGuard></Route>

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
