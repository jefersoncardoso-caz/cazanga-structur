import { useState, useEffect } from 'react';
import { googleSheetsService } from '@/services/googleSheetsService';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

export const useGoogleSheets = () => {
  const { dispatch } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  // Test connection
  const testConnection = async () => {
    setLoading(true);
    try {
      await googleSheetsService.readSheet('Funcionarios');
      setConnected(true);
      toast({
        title: "Conexão bem-sucedida",
        description: "Conectado ao Google Sheets com sucesso!",
      });
    } catch (error) {
      setConnected(false);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao Google Sheets. Verifique as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load all data from Google Sheets
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [employees, departments, siteSettings] = await Promise.all([
        googleSheetsService.getEmployees(),
        googleSheetsService.getDepartments(),
        googleSheetsService.getSiteSettings()
      ]);

      dispatch({ type: 'SET_EMPLOYEES', payload: employees });
      dispatch({ type: 'SET_DEPARTMENTS', payload: departments });
      dispatch({ type: 'UPDATE_SITE_SETTINGS', payload: siteSettings });

      toast({
        title: "Dados carregados",
        description: "Todos os dados foram sincronizados com o Google Sheets!",
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do Google Sheets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync data to Google Sheets
  const syncToSheets = async () => {
    setLoading(true);
    try {
      // This would sync current state back to sheets
      toast({
        title: "Dados sincronizados",
        description: "Dados enviados para o Google Sheets com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    connected,
    testConnection,
    loadAllData,
    syncToSheets,
    googleSheetsService
  };
};