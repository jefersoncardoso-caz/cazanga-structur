import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { googleSheetsService } from '@/services/googleSheetsService';
import { useToast } from '@/hooks/use-toast';

export const useAutoSync = () => {
  const { state } = useApp();
  const { toast } = useToast();

  // Auto-sync whenever data changes
  useEffect(() => {
    const syncToSheets = async () => {
      // Only sync if Google Sheets is configured and connected
      if (localStorage.getItem('google_sheets_connected') !== 'true') {
        return;
      }

      try {
        // Sync site settings
        await googleSheetsService.updateSiteSettings(state.siteSettings);
        console.log('Auto-synced site settings to Google Sheets');
      } catch (error) {
        console.warn('Failed to auto-sync to Google Sheets:', error);
      }
    };

    // Debounce the sync to avoid too many requests
    const timeoutId = setTimeout(syncToSheets, 2000);
    return () => clearTimeout(timeoutId);
  }, [state.siteSettings]);

  const manualSync = async () => {
    if (localStorage.getItem('google_sheets_connected') !== 'true') {
      toast({
        title: "Google Sheets não configurado",
        description: "Configure a integração primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      // Sync all data
      await Promise.all([
        googleSheetsService.updateSiteSettings(state.siteSettings),
        // Add other sync operations as needed
      ]);

      toast({
        title: "Sincronização completa",
        description: "Todos os dados foram sincronizados com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Falha ao sincronizar alguns dados",
        variant: "destructive"
      });
    }
  };

  return { manualSync };
};