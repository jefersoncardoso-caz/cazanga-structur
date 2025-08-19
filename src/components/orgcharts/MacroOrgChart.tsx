import React from 'react';
import { OrgChart, OrgLevel, OrgConnection } from '@/components/ui/org-chart';
import { OrgChartNode } from '@/components/ui/org-chart-node';

const MacroOrgChart = () => {
  return (
    <OrgChart title="Organograma Macro 2025">
      {/* Sócios */}
      <OrgLevel>
        <OrgChartNode 
          title="SÓCIOS" 
          variant="manager"
        />
      </OrgLevel>

      {/* Connection Line */}
      <div className="flex justify-center mb-4">
        <div className="w-px h-8 bg-primary"></div>
      </div>

      {/* Diretor Executivo */}
      <OrgLevel>
        <OrgChartNode 
          title="DIRETOR EXECUTIVO" 
          variant="manager"
        />
      </OrgLevel>

      {/* Connection Line */}
      <div className="flex justify-center mb-4">
        <div className="w-px h-8 bg-primary"></div>
      </div>

      {/* Gerências */}
      <OrgLevel className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4 max-w-7xl mx-auto">
        <div className="flex flex-col items-center">
          <OrgChartNode 
            title="GERENTE DE MARKETING"
            variant="team"
          />
          <div className="mt-4 space-y-2">
            <OrgChartNode title="PCM" count={3} />
            <OrgChartNode title="MANUTENÇÃO AUTOMOTIVA" count={3} />
            <OrgChartNode title="MANUTENÇÃO ELETROTÉCNICA" count={3} />
            <OrgChartNode title="MANUTENÇÃO INDUSTRIAL" count={3} />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <OrgChartNode 
            title="GERENTE DE ENGENHARIA E PROJETOS"
            variant="team"
          />
          <div className="mt-4 space-y-2">
            <OrgChartNode title="PROJETOS" count={4} />
            <OrgChartNode title="CONTROLE PATRIMONIAL" count={3} />
            <OrgChartNode title="CONTÁBIL/FISCAL/FINANCEIRO" count={3} />
            <OrgChartNode title="COMPRAS" count={3} />
            <OrgChartNode title="CUSTOS" count={3} />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <OrgChartNode 
            title="GERENTE DE FINANÇAS E SUPRIMENTOS"
            variant="team"
          />
          <div className="mt-4 space-y-2">
            <OrgChartNode title="IT" count={4} />
            <OrgChartNode title="MINERAÇÃO" count={5} />
            <OrgChartNode title="INDUSTRIAL" count={3} />
            <OrgChartNode title="LABORATÓRIO" count={3} />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <OrgChartNode 
            title="SUPERVISOR DE TI"
            variant="team"
          />
          <div className="mt-4 space-y-2">
            <OrgChartNode title="RCT" count={5} />
            <OrgChartNode title="COMERCIAL" count={3} />
            <OrgChartNode title="MARKETING" count={3} />
            <OrgChartNode title="LOGÍSTICA" count={3} />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <OrgChartNode 
            title="GERENTE DE PRODUÇÃO"
            variant="team"
          />
          <div className="mt-4 space-y-2">
            <OrgChartNode title="MEIO AMBIENTE" count={3} />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <OrgChartNode 
            title="GERENTE COMERCIAL"
            variant="team"
          />
        </div>

        <div className="flex flex-col items-center">
          <OrgChartNode 
            title="GERENTE DE MEIO AMBIENTE"
            variant="team"
          />
        </div>

        <div className="flex flex-col items-center">
          <OrgChartNode 
            title="GERENTE JURÍDICO"
            variant="team"
          />
          <div className="mt-4 space-y-2">
            <OrgChartNode title="JURÍDICO" count={3} />
            <OrgChartNode title="DEPARTAMENTO PESSOAL" count={5} />
            <OrgChartNode title="FACILITIES" count={3} />
            <OrgChartNode title="SESMT" count={3} />
            <OrgChartNode title="SGQ" count={3} />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <OrgChartNode 
            title="GERENTE DE GENTE E GESTÃO"
            variant="team"
          />
          <div className="mt-4 space-y-2">
            <OrgChartNode title="DHO" count={3} />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <OrgChartNode 
            title="ANALISTA DE P&D"
            variant="default"
          />
        </div>
      </OrgLevel>
    </OrgChart>
  );
};

export default MacroOrgChart;