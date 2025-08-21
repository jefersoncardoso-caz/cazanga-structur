import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Home, Menu, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import OrgChartViewer from '@/components/orgcharts/OrgChartViewer';
import InteractiveOrgChart from '@/components/orgcharts/InteractiveOrgChart';
import { ResponsiveContainer, MobileMenu } from '@/components/ui/mobile-responsive';


const OrgChartPage = () => {
  const { state, dispatch } = useApp();
  const [selectedChart, setSelectedChart] = useState<string>(state.selectedOrgChart || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if Google Sheets is connected
  const isConnected = localStorage.getItem('google_sheets_connected') === 'true';
  
  // Get available org charts
  const availableOrgCharts = state.orgCharts.filter(org => org.visible !== false);
  
  // Set initial chart if not set and charts are available
  React.useEffect(() => {
    if (!selectedChart && availableOrgCharts.length > 0) {
      setSelectedChart(availableOrgCharts[0].id);
      dispatch({ type: 'SET_SELECTED_ORGCHART', payload: availableOrgCharts[0].id });
    }
  }, [availableOrgCharts, selectedChart, dispatch]);

  const handleBack = () => {
    dispatch({ type: 'SET_VIEW', payload: 'home' });
    dispatch({ type: 'SET_SELECTED_ORGCHART', payload: undefined });
  };

  const handleChartSelect = (chartId: string) => {
    setSelectedChart(chartId);
    dispatch({ type: 'SET_SELECTED_ORGCHART', payload: chartId });
  };

  const getCurrentOrgChart = () => {
    return availableOrgCharts.find(org => org.id === selectedChart);
  };

  const currentOrgChart = getCurrentOrgChart();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground py-3 lg:py-4 shadow-md">
          <ResponsiveContainer>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack}
                  className="text-primary-foreground hover:bg-primary-light hidden lg:flex"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-primary-foreground"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-base lg:text-xl font-bold">Organogramas {state.siteSettings.companyName}</h1>
              </div>
            </div>
          </ResponsiveContainer>
        </header>

        <main className="py-6">
          <ResponsiveContainer>
          <Card className="shadow-lg">
            <div className="text-center text-muted-foreground py-16">
              <p>Google Sheets não configurado.</p>
              <p className="text-sm mt-2">Configure a integração no painel administrativo para visualizar os organogramas.</p>
            </div>
          </Card>
          </ResponsiveContainer>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-3 lg:py-4 shadow-md">
        <ResponsiveContainer>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="text-primary-foreground hover:bg-primary-light hidden lg:flex"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-primary-foreground"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="h-6 w-px bg-primary-foreground/30" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedChart('macro')}
                className="text-primary-foreground hover:bg-primary-light hidden lg:flex"
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
                  className="h-6 lg:h-8 w-auto object-contain"
                />
              ) : (
                <h1 className="text-sm lg:text-xl font-bold">Organogramas {state.siteSettings.companyName}</h1>
              )}
            </div>
          </div>
        </ResponsiveContainer>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Organogramas</h2>
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                handleBack();
                setMobileMenuOpen(false);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
            {availableOrgCharts.map(orgChart => (
              <Button
                key={orgChart.id}
                variant={selectedChart === orgChart.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  handleChartSelect(orgChart.id);
                  setMobileMenuOpen(false);
                }}
              >
                {orgChart.name}
              </Button>
            ))}
          </nav>
        </div>
      </MobileMenu>
      {/* Navigation */}
      <nav className="bg-muted/50 py-3 lg:py-4 border-b hidden lg:block">
        <ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center">
            {availableOrgCharts.map(orgChart => (
              <Button
                key={orgChart.id}
                variant={selectedChart === orgChart.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChartSelect(orgChart.id)}
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
        </ResponsiveContainer>
      </nav>

      {/* Chart Content */}
      <main className="py-4 lg:py-6">
        {currentOrgChart ? (
          <OrgChartViewer 
            orgChart={currentOrgChart}
            onBack={handleBack}
            isPublic={true}
          />
        ) : (
          <ResponsiveContainer>
          <Card className="shadow-lg">
            <div className="text-center text-muted-foreground py-16">
              <p>Nenhum organograma disponível.</p>
              <p className="text-sm mt-2">Configure organogramas no painel administrativo.</p>
            </div>
          </Card>
          </ResponsiveContainer>
        )}
      </main>
    </div>
  );
};

export default OrgChartPage;