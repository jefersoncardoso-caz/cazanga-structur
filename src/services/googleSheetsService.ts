import { Employee, Department, SiteSettings } from '@/contexts/AppContext';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';

class GoogleSheetsService {
  private baseUrl = `${SUPABASE_URL}/functions/v1/google-sheets`;

  async readSheet(sheetName: string): Promise<string[][]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=read&sheet=${sheetName}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to read sheet');
      }
      
      return data.values || [];
    } catch (error) {
      console.error('Error reading sheet:', error);
      throw error;
    }
  }

  async writeSheet(sheetName: string, values: string[][], range: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}?action=write&sheet=${sheetName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values, range }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to write sheet');
      }
    } catch (error) {
      console.error('Error writing sheet:', error);
      throw error;
    }
  }

  async appendSheet(sheetName: string, values: string[][]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}?action=append&sheet=${sheetName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to append to sheet');
      }
    } catch (error) {
      console.error('Error appending to sheet:', error);
      throw error;
    }
  }

  // Funcionários
  async getEmployees(): Promise<Employee[]> {
    const values = await this.readSheet('Funcionarios');
    if (values.length <= 1) return []; // Skip header row
    
    return values.slice(1).map((row, index) => ({
      id: row[0] || `emp-${index}`,
      name: row[1] || '',
      position: row[2] || '',
      department: row[3] || '',
      team: row[4] || '',
      description: row[5] || '',
      photo: row[6] || '',
      isManager: row[7]?.toLowerCase() === 'true',
      parentId: row[8] || '',
      visible: row[9]?.toLowerCase() !== 'false'
    }));
  }

  async addEmployee(employee: Employee): Promise<void> {
    const values = [[
      employee.id,
      employee.name,
      employee.position,
      employee.department,
      employee.team || '',
      employee.description || '',
      employee.photo || '',
      employee.isManager ? 'true' : 'false',
      employee.parentId || '',
      employee.visible !== false ? 'true' : 'false'
    ]];
    
    await this.appendSheet('Funcionarios', values);
  }

  async updateEmployee(employee: Employee): Promise<void> {
    const allValues = await this.readSheet('Funcionarios');
    const headerRow = allValues[0];
    const dataRows = allValues.slice(1);
    
    const rowIndex = dataRows.findIndex(row => row[0] === employee.id);
    if (rowIndex === -1) {
      throw new Error('Employee not found');
    }
    
    const updatedRow = [
      employee.id,
      employee.name,
      employee.position,
      employee.department,
      employee.team || '',
      employee.description || '',
      employee.photo || '',
      employee.isManager ? 'true' : 'false',
      employee.parentId || '',
      employee.visible !== false ? 'true' : 'false'
    ];
    
    dataRows[rowIndex] = updatedRow;
    const allUpdatedValues = [headerRow, ...dataRows];
    
    await this.writeSheet('Funcionarios', allUpdatedValues, 'A:J');
  }

  // Departamentos
  async getDepartments(): Promise<Department[]> {
    const values = await this.readSheet('Departamentos');
    if (values.length <= 1) return [];
    
    const employees = await this.getEmployees();
    
    return values.slice(1).map(row => ({
      id: row[0] || '',
      name: row[1] || '',
      color: row[2] || '#1f4e78',
      visible: row[3]?.toLowerCase() !== 'false',
      employees: employees.filter(emp => emp.department === row[1])
    }));
  }

  async addDepartment(department: Omit<Department, 'employees'>): Promise<void> {
    const values = [[
      department.id,
      department.name,
      department.color,
      department.visible !== false ? 'true' : 'false'
    ]];
    
    await this.appendSheet('Departamentos', values);
  }

  // Configurações do Site
  async getSiteSettings(): Promise<SiteSettings> {
    try {
      const values = await this.readSheet('Configuracoes');
      if (values.length <= 1) {
        return {
          companyName: 'Cazanga',
          primaryColor: '#1f4e78',
          secondaryColor: '#548235',
          introText: 'Explore nossa estrutura organizacional de forma interativa e detalhada.',
          carouselImages: []
        };
      }
      
      const settings: any = {};
      values.slice(1).forEach(row => {
        const key = row[0];
        const value = row[1];
        if (key === 'carouselImages') {
          settings[key] = value ? value.split(',').map(url => url.trim()) : [];
        } else {
          settings[key] = value;
        }
      });
      
      return {
        companyName: settings.companyName || 'Cazanga',
        primaryColor: settings.primaryColor || '#1f4e78',
        secondaryColor: settings.secondaryColor || '#548235',
        introText: settings.introText || 'Explore nossa estrutura organizacional de forma interativa e detalhada.',
        carouselImages: settings.carouselImages || [],
        logo: settings.logo || ''
      };
    } catch (error) {
      console.error('Error getting site settings:', error);
      return {
        companyName: 'Cazanga',
        primaryColor: '#1f4e78',
        secondaryColor: '#548235',
        introText: 'Explore nossa estrutura organizacional de forma interativa e detalhada.',
        carouselImages: []
      };
    }
  }

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
    const currentSettings = await this.getSiteSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    const values = [
      ['Setting', 'Value'],
      ['companyName', updatedSettings.companyName],
      ['primaryColor', updatedSettings.primaryColor],
      ['secondaryColor', updatedSettings.secondaryColor],
      ['introText', updatedSettings.introText],
      ['logo', updatedSettings.logo || ''],
      ['carouselImages', updatedSettings.carouselImages.join(', ')]
    ];
    
    await this.writeSheet('Configuracoes', values, 'A:B');
  }

  // Organogramas personalizados
  async getCustomOrgCharts(): Promise<any[]> {
    try {
      const values = await this.readSheet('Organogramas');
      if (values.length <= 1) return [];
      
      return values.slice(1).map(row => ({
        id: row[0],
        name: row[1],
        type: row[2],
        data: row[3] ? JSON.parse(row[3]) : {},
        visible: row[4]?.toLowerCase() !== 'false'
      }));
    } catch (error) {
      console.error('Error getting custom org charts:', error);
      return [];
    }
  }

  async addCustomOrgChart(orgChart: any): Promise<void> {
    const values = [[
      orgChart.id,
      orgChart.name,
      orgChart.type,
      JSON.stringify(orgChart.data),
      orgChart.visible !== false ? 'true' : 'false'
    ]];
    
    await this.appendSheet('Organogramas', values);
  }
}

export const googleSheetsService = new GoogleSheetsService();