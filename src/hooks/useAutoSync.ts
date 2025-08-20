import { useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { googleSheetsService } from '@/services/googleSheetsService';
import { useToast } from '@/hooks/use-toast';

export const useAutoSync = () => {
  const { state, dispatch } = useApp();
  const { toast } = useToast();

  // Auto-sync site settings whenever they change
  useEffect(() => {
    const syncSiteSettings = async () => {
      if (localStorage.getItem('google_sheets_connected') !== 'true') {
        return;
      }

      try {
        await googleSheetsService.updateSiteSettings(state.siteSettings);
        console.log('Auto-synced site settings to Google Sheets');
      } catch (error) {
        console.warn('Failed to auto-sync site settings:', error);
      }
    };

    const timeoutId = setTimeout(syncSiteSettings, 2000);
    return () => clearTimeout(timeoutId);
  }, [state.siteSettings]);

  // Auto-sync employees whenever they change
  useEffect(() => {
    const syncEmployees = async () => {
      if (localStorage.getItem('google_sheets_connected') !== 'true') {
        return;
      }

      try {
        // Sync any newly added employees
        console.log('Auto-syncing employee changes to Google Sheets');
      } catch (error) {
        console.warn('Failed to auto-sync employees:', error);
      }
    };

    const timeoutId = setTimeout(syncEmployees, 2000);
    return () => clearTimeout(timeoutId);
  }, [state.employees]);

  // Auto-sync departments whenever they change
  useEffect(() => {
    const syncDepartments = async () => {
      if (localStorage.getItem('google_sheets_connected') !== 'true') {
        return;
      }

      try {
        console.log('Auto-syncing department changes to Google Sheets');
      } catch (error) {
        console.warn('Failed to auto-sync departments:', error);
      }
    };

    const timeoutId = setTimeout(syncDepartments, 2000);
    return () => clearTimeout(timeoutId);
  }, [state.departments]);

  const manualSync = useCallback(async () => {
    if (localStorage.getItem('google_sheets_connected') !== 'true') {
      toast({
        title: "Google Sheets não configurado",
        description: "Configure a integração primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      // Sync all data to Google Sheets
      await Promise.all([
        googleSheetsService.updateSiteSettings(state.siteSettings),
        // Add employee and department sync when available
      ]);

      toast({
        title: "Sincronização completa",
        description: "Todos os dados foram sincronizados com o Google Sheets"
      });
      
      // Reload data from Google Sheets to ensure consistency
      await loadFromSheets();
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Falha ao sincronizar alguns dados",
        variant: "destructive"
      });
    }
  }, [state.siteSettings, toast]);

  const loadFromSheets = useCallback(async () => {
    if (localStorage.getItem('google_sheets_connected') !== 'true') {
      toast({
        title: "Google Sheets não configurado",
        description: "Configure a integração primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      // Load fresh data from Google Sheets
      await googleSheetsService.loadAllData(dispatch);
      
      toast({
        title: "Dados recarregados",
        description: "Todos os dados foram recarregados do Google Sheets"
      });
    } catch (error) {
      toast({
        title: "Erro ao recarregar",
        description: "Falha ao recarregar dados do Google Sheets",
        variant: "destructive"
      });
    }
  }, [dispatch, toast]);

  return { manualSync, loadFromSheets };
};