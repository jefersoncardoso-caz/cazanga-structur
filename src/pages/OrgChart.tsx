import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Home } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import MacroOrgChart from '@/components/orgcharts/MacroOrgChart';
import GenteGestaoOrgChart from '@/components/orgcharts/GenteGestaoOrgChart';
import TeamOrgChart from '@/components/orgcharts/TeamOrgChart';

type OrgChartType = string;

const OrgChartPage = () => {
  const { state, dispatch } = useApp();
  const [selectedChart, setSelectedChart] = useState<string>('');

  // Check if Google Sheets is connected
  const isConnected = localStorage.getItem('google_sheets_connected') === 'true';
  
  // Get available org charts from Google Sheets
  const availableOrgCharts = state.orgCharts.filter(org => org.visible !== false);
  
  // Set initial chart if not set and charts are available
  React.useEffect(() => {
    if (!selectedChart && availableOrgCharts.length > 0) {
      setSelectedChart(availableOrgCharts[0].id);
    }
  }, [availableOrgCharts, selectedChart]);

  const handleBack = () => {
    dispatch({ type: 'SET_VIEW', payload: 'home' });
  };

  const getCurrentOrgChart = () => {
    return availableOrgCharts.find(org => org.id === selectedChart);
  };

  const renderChart = () => {
    const currentOrgChart = getCurrentOrgChart();
    
    if (!currentOrgChart) {
      return (
        <div className="text-center text-muted-foreground py-16">
          <p>Nenhum organograma disponível.</p>
          <p className="text-sm mt-2">Configure organogramas no painel administrativo.</p>
        </div>
      );
    }

    // Determine chart type and render appropriate component
    if (selectedChart.includes('dho') || selectedChart.includes('dp') || 
        selectedChart.includes('facilities') || selectedChart.includes('sesmt') || 
        selectedChart.includes('sgq')) {
      return <TeamOrgChart team={currentOrgChart.name} />;
    } else if (currentOrgChart.type === 'gente-gestao') {
      return <GenteGestaoOrgChart onSelectTeam={setSelectedChart} orgChart={currentOrgChart} />;
    } else {
      return <MacroOrgChart orgChart={currentOrgChart} />;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
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
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">Organogramas {state.siteSettings.companyName}</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <Card className="shadow-lg">
            <div className="text-center text-muted-foreground py-16">
              <p>Google Sheets não configurado.</p>
              <p className="text-sm mt-2">Configure a integração no painel administrativo para visualizar os organogramas.</p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              {state.siteSettings.logo ? (
                <img 
                  src={state.siteSettings.logo} 
                  alt={`Logo ${state.siteSettings.companyName}`}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <h1 className="text-xl font-bold">Organogramas {state.siteSettings.companyName}</h1>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-muted/50 py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            {availableOrgCharts.map(orgChart => (
              <Button
                key={orgChart.id}
                variant={selectedChart === orgChart.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChart(orgChart.id)}
              >
                {orgChart.name}
              </Button>
            ))}
            {availableOrgCharts.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Nenhum organograma configurado no Google Sheets
              </div>
            )}
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