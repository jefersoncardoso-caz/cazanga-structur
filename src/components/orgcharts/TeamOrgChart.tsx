import React, { useState } from 'react';
import { OrgChart, OrgLevel } from '@/components/ui/org-chart';
import { OrgChartNode } from '@/components/ui/org-chart-node';
import EmployeeModal from '@/components/modals/EmployeeModal';

interface TeamOrgChartProps {
  team: string;
}

interface TeamEmployee {
  title: string;
  position: string;
  count?: number;
  parentIndex?: number;
}

const TeamOrgChart: React.FC<TeamOrgChartProps> = ({ team }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee({
      ...employee,
      email: `${employee.title.toLowerCase().replace(/\s+/g, '.')}@cazanga.com`,
      phone: '+55 (11) 9999-9999',
      location: 'São Paulo, SP',
      description: `Responsável por ${employee.position.toLowerCase()} na equipe de ${team}`,
      responsibilities: [
        'Gerenciar atividades diárias da equipe',
        'Implementar processos e procedimentos',
        'Colaborar com outros departamentos',
        'Realizar relatórios e análises'
      ]
    });
    setIsModalOpen(true);
  };
  const getTeamData = (teamName: string) => {
    switch (teamName) {
      case 'DHO':
        return {
          title: 'ORGANOGRAMA EQUIPE DHO 2025',
          headerColor: 'bg-secondary',
          manager: 'GERENTE DE GENTE E GESTÃO',
          employees: [
            { title: 'ANALISTA DE RH PL', position: 'left' } as TeamEmployee,
            { title: 'ANALISTA DE RH PL', position: 'center' } as TeamEmployee,
            { title: 'ANALISTA DE T&D PL', position: 'right' } as TeamEmployee,
            { title: 'APRENDIZ EM ASSISTENTE ADMINISTRATIVO', position: 'bottom', parentIndex: 2 } as TeamEmployee
          ],
          descriptions: [
            'ANALISTA DE RH PL',
            'ANALISTA DE T&D PL',
            'GERENTE DE GENTE E GESTÃO'
          ]
        };
      case 'DEPARTAMENTO PESSOAL':
        return {
          title: 'ORGANOGRAMA EQUIPE DEPARTAMENTO PESSOAL 2025',
          headerColor: 'bg-secondary',
          manager: 'GERENTE DE GENTE E GESTÃO',
          coordinator: 'COORDENADOR DE DEPARTAMENTO PESSOAL',
          employees: [
            { title: 'ASSISTENTE DE PESSOAL', position: 'left' } as TeamEmployee,
            { title: 'ASSISTENDE DE PESSOAL', position: 'center' } as TeamEmployee,
            { title: 'AUXILIAR DE PESSOAL', position: 'right' } as TeamEmployee
          ],
          descriptions: [
            'AUXILIAR DE DEPARTAMENTO PESSOAL',
            'ASSISTENTE DE PESSOAL',
            'COORDENADOR DE DEPARTAMENTO PESSOAL'
          ]
        };
      case 'FACILITIES':
        return {
          title: 'ORGANOGRAMA EQUIPE FACILITES 2025',
          headerColor: 'bg-secondary',
          manager: 'GERENTE DE GENTE E GESTÃO',
          supervisor: 'SUPERVISOR (A) DE FACILITES',
          employees: [
            { title: 'ASSISTENTE DE FACILITIES', position: 'left' } as TeamEmployee,
            { title: 'TRABALHADOR GERAL', position: 'center', count: 1 } as TeamEmployee,
            { title: 'AJUDANTE DE LIMPEZA', position: 'right', count: 8 } as TeamEmployee,
            { title: 'APRENDIZ EM ASSISTENTE ADMINISTRATIVO', position: 'bottom', count: 2, parentIndex: 0 } as TeamEmployee
          ],
          descriptions: [
            'AJUDANTE DE LIMPEZA',
            'APRENDIZ EM ASSISTENTE ADMINISTRATIVO',
            'ASSISTENTE DE FACILITIES',
            'SUPERVISOR (A) DE FACILITES',
            'TRABALHADOR GERAL'
          ]
        };
      case 'SESMT':
        return {
          title: 'ORGANOGRAMA EQUIPE SESMT 2025',
          headerColor: 'bg-secondary',
          manager: 'GERENTE DE GENTE E GESTÃO',
          supervisor: 'SUPERVISOR DE SEGURANÇA DO TRABALHO',
          employees: [
            { title: 'ASSISTENTE DE SAUDE OCUPACIONAL', position: 'left' } as TeamEmployee,
            { title: 'TÉCNICO SEGURANÇA DO TRABALHO', position: 'right', count: 3 } as TeamEmployee,
            { title: 'ASSISTENTE DE SEGURANÇA DO TRABALHO', position: 'bottom', parentIndex: 1 } as TeamEmployee
          ],
          descriptions: [
            'ASSISTENTE DE SAUDE OCUPACIONAL',
            'ASSISTENTE DE SEGURANÇA DO TRABALHO',
            'SUPERVISOR DE SEGURANÇA DO TRABALHO',
            'TÉCNICO SEGURANÇA DO TRABALHO'
          ]
        };
      case 'SGQ':
        return {
          title: 'ORGANOGRAMA EQUIPE SGQ 2025',
          headerColor: 'bg-secondary',
          manager: 'GERENTE DE GENTE E GESTÃO',
          supervisor: 'SUPERVISORA DE QUALIDADE',
          employees: [
            { title: 'ANALISTA DE QUALIDADE PL', position: 'left' } as TeamEmployee,
            { title: 'ANALISTA DE PROJETOS SOCIAIS PL', position: 'right' } as TeamEmployee
          ],
          descriptions: [
            'ANALISTA DE PROJETOS SOCIAIS',
            'ANALISTA DE QUALIDADE',
            'SUPERVISORA DE QUALIDADE'
          ]
        };
      default:
        return {
          title: 'ORGANOGRAMA EQUIPE',
          headerColor: 'bg-secondary',
          manager: 'GERENTE DE GENTE E GESTÃO',
          employees: [],
          descriptions: []
        };
    }
  };

  const teamData = getTeamData(team);

  return (
    <div className="w-full bg-background">
      {/* Header */}
      <div className={`${teamData.headerColor} text-white py-4 px-6 mb-6`}>
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
          <div className="flex justify-center mb-4">
            <div className="w-px h-8 bg-primary"></div>
          </div>

          {/* Coordinator/Supervisor (if exists) */}
          {(teamData.coordinator || teamData.supervisor) && (
            <>
              <OrgLevel>
                <OrgChartNode 
                  title={teamData.coordinator || teamData.supervisor || ''} 
                  variant="manager"
                />
              </OrgLevel>
              <div className="flex justify-center mb-4">
                <div className="w-px h-8 bg-primary"></div>
              </div>
            </>
          )}

          {/* Team Members */}
          <OrgLevel className="justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {teamData.employees.filter(emp => emp.position !== 'bottom').map((employee, index) => (
                <div key={index} className="flex flex-col items-center">
                  <OrgChartNode 
                    title={employee.title}
                    count={employee.count}
                    variant="team"
                    onClick={() => handleEmployeeClick(employee)}
                  />
                  {/* Sub-employees */}
                  {teamData.employees
                    .filter(emp => emp.position === 'bottom' && emp.parentIndex === index)
                    .map((subEmployee, subIndex) => (
                      <div key={subIndex} className="mt-4">
                        <div className="w-px h-4 bg-primary mx-auto mb-2"></div>
                        <OrgChartNode 
                          title={subEmployee.title}
                          count={subEmployee.count}
                          variant="default"
                          onClick={() => handleEmployeeClick(subEmployee)}
                        />
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          </OrgLevel>
        </div>

        {/* Right Panel - Descriptions */}
        <div className="w-80 bg-secondary text-white p-6">
          <h2 className="text-lg font-bold mb-4 text-center">DESCRIÇÃO DE CARGOS</h2>
          <div className="space-y-2">
            {teamData.descriptions.map((desc, index) => (
              <div key={index} className="border-b border-white/20 pb-2">
                <button 
                  className="text-left text-sm hover:text-secondary-light transition-colors underline w-full"
                  onClick={() => handleEmployeeClick({ title: desc, position: desc })}
                >
                  {desc}
                </button>
              </div>
            ))}
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