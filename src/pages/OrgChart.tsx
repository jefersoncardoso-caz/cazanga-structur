import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Home } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { OrgChart, OrgLevel } from '@/components/ui/org-chart';
import { OrgChartNode } from '@/components/ui/org-chart-node';
import MacroOrgChart from '@/components/orgcharts/MacroOrgChart';
import GenteGestaoOrgChart from '@/components/orgcharts/GenteGestaoOrgChart';
import TeamOrgChart from '@/components/orgcharts/TeamOrgChart';

type OrgChartType = 'macro' | 'gente-gestao' | 'dho' | 'dp' | 'facilities' | 'sesmt' | 'sgq';

const OrgChartPage = () => {
  const { dispatch } = useApp();
  const [selectedChart, setSelectedChart] = useState<OrgChartType>('macro');

  const handleBack = () => {
    dispatch({ type: 'SET_VIEW', payload: 'home' });
  };

  const renderChart = () => {
    switch (selectedChart) {
      case 'macro':
        return <MacroOrgChart />;
      case 'gente-gestao':
        return <GenteGestaoOrgChart onSelectTeam={setSelectedChart} />;
      case 'dho':
        return <TeamOrgChart team="DHO" />;
      case 'dp':
        return <TeamOrgChart team="DEPARTAMENTO PESSOAL" />;
      case 'facilities':
        return <TeamOrgChart team="FACILITIES" />;
      case 'sesmt':
        return <TeamOrgChart team="SESMT" />;
      case 'sgq':
        return <TeamOrgChart team="SGQ" />;
      default:
        return <MacroOrgChart />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="text-primary-foreground hover:bg-primary-light"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-primary-foreground/30" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedChart('macro')}
                className="text-primary-foreground hover:bg-primary-light"
              >
                <Home className="w-4 h-4 mr-2" />
                Início
              </Button>
            </div>
            <h1 className="text-xl font-bold">Organogramas Cazanga</h1>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-muted/50 py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedChart === 'macro' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedChart('macro')}
            >
              Organograma Macro 2025
            </Button>
            <Button
              variant={selectedChart === 'gente-gestao' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedChart('gente-gestao')}
            >
              Gente e Gestão
            </Button>
            {['dho', 'dp', 'facilities', 'sesmt', 'sgq'].map((team) => (
              <Button
                key={team}
                variant={selectedChart === team ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedChart(team as OrgChartType)}
                className="text-xs"
              >
                {team.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Chart Content */}
      <main className="container mx-auto px-4 py-6">
        <Card className="shadow-lg">
          {renderChart()}
        </Card>
      </main>
    </div>
  );
};

export default OrgChartPage;