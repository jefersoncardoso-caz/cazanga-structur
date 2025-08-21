import { googleSheetsService } from './googleSheetsService';
import { dataLoaderService } from './dataLoaderService';

export interface BackupData {
  timestamp: string;
  version: string;
  data: {
    employees: any[];
    departments: any[];
    siteSettings: any;
    orgCharts: any[];
  };
  metadata: {
    totalEmployees: number;
    totalDepartments: number;
    totalOrgCharts: number;
    source: 'google_sheets' | 'local';
  };
}

class BackupService {
  async createFullBackup(): Promise<string> {
    try {
      const [employees, departments, siteSettings, orgCharts] = await Promise.all([
        googleSheetsService.getEmployees(),
        googleSheetsService.getDepartments(),
        googleSheetsService.getSiteSettings(),
        googleSheetsService.getCustomOrgCharts()
      ]);

      const backup: BackupData = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        data: {
          employees,
          departments,
          siteSettings,
          orgCharts
        },
        metadata: {
          totalEmployees: employees.length,
          totalDepartments: departments.length,
          totalOrgCharts: orgCharts.length,
          source: 'google_sheets'
        }
      };

      return this.downloadBackup(backup);
    } catch (error) {
      throw new Error('Erro ao criar backup: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  }

  private downloadBackup(backup: BackupData): string {
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-organograma-${backup.timestamp.split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    return `Backup criado: backup-organograma-${backup.timestamp.split('T')[0]}.json`;
  }

  async restoreFromBackup(file: File, dispatch: any): Promise<string> {
    try {
      const fileContent = await file.text();
      const backup: BackupData = JSON.parse(fileContent);

      // Validate backup structure
      if (!backup.data || !backup.timestamp) {
        throw new Error('Arquivo de backup inválido');
      }

      // Restore to Google Sheets
      if (backup.data.siteSettings) {
        await googleSheetsService.updateSiteSettings(backup.data.siteSettings);
      }

      // Restore employees
      if (backup.data.employees && backup.data.employees.length > 0) {
        // Clear existing data and restore
        const headers = [['ID', 'Nome', 'Cargo', 'Departamento', 'Equipe', 'Descrição', 'Foto (URL)', 'É Gerente', 'ID do Superior', 'Visível']];
        const employeeRows = backup.data.employees.map(emp => [
          emp.id,
          emp.name,
          emp.position,
          emp.department,
          emp.team || '',
          emp.description || '',
          emp.photo || '',
          emp.isManager ? 'true' : 'false',
          emp.parentId || '',
          emp.visible !== false ? 'true' : 'false'
        ]);
        
        await googleSheetsService.writeSheet('Funcionarios', [...headers, ...employeeRows], 'A:J');
      }

      // Restore departments
      if (backup.data.departments && backup.data.departments.length > 0) {
        const headers = [['ID', 'Nome', 'Cor', 'Visível']];
        const deptRows = backup.data.departments.map(dept => [
          dept.id,
          dept.name,
          dept.color,
          dept.visible !== false ? 'true' : 'false'
        ]);
        
        await googleSheetsService.writeSheet('Departamentos', [...headers, ...deptRows], 'A:D');
      }

      // Restore org charts
      if (backup.data.orgCharts && backup.data.orgCharts.length > 0) {
        const headers = [['ID', 'Nome', 'Tipo', 'Dados (JSON)', 'Visível']];
        const chartRows = backup.data.orgCharts.map(chart => [
          chart.id,
          chart.name,
          chart.type,
          JSON.stringify(chart.data),
          chart.visible !== false ? 'true' : 'false'
        ]);
        
        await googleSheetsService.writeSheet('Organogramas', [...headers, ...chartRows], 'A:E');
      }

      // Reload data in context
      await googleSheetsService.loadAllData(dispatch);

      return `Backup restaurado com sucesso. ${backup.metadata.totalEmployees} funcionários, ${backup.metadata.totalDepartments} departamentos e ${backup.metadata.totalOrgCharts} organogramas foram restaurados.`;
    } catch (error) {
      throw new Error('Erro ao restaurar backup: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  }

  validateBackup(file: File): Promise<{ isValid: boolean; issues: string[] }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const backup = JSON.parse(content);
          
          const issues: string[] = [];
          
          if (!backup.timestamp) issues.push('Timestamp ausente');
          if (!backup.data) issues.push('Dados ausentes');
          if (!backup.metadata) issues.push('Metadados ausentes');
          
          if (backup.data) {
            if (!Array.isArray(backup.data.employees)) issues.push('Lista de funcionários inválida');
            if (!Array.isArray(backup.data.departments)) issues.push('Lista de departamentos inválida');
            if (!backup.data.siteSettings) issues.push('Configurações do site ausentes');
          }

          resolve({
            isValid: issues.length === 0,
            issues
          });
        } catch (error) {
          resolve({
            isValid: false,
            issues: ['Arquivo JSON inválido']
          });
        }
      };
      reader.readAsText(file);
    });
  }
}

export const backupService = new BackupService();