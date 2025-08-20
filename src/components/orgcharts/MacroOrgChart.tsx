import React from 'react';
import { OrgChart, OrgLevel } from '@/components/ui/org-chart';
import { OrgChartNode } from '@/components/ui/org-chart-node';
import { useApp } from '@/contexts/AppContext';

const MacroOrgChart = () => {
  const { state } = useApp();
  const { departments, employees } = state;

  // Helper function to get department by name
  const getDepartmentByName = (name: string) => {
    return departments.find(dept => 
      dept.name.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(dept.name.toLowerCase())
    );
  };

  // Helper function to get employees count for a department
  const getEmployeeCount = (departmentName: string) => {
    return employees.filter(emp => 
      emp.department.toLowerCase().includes(departmentName.toLowerCase()) ||
      departmentName.toLowerCase().includes(emp.department.toLowerCase())
    ).length;
  };

  // Helper function to get managers for a department
  const getManagers = (departmentName: string) => {
    return employees.filter(emp => 
      emp.isManager && 
      (emp.department.toLowerCase().includes(departmentName.toLowerCase()) ||
       departmentName.toLowerCase().includes(emp.department.toLowerCase()))
    );
  };

  // Get all visible departments
  const visibleDepartments = departments.filter(dept => dept.visible !== false);

  return (
    <OrgChart title={`Organograma Macro ${new Date().getFullYear()}`}>
      {/* Directors/Top Level */}
      <OrgLevel>
        {employees.filter(emp => 
          emp.isManager && 
          (emp.position?.toLowerCase().includes('diretor') || 
           emp.position?.toLowerCase().includes('sócio') ||
           emp.department?.toLowerCase().includes('diretoria'))
        ).map(manager => (
          <OrgChartNode 
            key={manager.id}
            title={manager.position || manager.name} 
            variant="manager"
          />
        ))}
        
        {/* Fallback if no directors found */}
        {employees.filter(emp => 
          emp.isManager && 
          (emp.position?.toLowerCase().includes('diretor') || 
           emp.position?.toLowerCase().includes('sócio') ||
           emp.department?.toLowerCase().includes('diretoria'))
        ).length === 0 && (
          <OrgChartNode 
            title="DIRETORIA" 
            variant="manager"
          />
        )}
      </OrgLevel>

      {/* Connection Line */}
      <div className="flex justify-center mb-4">
        <div className="w-px h-8 bg-primary"></div>
      </div>

      {/* Departments/Gerências */}
      <OrgLevel className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {visibleDepartments.map(department => {
          const departmentEmployees = employees.filter(emp => 
            emp.department === department.name && emp.visible !== false
          );
          const managers = departmentEmployees.filter(emp => emp.isManager);
          const regularEmployees = departmentEmployees.filter(emp => !emp.isManager);

          return (
            <div key={department.id} className="flex flex-col items-center">
              {/* Department Manager or Department Name */}
              {managers.length > 0 ? (
                managers.map(manager => (
                  <OrgChartNode 
                    key={manager.id}
                    title={manager.position || `GERENTE DE ${department.name.toUpperCase()}`}
                    subtitle={manager.name}
                    variant="team"
                  />
                ))
              ) : (
                <OrgChartNode 
                  title={department.name.toUpperCase()}
                  variant="team"
                  count={departmentEmployees.length}
                />
              )}

              {/* Department Teams/Employees */}
              {regularEmployees.length > 0 && (
                <div className="mt-4 space-y-2">
                  {/* Group by team */}
                  {Array.from(new Set(regularEmployees.map(emp => emp.team || 'Geral'))).map(team => {
                    const teamEmployees = regularEmployees.filter(emp => (emp.team || 'Geral') === team);
                    return (
                      <OrgChartNode 
                        key={`${department.id}-${team}`}
                        title={team.toUpperCase()} 
                        count={teamEmployees.length}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Show message if no departments */}
        {visibleDepartments.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">
            <p>Nenhum departamento configurado.</p>
            <p className="text-sm">Configure departamentos no painel administrativo.</p>
          </div>
        )}
      </OrgLevel>
    </OrgChart>
  );
};

export default MacroOrgChart;