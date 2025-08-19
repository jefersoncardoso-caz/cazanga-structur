import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Building2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { CarouselBasic } from '@/components/ui/carousel-basic';

const Home = () => {
  const { state, dispatch } = useApp();

  const handleEnterOrgChart = () => {
    dispatch({ type: 'SET_VIEW', payload: 'orgchart' });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <Building2 className="w-8 h-8" />
            <h1 className="text-2xl font-bold">{state.siteSettings.companyName}</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Sistema de Organogramas
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {state.siteSettings.introText}
          </p>
          
          {/* Carousel */}
          <Card className="p-8 mb-8 bg-gradient-primary overflow-hidden">
            {state.siteSettings.carouselImages && state.siteSettings.carouselImages.length > 0 ? (
              <CarouselBasic 
                images={state.siteSettings.carouselImages}
                autoPlay={true}
                interval={4000}
              />
            ) : (
              <div className="h-64 bg-white/10 rounded-lg flex items-center justify-center">
                <div className="text-center text-primary-foreground">
                  <Building2 className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  <p className="text-lg">Carrossel de Imagens Institucionais</p>
                  <p className="text-sm opacity-80">Adicione imagens no painel administrativo</p>
                </div>
              </div>
            )}
          </Card>

          {/* CTA Button */}
          <Button 
            size="lg" 
            onClick={handleEnterOrgChart}
            className="bg-secondary hover:bg-secondary-dark text-secondary-foreground text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Entrar nos Organogramas
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Organograma Macro</h3>
              <p className="text-muted-foreground">Visualize a estrutura geral da empresa</p>
            </Card>

            <Card className="p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gente e Gestão</h3>
              <p className="text-muted-foreground">Explore os departamentos e equipes</p>
            </Card>

            <Card className="p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Equipes Detalhadas</h3>
              <p className="text-muted-foreground">Veja informações detalhadas de cada funcionário</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">&copy; 2025 {state.siteSettings.companyName}. Todos os direitos reservados.</p>
          <button 
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin' })}
            className="text-primary-foreground/60 hover:text-primary-foreground text-sm underline transition-colors"
          >
            Acesso Administrativo
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Home;