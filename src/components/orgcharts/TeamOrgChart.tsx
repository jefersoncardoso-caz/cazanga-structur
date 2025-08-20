import React, { useState } from 'react';
import { OrgChart, OrgLevel } from '@/components/ui/org-chart';
import { OrgChartNode } from '@/components/ui/org-chart-node';
import { useApp } from '@/contexts/AppContext';
import EmployeeModal from '@/components/modals/EmployeeModal';

interface TeamOrgChartProps {
  team: string;
}

const TeamOrgChart: React.FC<TeamOrgChartProps> = ({ team }) => {
  const { state } = useApp();
  const { employees, departments } = state;
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee({
      ...employee,
      email: `${employee.name?.toLowerCase().replace(/\s+/g, '.') || employee.title?.toLowerCase().replace(/\s+/g, '.')}@${state.siteSettings.companyName.toLowerCase()}.com`,
      phone: '+55 (11) 9999-9999',
      location: 'São Paulo, SP',
      description: employee.description || `Responsável por ${employee.position?.toLowerCase() || employee.title?.toLowerCase()} na equipe de ${team}`,
      responsibilities: employee.responsibilities || [
        'Gerenciar atividades diárias da equipe',
        'Implementar processos e procedimentos',
        'Colaborar com outros departamentos',
        'Realizar relatórios e análises'
      ]
    });
    setIsModalOpen(true);
  };

  // Get team data from context
  const getTeamDataFromContext = (teamName: string) => {
    // Find department that matches team name
    const department = departments.find(dept => 
      dept.name.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(dept.name.toLowerCase())
    );

    // Get employees from this department/team
    const teamEmployees = employees.filter(emp => 
      emp.visible !== false && (
        emp.department === department?.name ||
        emp.team?.toLowerCase().includes(teamName.toLowerCase()) ||
        emp.department?.toLowerCase().includes(teamName.toLowerCase())
      )
    );

    // Find manager
    const manager = teamEmployees.find(emp => emp.isManager);
    const regularEmployees = teamEmployees.filter(emp => !emp.isManager);

    return {
      title: `ORGANOGRAMA EQUIPE ${teamName.toUpperCase()} ${new Date().getFullYear()}`,
      headerColor: department?.color || '#548235',
      manager: manager?.position || manager?.name || `GERENTE DE ${teamName.toUpperCase()}`,
      employees: regularEmployees,
      descriptions: teamEmployees.map(emp => emp.position || emp.name).filter(Boolean)
    };
  };

  const teamData = employees.length > 0 ? getTeamDataFromContext(team) : {
    title: `ORGANOGRAMA EQUIPE ${team.toUpperCase()}`,
    headerColor: '#548235',
    manager: `GERENTE DE ${team.toUpperCase()}`,
    employees: [],
    descriptions: []
  };

  return (
    <div className="w-full bg-background">
      {/* Header */}
      <div 
        className="text-white py-4 px-6 mb-6"
        style={{ backgroundColor: teamData.headerColor }}
      >
        <h1 className="text-lg font-bold text-center uppercase tracking-wide">
          {teamData.title}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex">
        <div className="flex-1 px-4">
          {/* Manager */}
          <OrgLevel>
            <OrgChartNode 
              title={teamData.manager} 
              variant="manager"
            />
          </OrgLevel>

          {/* Connection Line */}
          {teamData.employees.length > 0 && (
            <div className="flex justify-center mb-4">
              <div className="w-px h-8 bg-primary"></div>
            </div>
          )}

          {/* Team Members */}
          {teamData.employees.length > 0 ? (
            <OrgLevel className="justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {teamData.employees.map((employee, index) => (
                  <div key={employee.id || index} className="flex flex-col items-center">
                    <OrgChartNode 
                      title={employee.position || employee.name}
                      subtitle={employee.position ? employee.name : undefined}
                      variant="default"
                      onClick={() => handleEmployeeClick(employee)}
                    />
                  </div>
                ))}
              </div>
            </OrgLevel>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Nenhum funcionário cadastrado para esta equipe.</p>
              <p className="text-sm">Configure funcionários no painel administrativo.</p>
            </div>
          )}
        </div>

        {/* Right Panel - Descriptions */}
        <div 
          className="w-80 text-white p-6"
          style={{ backgroundColor: teamData.headerColor }}
        >
          <h2 className="text-lg font-bold mb-4 text-center">FUNCIONÁRIOS</h2>
          <div className="space-y-2">
            {teamData.descriptions.length > 0 ? (
              teamData.descriptions.map((desc, index) => (
                <div key={index} className="border-b border-white/20 pb-2">
                  <button 
                    className="text-left text-sm hover:opacity-80 transition-opacity underline w-full"
                    onClick={() => {
                      const emp = teamData.employees.find(e => 
                        e.position === desc || e.name === desc
                      );
                      if (emp) handleEmployeeClick(emp);
                    }}
                  >
                    {desc}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm opacity-80">Nenhum funcionário cadastrado</p>
            )}
          </div>
        </div>
      </div>

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default TeamOrgChart;