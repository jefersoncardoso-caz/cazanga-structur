import React from 'react';
import { OrgChart, OrgLevel } from '@/components/ui/org-chart';
import { OrgChartNode } from '@/components/ui/org-chart-node';
import { useApp } from '@/contexts/AppContext';

interface GenteGestaoOrgChartProps {
  onSelectTeam: (team: any) => void;  
  orgChart: any;
}

const GenteGestaoOrgChart: React.FC<GenteGestaoOrgChartProps> = ({ onSelectTeam, orgChart }) => {
  const { state } = useApp();
  const { departments, employees } = state;

  // Check if Google Sheets is connected
  const isConnected = localStorage.getItem('google_sheets_connected') === 'true';
  
  if (!isConnected) {
    return (
      <OrgChart title={orgChart?.name || "Organograma Gente e Gestão"}>
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
      <OrgChart title={orgChart?.name || "Organograma Gente e Gestão"}>
        <div className="text-center text-muted-foreground py-8">
          <p>Nenhum dado encontrado no Google Sheets.</p>
          <p className="text-sm">Adicione funcionários e departamentos no painel administrativo.</p>
        </div>
      </OrgChart>
    );
  }

  // Find departments related to "Gente e Gestão" - only from Google Sheets data
  const genteGestaoDepartments = departments.filter(dept => 
    dept.visible !== false && (
      dept.name.toLowerCase().includes('recursos humanos') ||
      dept.name.toLowerCase().includes('gente') ||
      dept.name.toLowerCase().includes('rh') ||
      dept.name.toLowerCase().includes('pessoal') ||
      dept.name.toLowerCase().includes('gestão')
    )
  );

  // Find managers for Gente e Gestão area - only from Google Sheets data
  const genteGestaoManagers = employees.filter(emp => 
    emp.isManager && emp.visible !== false && (
      emp.department?.toLowerCase().includes('recursos humanos') ||
      emp.department?.toLowerCase().includes('gente') ||
      emp.department?.toLowerCase().includes('rh') ||
      emp.position?.toLowerCase().includes('gente') ||
      emp.position?.toLowerCase().includes('recursos humanos')
    )
  );

  return (
    <OrgChart title={orgChart?.name || "Organograma Gente e Gestão"}>
      {/* Gerente de Gente e Gestão */}
      <OrgLevel>
        {genteGestaoManagers.length > 0 ? (
          genteGestaoManagers.map(manager => (
            <OrgChartNode 
              key={manager.id}
              title={manager.position || "GERENTE DE GENTE E GESTÃO"}
              subtitle={manager.name}
              variant="manager"
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <p>Nenhum gerente de Gente e Gestão configurado.</p>
          </div>
        )}
      </OrgLevel>

      {/* Connection Line */}
      {genteGestaoManagers.length > 0 && (
        <div className="flex justify-center mb-4">
          <div className="w-px h-8 bg-primary"></div>
        </div>
      )}

      {/* Departamentos */}
      <OrgLevel className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-6xl mx-auto">
        {genteGestaoDepartments.length > 0 ? (
          genteGestaoDepartments.map(department => {
            const departmentEmployees = employees.filter(emp => 
              emp.department === department.name && emp.visible !== false && !emp.isManager
            );

            return (
              <div 
                key={department.id}
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onSelectTeam(department.name.toLowerCase().replace(/\s+/g, '-'))}
              >
                <OrgChartNode 
                  title={department.name.toUpperCase()}
                  variant="team"
                  count={departmentEmployees.length}
                />
                {departmentEmployees.length > 0 && (
                  <div className="mt-4 space-y-2 text-center">
                    <div className="text-xs text-muted-foreground max-w-48">
                      {departmentEmployees.slice(0, 4).map((emp, idx) => (
                        <p key={idx}>{emp.position || emp.name}</p>
                      ))}
                      {departmentEmployees.length > 4 && (
                        <p>... e mais {departmentEmployees.length - 4}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-8">
            <p>Nenhum departamento de Gente e Gestão configurado no Google Sheets.</p>
            <p className="text-sm">Adicione departamentos relacionados a RH no painel administrativo.</p>
          </div>
        )}
      </OrgLevel>

      {genteGestaoDepartments.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Clique em qualquer departamento para visualizar a estrutura detalhada da equipe</p>
        </div>
      )}
    </OrgChart>
  );
};

export default GenteGestaoOrgChart;