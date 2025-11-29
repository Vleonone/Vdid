import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import DashboardOverview from "@/pages/dashboard/overview";
import DashboardSecurity from "@/pages/dashboard/security";
import DashboardApps from "@/pages/dashboard/apps";
import DashboardSettings from "@/pages/dashboard/settings";
import Authorize from "@/pages/oauth/authorize";
import Docs from "@/pages/docs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Documentation */}
      <Route path="/docs" component={Docs} />
      
      {/* Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* OAuth Flows */}
      <Route path="/oauth/authorize" component={Authorize} />
      
      {/* Protected Dashboard Routes (Mocked protection) */}
      <Route path="/dashboard" component={DashboardOverview} />
      <Route path="/dashboard/security" component={DashboardSecurity} />
      <Route path="/dashboard/apps" component={DashboardApps} />
      <Route path="/dashboard/settings" component={DashboardSettings} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
