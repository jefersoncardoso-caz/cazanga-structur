import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingState {
  isLoading: boolean;
  loadingMessage: string;
  progress: number;
}

interface LoadingContextType {
  loading: LoadingState;
  setLoading: (loading: Partial<LoadingState>) => void;
  startLoading: (message: string) => void;
  updateProgress: (progress: number, message?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingMessage: '',
    progress: 0
  });

  const setLoading = (updates: Partial<LoadingState>) => {
    setLoadingState(prev => ({ ...prev, ...updates }));
  };

  const startLoading = (message: string) => {
    setLoadingState({
      isLoading: true,
      loadingMessage: message,
      progress: 0
    });
  };

  const updateProgress = (progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress,
      ...(message && { loadingMessage: message })
    }));
  };

  const stopLoading = () => {
    setLoadingState({
      isLoading: false,
      loadingMessage: '',
      progress: 0
    });
  };

  return (
    <LoadingContext.Provider value={{ loading, setLoading, startLoading, updateProgress, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};