import React from 'react';
import { OrgChart, OrgLevel } from '@/components/ui/org-chart';
import { OrgChartNode } from '@/components/ui/org-chart-node';
import { useApp } from '@/contexts/AppContext';

interface MacroOrgChartProps {
  orgChart: any;
}

const MacroOrgChart: React.FC<MacroOrgChartProps> = ({ orgChart }) => {
  const { state } = useApp();
  const { departments, employees } = state;

  // Check if Google Sheets is connected
  const isConnected = localStorage.getItem('google_sheets_connected') === 'true';
  
  if (!isConnected) {
    return (
      <OrgChart title={orgChart?.name || "Organograma Macro"}>
        <div className="text-center text-muted-foreground py-8">
          <p>Google Sheets não configurado.</p>
          <p className="text-sm">Configure a integração no painel administrativo.</p>
        </div>
      </OrgChart>
    );
  }

  // Only show data if we have employees and departments from Google Sheets
  if (!employees.length && !departments.length) {
    return (
      <OrgChart title={orgChart?.name || "Organograma Macro"}>
        <div className="text-center text-muted-foreground py-8">
          <p>Nenhum dado encontrado no Google Sheets.</p>
          <p className="text-sm">Adicione funcionários e departamentos no painel administrativo.</p>
        </div>
      </OrgChart>
    );
  }

  // Get all visible departments
  const visibleDepartments = departments.filter(dept => dept.visible !== false);

  // Get directors and executives
  const socios = employees.filter(emp => 
    emp.isManager && emp.position?.toLowerCase().includes('sócio')
  );
  
  const diretoresExecutivos = employees.filter(emp => 
    emp.isManager && emp.position?.toLowerCase().includes('diretor executivo')
  );
  
  const diretores = employees.filter(emp => 
    emp.isManager && 
    emp.position?.toLowerCase().includes('diretor') &&
    !emp.position?.toLowerCase().includes('diretor executivo')
  );

  return (
    <OrgChart title={orgChart?.name || "Organograma Macro"}>
      {/* Sócios */}
      {socios.length > 0 && (
        <>
          <OrgLevel>
            {socios.map(socio => (
              <OrgChartNode 
                key={socio.id}
                title={socio.position} 
                subtitle={socio.name}
                variant="manager"
              />
            ))}
          </OrgLevel>
          <div className="flex justify-center mb-4">
            <div className="w-px h-8 bg-primary"></div>
          </div>
        </>
      )}

      {/* Diretores Executivos */}
      {diretoresExecutivos.length > 0 && (
        <>
          <OrgLevel>
            {diretoresExecutivos.map(diretor => (
              <OrgChartNode 
                key={diretor.id}
                title={diretor.position} 
                subtitle={diretor.name}
                variant="manager"
              />
            ))}
          </OrgLevel>
          <div className="flex justify-center mb-4">
            <div className="w-px h-8 bg-primary"></div>
          </div>
        </>
      )}

      {/* Diretores */}
      {diretores.length > 0 && (
        <>
          <OrgLevel>
            {diretores.map(diretor => (
              <OrgChartNode 
                key={diretor.id}
                title={diretor.position} 
                subtitle={diretor.name}
                variant="manager"
              />
            ))}
          </OrgLevel>
          <div className="flex justify-center mb-4">
            <div className="w-px h-8 bg-primary"></div>
          </div>
        </>
      )}

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
      </OrgLevel>
    </OrgChart>
  );
};

export default MacroOrgChart;