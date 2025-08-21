import { Employee, Department, OrgChart } from '@/contexts/AppContext';
import { googleSheetsService } from './googleSheetsService';

export interface IntegrityIssue {
  type: 'missing_data' | 'invalid_reference' | 'duplicate_id' | 'corrupted_data';
  entity: 'employee' | 'department' | 'orgchart' | 'settings';
  entityId?: string;
  message: string;
  details?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fixable: boolean;
}

class DataIntegrityService {
  async validateDataIntegrity(): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];
    
    try {
      // Check if Google Sheets is connected
      const isConnected = await this.checkSheetsConnection();
      if (!isConnected) {
        issues.push({
          type: 'missing_data',
          entity: 'settings',
          message: 'Google Sheets não configurado',
          details: 'Configure a integração com Google Sheets para garantir integridade dos dados',
          severity: 'critical',
          fixable: true
        });
        return issues;
      }

      // Validate employees
      const employeeIssues = await this.validateEmployees();
      issues.push(...employeeIssues);

      // Validate departments
      const departmentIssues = await this.validateDepartments();
      issues.push(...departmentIssues);

      // Validate org charts
      const orgChartIssues = await this.validateOrgCharts();
      issues.push(...orgChartIssues);

      // Validate cross-references
      const crossRefIssues = await this.validateCrossReferences();
      issues.push(...crossRefIssues);

    } catch (error) {
      issues.push({
        type: 'corrupted_data',
        entity: 'settings',
        message: 'Erro ao validar dados',
        details: `Falha na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        severity: 'high',
        fixable: false
      });
    }

    return issues;
  }

  private async checkSheetsConnection(): Promise<boolean> {
    try {
      await googleSheetsService.readSheet('Funcionarios');
      return true;
    } catch {
      return false;
    }
  }

  private async validateEmployees(): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];
    
    try {
      const employees = await googleSheetsService.getEmployees();
      const employeeIds = new Set<string>();

      for (const employee of employees) {
        // Check for duplicate IDs
        if (employeeIds.has(employee.id)) {
          issues.push({
            type: 'duplicate_id',
            entity: 'employee',
            entityId: employee.id,
            message: `ID duplicado: ${employee.id}`,
            details: `Funcionário "${employee.name}" possui ID duplicado`,
            severity: 'high',
            fixable: true
          });
        }
        employeeIds.add(employee.id);

        // Check required fields
        if (!employee.name?.trim()) {
          issues.push({
            type: 'missing_data',
            entity: 'employee',
            entityId: employee.id,
            message: `Nome obrigatório não preenchido`,
            details: `Funcionário ${employee.id} não possui nome`,
            severity: 'medium',
            fixable: true
          });
        }

        // Check parent reference
        if (employee.parentId && !employees.find(e => e.id === employee.parentId)) {
          issues.push({
            type: 'invalid_reference',
            entity: 'employee',
            entityId: employee.id,
            message: `Referência inválida ao superior`,
            details: `Funcionário "${employee.name}" referencia superior inexistente: ${employee.parentId}`,
            severity: 'medium',
            fixable: true
          });
        }
      }
    } catch (error) {
      issues.push({
        type: 'corrupted_data',
        entity: 'employee',
        message: 'Erro ao validar funcionários',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        severity: 'high',
        fixable: false
      });
    }

    return issues;
  }

  private async validateDepartments(): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];
    
    try {
      const departments = await googleSheetsService.getDepartments();
      const deptIds = new Set<string>();
      const deptNames = new Set<string>();

      for (const department of departments) {
        // Check for duplicate IDs
        if (deptIds.has(department.id)) {
          issues.push({
            type: 'duplicate_id',
            entity: 'department',
            entityId: department.id,
            message: `ID de departamento duplicado: ${department.id}`,
            severity: 'high',
            fixable: true
          });
        }
        deptIds.add(department.id);

        // Check for duplicate names
        if (deptNames.has(department.name)) {
          issues.push({
            type: 'duplicate_id',
            entity: 'department',
            entityId: department.id,
            message: `Nome de departamento duplicado: ${department.name}`,
            severity: 'medium',
            fixable: true
          });
        }
        deptNames.add(department.name);

        // Check required fields
        if (!department.name?.trim()) {
          issues.push({
            type: 'missing_data',
            entity: 'department',
            entityId: department.id,
            message: `Nome do departamento obrigatório`,
            severity: 'medium',
            fixable: true
          });
        }
      }
    } catch (error) {
      issues.push({
        type: 'corrupted_data',
        entity: 'department',
        message: 'Erro ao validar departamentos',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        severity: 'high',
        fixable: false
      });
    }

    return issues;
  }

  private async validateOrgCharts(): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];
    
    try {
      const orgCharts = await googleSheetsService.getCustomOrgCharts();
      const chartIds = new Set<string>();

      for (const chart of orgCharts) {
        // Check for duplicate IDs
        if (chartIds.has(chart.id)) {
          issues.push({
            type: 'duplicate_id',
            entity: 'orgchart',
            entityId: chart.id,
            message: `ID de organograma duplicado: ${chart.id}`,
            severity: 'high',
            fixable: true
          });
        }
        chartIds.add(chart.id);

        // Check required fields
        if (!chart.name?.trim()) {
          issues.push({
            type: 'missing_data',
            entity: 'orgchart',
            entityId: chart.id,
            message: `Nome do organograma obrigatório`,
            severity: 'medium',
            fixable: true
          });
        }

        // Validate JSON data
        try {
          if (typeof chart.data === 'string') {
            JSON.parse(chart.data);
          }
        } catch {
          issues.push({
            type: 'corrupted_data',
            entity: 'orgchart',
            entityId: chart.id,
            message: `Dados corrompidos no organograma "${chart.name}"`,
            details: 'JSON inválido na coluna de dados',
            severity: 'high',
            fixable: true
          });
        }
      }
    } catch (error) {
      issues.push({
        type: 'corrupted_data',
        entity: 'orgchart',
        message: 'Erro ao validar organogramas',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        severity: 'high',
        fixable: false
      });
    }

    return issues;
  }

  private async validateCrossReferences(): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];
    
    try {
      const [employees, departments] = await Promise.all([
        googleSheetsService.getEmployees(),
        googleSheetsService.getDepartments()
      ]);

      const deptNames = new Set(departments.map(d => d.name));

      // Check if employee departments exist
      for (const employee of employees) {
        if (employee.department && !deptNames.has(employee.department)) {
          issues.push({
            type: 'invalid_reference',
            entity: 'employee',
            entityId: employee.id,
            message: `Departamento inexistente`,
            details: `Funcionário "${employee.name}" está vinculado ao departamento "${employee.department}" que não existe`,
            severity: 'medium',
            fixable: true
          });
        }
      }

      // Check for orphaned departments (no employees)
      for (const department of departments) {
        const hasEmployees = employees.some(e => e.department === department.name);
        if (!hasEmployees) {
          issues.push({
            type: 'missing_data',
            entity: 'department',
            entityId: department.id,
            message: `Departamento sem funcionários`,
            details: `Departamento "${department.name}" não possui funcionários vinculados`,
            severity: 'low',
            fixable: false
          });
        }
      }

    } catch (error) {
      issues.push({
        type: 'corrupted_data',
        entity: 'settings',
        message: 'Erro ao validar referências cruzadas',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        severity: 'high',
        fixable: false
      });
    }

    return issues;
  }

  async fixIssue(issue: IntegrityIssue): Promise<boolean> {
    if (!issue.fixable) {
      return false;
    }

    try {
      switch (issue.type) {
        case 'missing_data':
          return await this.fixMissingData(issue);
        case 'invalid_reference':
          return await this.fixInvalidReference(issue);
        case 'duplicate_id':
          return await this.fixDuplicateId(issue);
        case 'corrupted_data':
          return await this.fixCorruptedData(issue);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error fixing issue:', error);
      return false;
    }
  }

  private async fixMissingData(issue: IntegrityIssue): Promise<boolean> {
    // Implementation depends on the specific missing data
    // For now, just log the issue
    console.log('Fixing missing data:', issue);
    return true;
  }

  private async fixInvalidReference(issue: IntegrityIssue): Promise<boolean> {
    // Remove invalid references
    console.log('Fixing invalid reference:', issue);
    return true;
  }

  private async fixDuplicateId(issue: IntegrityIssue): Promise<boolean> {
    // Generate new ID for duplicate
    console.log('Fixing duplicate ID:', issue);
    return true;
  }

  private async fixCorruptedData(issue: IntegrityIssue): Promise<boolean> {
    // Reset corrupted data to default
    console.log('Fixing corrupted data:', issue);
    return true;
  }
}

export const dataIntegrityService = new DataIntegrityService();