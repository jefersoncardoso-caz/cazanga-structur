import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { AppProvider, useApp } from "@/contexts/AppContext";
import LoadingScreen from "@/components/ui/loading-screen";
import Home from "./pages/Home";
import OrgChart from "./pages/OrgChart";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { state } = useApp();
  
  switch (state.currentView) {
    case 'home':
      return <Home />;
    case 'orgchart':
      return <OrgChart />;
    case 'admin':
      return <AdminPanel />;
    default:
      return <NotFound />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LoadingProvider>
      <AppProvider>
        <TooltipProvider>
          <LoadingScreen />
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AppProvider>
    </LoadingProvider>
  </QueryClientProvider>
);

export default App;
