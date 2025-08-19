import React from 'react';
import { OrgChart, OrgLevel } from '@/components/ui/org-chart';
import { OrgChartNode } from '@/components/ui/org-chart-node';

interface GenteGestaoOrgChartProps {
  onSelectTeam: (team: any) => void;
}

const GenteGestaoOrgChart: React.FC<GenteGestaoOrgChartProps> = ({ onSelectTeam }) => {
  return (
    <OrgChart title="Organograma Gente e Gestão">
      {/* Gerente de Gente e Gestão */}
      <OrgLevel>
        <OrgChartNode 
          title="GERENTE DE GENTE E GESTÃO" 
          variant="manager"
        />
      </OrgLevel>

      {/* Connection Line */}
      <div className="flex justify-center mb-4">
        <div className="w-px h-8 bg-primary"></div>
      </div>

      {/* Departamentos */}
      <OrgLevel className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
        <div 
          className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => onSelectTeam('dho')}
        >
          <OrgChartNode 
            title="DHO"
            variant="team"
            count={3}
          />
          <div className="mt-4 space-y-2 text-center">
            <div className="text-xs text-muted-foreground">
              <p>ANALISTA DE RH PL</p>
              <p>ANALISTA DE RH PL</p>
              <p>ANALISTA DE T&D PL</p>
            </div>
          </div>
        </div>

        <div 
          className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => onSelectTeam('dp')}
        >
          <OrgChartNode 
            title="DEPARTAMENTO PESSOAL"
            variant="team"
            count={5}
          />
          <div className="mt-4 space-y-2 text-center">
            <div className="text-xs text-muted-foreground">
              <p>COORDENADOR</p>
              <p>ASSISTENTE DE PESSOAL</p>
              <p>ASSISTENTE DE PESSOAL</p>
              <p>AUXILIAR DE PESSOAL</p>
              <p>ASSISTENTE DE FACILITIES</p>
            </div>
          </div>
        </div>

        <div 
          className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => onSelectTeam('facilities')}
        >
          <OrgChartNode 
            title="FACILITIES"
            variant="team"
            count={8}
          />
          <div className="mt-4 space-y-2 text-center">
            <div className="text-xs text-muted-foreground">
              <p>SUPERVISOR (A)</p>
              <p>TRABALHADOR GERAL</p>
              <p>AJUDANTE DE LIMPEZA</p>
              <p>APRENDIZ EM ASSISTENTE ADMINISTRATIVO</p>
            </div>
          </div>
        </div>

        <div 
          className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => onSelectTeam('sesmt')}
        >
          <OrgChartNode 
            title="SESMT"
            variant="team"
            count={3}
          />
          <div className="mt-4 space-y-2 text-center">
            <div className="text-xs text-muted-foreground">
              <p>SUPERVISOR DE SEGURANÇA DO TRABALHO</p>
              <p>ASSISTENTE DE SAUDE OCUPACIONAL</p>
              <p>TÉCNICO SEGURANÇA DO TRABALHO</p>
            </div>
          </div>
        </div>

        <div 
          className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => onSelectTeam('sgq')}
        >
          <OrgChartNode 
            title="SGQ"
            variant="team"
            count={2}
          />
          <div className="mt-4 space-y-2 text-center">
            <div className="text-xs text-muted-foreground">
              <p>SUPERVISORA DE QUALIDADE</p>
              <p>ANALISTA DE QUALIDADE PL</p>
              <p>ANALISTA DE PROJETOS SOCIAIS PL</p>
            </div>
          </div>
        </div>
      </OrgLevel>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Clique em qualquer departamento para visualizar a estrutura detalhada da equipe</p>
      </div>
    </OrgChart>
  );
};

export default GenteGestaoOrgChart;