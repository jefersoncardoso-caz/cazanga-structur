import React from 'react';
import { OrgChart, OrgLevel } from '@/components/ui/org-chart';
import { OrgChartNode } from '@/components/ui/org-chart-node';
import { useApp } from '@/contexts/AppContext';

interface GenteGestaoOrgChartProps {
  onSelectTeam: (team: any) => void;
}

const GenteGestaoOrgChart: React.FC<GenteGestaoOrgChartProps> = ({ onSelectTeam }) => {
  const { state } = useApp();
  const { departments, employees } = state;

  // Find departments related to "Gente e Gestão" or similar
  const genteGestaoDepartments = departments.filter(dept => 
    dept.visible !== false && (
      dept.name.toLowerCase().includes('recursos humanos') ||
      dept.name.toLowerCase().includes('gente') ||
      dept.name.toLowerCase().includes('rh') ||
      dept.name.toLowerCase().includes('pessoal') ||
      dept.name.toLowerCase().includes('gestão')
    )
  );

  // Find managers for Gente e Gestão area
  const genteGestaoManagers = employees.filter(emp => 
    emp.isManager && emp.visible !== false && (
      emp.department?.toLowerCase().includes('recursos humanos') ||
      emp.department?.toLowerCase().includes('gente') ||
      emp.department?.toLowerCase().includes('rh') ||
      emp.position?.toLowerCase().includes('gente') ||
      emp.position?.toLowerCase().includes('recursos humanos')
    )
  );

  // Get teams/departments data
  const getTeamData = (teamName: string) => {
    const teamEmployees = employees.filter(emp => 
      emp.visible !== false && (
        emp.team?.toLowerCase().includes(teamName.toLowerCase()) ||
        emp.department?.toLowerCase().includes(teamName.toLowerCase())
      )
    );
    return {
      employees: teamEmployees,
      count: teamEmployees.length,
      positions: teamEmployees.map(emp => emp.position).filter(Boolean)
    };
  };

  return (
    <OrgChart title="Organograma Gente e Gestão">
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
          <OrgChartNode 
            title="GERENTE DE GENTE E GESTÃO" 
            variant="manager"
          />
        )}
      </OrgLevel>

      {/* Connection Line */}
      <div className="flex justify-center mb-4">
        <div className="w-px h-8 bg-primary"></div>
      </div>

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
          // Fallback with common HR teams if no departments configured
          <>
            <div 
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onSelectTeam('rh')}
            >
              <OrgChartNode 
                title="RECURSOS HUMANOS"
                variant="team"
                count={getTeamData('rh').count}
              />
            </div>

            <div 
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onSelectTeam('dp')}
            >
              <OrgChartNode 
                title="DEPARTAMENTO PESSOAL"
                variant="team"
                count={getTeamData('pessoal').count}
              />
            </div>

            <div 
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onSelectTeam('facilities')}
            >
              <OrgChartNode 
                title="FACILITIES"
                variant="team"
                count={getTeamData('facilities').count}
              />
            </div>

            <div 
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onSelectTeam('sesmt')}
            >
              <OrgChartNode 
                title="SESMT"
                variant="team"
                count={getTeamData('sesmt').count}
              />
            </div>

            <div 
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onSelectTeam('sgq')}
            >
              <OrgChartNode 
                title="SGQ"
                variant="team"
                count={getTeamData('sgq').count}
              />
            </div>
          </>
        )}

        {/* Show message if no data */}
        {genteGestaoDepartments.length === 0 && employees.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">
            <p>Nenhum departamento de Gente e Gestão configurado.</p>
            <p className="text-sm">Configure departamentos e funcionários no painel administrativo.</p>
          </div>
        )}
      </OrgLevel>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Clique em qualquer departamento para visualizar a estrutura detalhada da equipe</p>
      </div>
    </OrgChart>
  );
};

export default GenteGestaoOrgChart;