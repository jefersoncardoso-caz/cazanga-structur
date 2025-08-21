import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { dataLoaderService } from "@/services/dataLoaderService";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Home from "./pages/Home";
import OrgChart from "./pages/OrgChart";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Iniciando...');

  useEffect(() => {
    const initializeApp = async () => {
      // Add progress listener
      const progressListener = (progress: any) => {
        setLoadingProgress(progress.progress);
        setLoadingMessage(progress.message);
      };

      dataLoaderService.addProgressListener(progressListener);

      try {
        // Load all data from Google Sheets
        await dataLoaderService.loadAllDataWithProgress(dispatch);
        
        // Small delay to show completion
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setLoading(false);
      } finally {
        dataLoaderService.removeProgressListener(progressListener);
      }
    };

    initializeApp();
  }, [dispatch]);
  
  if (loading) {
    return (
      <LoadingScreen 
        progress={loadingProgress}
        message={loadingMessage}
        isVisible={loading}
      />
    );
  }

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
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;