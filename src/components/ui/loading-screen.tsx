import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, Building2 } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';

const LoadingScreen: React.FC = () => {
  const { loading } = useLoading();

  if (!loading.isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4 text-center space-y-6">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <Building2 className="w-16 h-16 text-primary" />
            <Loader2 className="w-6 h-6 text-primary animate-spin absolute -top-1 -right-1" />
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Carregando dados...
          </h3>
          <p className="text-sm text-muted-foreground">
            {loading.loadingMessage}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={loading.progress} className="w-full" />
          <p className="text-xs text-muted-foreground">
            {loading.progress}% concluído
          </p>
        </div>

        {/* Additional Info */}
        <p className="text-xs text-muted-foreground">
          Carregando dados do Google Sheets...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;