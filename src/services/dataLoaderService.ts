import { googleSheetsService } from './googleSheetsService';
import { errorHandlingService } from './errorHandlingService';

export interface LoadingProgress {
  progress: number;
  message: string;
  step: string;
}

class DataLoaderService {
  private listeners: ((progress: LoadingProgress) => void)[] = [];

  addProgressListener(listener: (progress: LoadingProgress) => void) {
    this.listeners.push(listener);
  }

  removeProgressListener(listener: (progress: LoadingProgress) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyProgress(progress: number, message: string, step: string) {
    this.listeners.forEach(listener => {
      listener({ progress, message, step });
    });
  }

  async loadAllDataWithProgress(dispatch: any): Promise<boolean> {
    try {
      this.notifyProgress(0, 'Iniciando carregamento...', 'init');

      // Check connection first
      this.notifyProgress(10, 'Verificando conexão com Google Sheets...', 'connection');
      const isConnected = await this.checkConnection();
      
      if (!isConnected) {
        this.notifyProgress(100, 'Google Sheets não configurado', 'error');
        return false;
      }

      // Load site settings
      this.notifyProgress(25, 'Carregando configurações do site...', 'settings');
      const siteSettings = await googleSheetsService.getSiteSettings();
      dispatch({ type: 'SET_SITE_SETTINGS', payload: siteSettings });

      // Load departments
      this.notifyProgress(45, 'Carregando departamentos...', 'departments');
      const departments = await googleSheetsService.getDepartments();
      dispatch({ type: 'SET_DEPARTMENTS', payload: departments });

      // Load employees
      this.notifyProgress(65, 'Carregando funcionários...', 'employees');
      const employees = await googleSheetsService.getEmployees();
      dispatch({ type: 'SET_EMPLOYEES', payload: employees });

      // Load org charts
      this.notifyProgress(85, 'Carregando organogramas...', 'orgcharts');
      const orgCharts = await googleSheetsService.getCustomOrgCharts();
      dispatch({ type: 'SET_ORGCHARTS', payload: orgCharts });

      // Final steps
      this.notifyProgress(95, 'Finalizando carregamento...', 'finalize');
      dispatch({ type: 'SET_DATA_LOADED', payload: true });
      dispatch({ type: 'SET_LAST_SYNC_TIME', payload: new Date() });

      this.notifyProgress(100, 'Carregamento concluído!', 'complete');
      
      return true;
    } catch (error) {
      console.error('Error loading data:', error);
      
      const appError = errorHandlingService.handleGoogleSheetsError(error);
      errorHandlingService.logError(appError);
      
      this.notifyProgress(100, 'Erro no carregamento', 'error');
      
      // Set empty data but mark as loaded to prevent infinite loading
      dispatch({ type: 'SET_DATA_LOADED', payload: true });
      
      return false;
    }
  }

  private async checkConnection(): Promise<boolean> {
    try {
      const spreadsheetId = localStorage.getItem('google_sheets_spreadsheet_id');
      const apiKey = localStorage.getItem('google_api_key');
      
      if (!spreadsheetId || !apiKey) {
        return false;
      }

      await googleSheetsService.readSheet('Funcionarios');
      localStorage.setItem('google_sheets_connected', 'true');
      return true;
    } catch (error) {
      localStorage.setItem('google_sheets_connected', 'false');
      return false;
    }
  }

  async validateDataStructure(): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    try {
      // Check required sheets
      const requiredSheets = ['Funcionarios', 'Departamentos', 'Configuracoes', 'Organogramas'];
      
      for (const sheetName of requiredSheets) {
        try {
          const data = await googleSheetsService.readSheet(sheetName);
          if (data.length === 0) {
            issues.push(`Aba "${sheetName}" não encontrada ou vazia`);
          } else if (data.length === 1) {
            suggestions.push(`Aba "${sheetName}" existe mas não possui dados`);
          }
        } catch (error) {
          issues.push(`Erro ao acessar aba "${sheetName}"`);
        }
      }

      // Validate data consistency
      if (issues.length === 0) {
        const [employees, departments] = await Promise.all([
          googleSheetsService.getEmployees(),
          googleSheetsService.getDepartments()
        ]);

        // Check for orphaned employees
        const validDepartments = departments.map(d => d.name);
        const orphanedEmployees = employees.filter(emp => 
          emp.department && !validDepartments.includes(emp.department)
        );

        if (orphanedEmployees.length > 0) {
          suggestions.push(`${orphanedEmployees.length} funcionário(s) com departamento inválido`);
        }

        // Check for circular references
        const circularRefs = employees.filter(emp => {
          if (!emp.parentId) return false;
          let current = emp.parentId;
          let depth = 0;
          while (current && depth < 10) {
            if (current === emp.id) return true;
            const parent = employees.find(e => e.id === current);
            current = parent?.parentId;
            depth++;
          }
          return false;
        });

        if (circularRefs.length > 0) {
          issues.push(`${circularRefs.length} referência(s) circular(es) na hierarquia`);
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
        suggestions
      };
    } catch (error) {
      return {
        isValid: false,
        issues: ['Erro ao validar estrutura de dados'],
        suggestions: []
      };
    }
  }

  async createBackup(): Promise<string> {
    try {
      const [employees, departments, siteSettings, orgCharts] = await Promise.all([
        googleSheetsService.getEmployees(),
        googleSheetsService.getDepartments(),
        googleSheetsService.getSiteSettings(),
        googleSheetsService.getCustomOrgCharts()
      ]);

      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          employees,
          departments,
          siteSettings,
          orgCharts
        },
        metadata: {
          totalEmployees: employees.length,
          totalDepartments: departments.length,
          totalOrgCharts: orgCharts.length
        }
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-organograma-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      return 'Backup criado com sucesso';
    } catch (error) {
      throw new Error('Erro ao criar backup: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  }
}

export const dataLoaderService = new DataLoaderService();