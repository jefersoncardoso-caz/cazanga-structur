import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Building2, Menu, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { CarouselBasic } from '@/components/ui/carousel-basic';
import { ResponsiveContainer, ResponsiveGrid, MobileMenu } from '@/components/ui/mobile-responsive';

const Home = () => {
  const { state, dispatch } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleEnterOrgChart = () => {
    dispatch({ type: 'SET_VIEW', payload: 'orgchart' });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 lg:py-6 shadow-lg">
        <ResponsiveContainer>
          <div className="flex items-center justify-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden absolute left-4 text-primary-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {state.siteSettings.logo ? (
              <img 
                src={state.siteSettings.logo} 
                alt={`Logo ${state.siteSettings.companyName}`}
                className="h-8 lg:h-12 w-auto object-contain"
              />
            ) : (
              <>
                <Building2 className="w-6 lg:w-8 h-6 lg:h-8" />
                <h1 className="text-lg lg:text-2xl font-bold">{state.siteSettings.companyName}</h1>
              </>
            )}
          </div>
        </ResponsiveContainer>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                handleEnterOrgChart();
                setMobileMenuOpen(false);
              }}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Organogramas
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                dispatch({ type: 'SET_VIEW', payload: 'admin' });
                setMobileMenuOpen(false);
              }}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Painel Admin
            </Button>
          </nav>
        </div>
      </MobileMenu>
      {/* Hero Section */}
      <section className="py-8 lg:py-16">
        <ResponsiveContainer>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 lg:mb-6">
            Sistema de Organogramas
          </h2>
            <p className="text-base lg:text-xl text-muted-foreground mb-6 lg:mb-8 max-w-2xl mx-auto px-4">
            {state.siteSettings.introText}
          </p>
          
          {/* Carousel */}
            <Card className="p-4 lg:p-8 mb-6 lg:mb-8 bg-gradient-primary overflow-hidden">
            {state.siteSettings.carouselImages && state.siteSettings.carouselImages.length > 0 ? (
              <CarouselBasic 
                images={state.siteSettings.carouselImages}
                autoPlay={true}
                interval={4000}
                className="h-48 lg:h-64"
              />
            ) : (
                <div className="h-48 lg:h-64 bg-white/10 rounded-lg flex items-center justify-center">
                <div className="text-center text-primary-foreground">
                    <Building2 className="w-12 lg:w-16 h-12 lg:h-16 mx-auto mb-4 opacity-80" />
                    <p className="text-base lg:text-lg">Carrossel de Imagens Institucionais</p>
                    <p className="text-xs lg:text-sm opacity-80">Adicione imagens no painel administrativo</p>
                </div>
              </div>
            )}
          </Card>

          {/* CTA Button */}
          <Button 
              size="lg"
            onClick={handleEnterOrgChart}
              className="bg-secondary hover:bg-secondary-dark text-secondary-foreground text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            Entrar nos Organogramas
              <ArrowRight className="w-4 lg:w-5 h-4 lg:h-5 ml-2" />
          </Button>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Features Section */}
      <section className="py-8 lg:py-16 bg-muted/30">
        <ResponsiveContainer>
          <ResponsiveGrid cols={{ default: 1, md: 3 }} gap={6}>
            <Card className="p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="w-5 lg:w-6 h-5 lg:h-6 text-primary" />
              </div>
                <h3 className="text-base lg:text-lg font-semibold mb-2">Organograma Macro</h3>
                <p className="text-sm lg:text-base text-muted-foreground">Visualize a estrutura geral da empresa</p>
            </Card>

            <Card className="p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-secondary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="w-5 lg:w-6 h-5 lg:h-6 text-secondary" />
              </div>
                <h3 className="text-base lg:text-lg font-semibold mb-2">Organograma Gerencial</h3>
                <p className="text-sm lg:text-base text-muted-foreground">Explore os departamentos e equipes</p>
            </Card>

            <Card className="p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="w-5 lg:w-6 h-5 lg:h-6 text-primary" />
              </div>
                <h3 className="text-base lg:text-lg font-semibold mb-2">Equipes Detalhadas</h3>
                <p className="text-sm lg:text-base text-muted-foreground">Veja informações detalhadas de cada funcionário</p>
            </Card>
          </ResponsiveGrid>
        </ResponsiveContainer>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 mt-16">
        <ResponsiveContainer>
          <div className="text-center">
            <p className="mb-4 text-sm lg:text-base">&copy; 2025 {state.siteSettings.companyName}. Todos os direitos reservados.</p>
          <button 
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin' })}
              className="text-primary-foreground/60 hover:text-primary-foreground text-xs lg:text-sm underline transition-colors"
          >
            Acesso Administrativo
          </button>
          </div>
        </ResponsiveContainer>
      </footer>
    </div>
  );
};

export default Home;