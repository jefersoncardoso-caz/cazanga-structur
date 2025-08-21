import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Building2, Database, Users, Settings } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface LoadingScreenProps {
  progress: number;
  message: string;
  isVisible: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, message, isVisible }) => {
  const { state } = useApp();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md p-8 text-center shadow-xl">
        <div className="mb-6">
          {state.siteSettings.logo ? (
            <img 
              src={state.siteSettings.logo} 
              alt={`Logo ${state.siteSettings.companyName}`}
              className="h-16 w-auto mx-auto mb-4 object-contain"
            />
          ) : (
            <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
          )}
          <h2 className="text-xl font-bold text-primary mb-2">
            {state.siteSettings.companyName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Carregando dados do sistema...
          </p>
        </div>

        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {progress < 25 && <Settings className="w-4 h-4 animate-spin" />}
            {progress >= 25 && progress < 50 && <Database className="w-4 h-4 animate-pulse" />}
            {progress >= 50 && progress < 75 && <Users className="w-4 h-4 animate-bounce" />}
            {progress >= 75 && <Building2 className="w-4 h-4 animate-pulse" />}
            <span>{message}</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {progress}% concluído
          </div>
        </div>
      </Card>
    </div>
  );
};