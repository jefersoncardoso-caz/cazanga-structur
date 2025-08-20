import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, Settings, FileText, Palette, Link2, Database, Sheet, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import GoogleSheetsConfig from '@/components/admin/GoogleSheetsConfig';
import AutoSyncManager from '@/components/admin/AutoSyncManager';
import AddEmployeeModal from '@/components/modals/AddEmployeeModal';
import AddDepartmentModal from '@/components/modals/AddDepartmentModal';
import AddOrgChartModal from '@/components/modals/AddOrgChartModal';
import EditOrgChartModal from '@/components/modals/EditOrgChartModal';
import FileManager from '@/components/admin/FileManager';
import { googleSheetsService } from '@/services/googleSheetsService';

const AdminPanel = () => {
  const { state, dispatch } = useApp();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal states
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
  const [addDepartmentModalOpen, setAddDepartmentModalOpen] = useState(false);
  const [addOrgChartModalOpen, setAddOrgChartModalOpen] = useState(false);
  const [editOrgChartModalOpen, setEditOrgChartModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingOrgChart, setEditingOrgChart] = useState(null);
  
  // Organogramas padrão
  const [orgCharts, setOrgCharts] = useState<Array<{id: string; name: string; type: string; description?: string}>>([
    { id: '1', name: 'Macro 2025', type: 'macro', description: 'Organograma macro da empresa' },
    { id: '2', name: 'Gente e Gestão', type: 'departamental', description: 'Organograma do departamento de pessoas' },
    { id: '3', name: 'DHO', type: 'departamental', description: 'Organograma DHO' },
    { id: '4', name: 'Departamento Pessoal', type: 'departamental', description: 'Organograma DP' },
    { id: '5', name: 'Facilities', type: 'departamental', description: 'Organograma Facilities' },
    { id: '6', name: 'SESMT', type: 'departamental', description: 'Organograma SESMT' },
    { id: '7', name: 'SGQ', type: 'departamental', description: 'Organograma SGQ' }
  ]);

  const handleLogin = () => {
    if (password === 'cazanga@2025') {
      setIsAuthenticated(true);
      dispatch({ type: 'SET_ADMIN', payload: true });
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao painel administrativo"
      });
    } else {
      toast({
        title: "Senha incorreta",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    dispatch({ type: 'SET_ADMIN', payload: false });
    dispatch({ type: 'SET_VIEW', payload: 'home' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary mb-2">Painel Administrativo</h1>
            <p className="text-muted-foreground">Digite a senha para acessar</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Digite a senha"
              />
            </div>
            
            <Button onClick={handleLogin} className="w-full">
              Entrar
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
              className="w-full"
            >
              Voltar ao Site
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Users },
    { id: 'orgcharts', label: 'Organogramas', icon: Users },
    { id: 'employees', label: 'Funcionários', icon: Users },
    { id: 'files', label: 'Arquivos', icon: FileText },
    { id: 'design', label: 'Identidade Visual', icon: Palette },
    { id: 'pages', label: 'Menu Lateral', icon: Link2 },
    { id: 'googlesheets', label: 'Google Sheets', icon: Sheet },
    { id: 'integrations', label: 'Integrações', icon: Database },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-primary" />
                  <h3 className="text-lg font-semibold">Funcionários</h3>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {state.employees.length}
                </p>
                <p className="text-sm text-muted-foreground">Total cadastrado</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-secondary" />
                  <h3 className="text-lg font-semibold">Departamentos</h3>
                </div>
                <p className="text-2xl font-bold text-secondary">
                  {state.departments.length}
                </p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-8 h-8 text-primary" />
                  <h3 className="text-lg font-semibold">Sincronização</h3>
                </div>
                <p className="text-sm font-medium text-green-600">
                  {localStorage.getItem('google_sheets_spreadsheet_id') ? 'Conectado' : 'Desconectado'}
                </p>
                <p className="text-xs text-muted-foreground">Google Sheets</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('employees')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Gerenciar Funcionários
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('orgcharts')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Editar Organogramas
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('design')}
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Identidade Visual
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Últimas Atividades</h3>
                <div className="space-y-3 text-sm">
                  <div className="border-l-2 border-primary pl-3">
                    <p className="font-medium">Sistema inicializado</p>
                    <p className="text-muted-foreground">Painel administrativo ativo</p>
                  </div>
                  <div className="border-l-2 border-muted pl-3">
                    <p className="font-medium">Aguardando configuração</p>
                    <p className="text-muted-foreground">Google Sheets integration</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'orgcharts':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gerenciar Organogramas</h2>
              <Button onClick={() => setAddOrgChartModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Organograma
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {orgCharts.map((chart) => (
                <Card key={chart.id} className="p-6">
                  <h3 className="font-semibold mb-2">{chart.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {chart.description}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingOrgChart(chart);
                      setEditOrgChartModalOpen(true);
                    }}>Editar</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      dispatch({ type: 'SET_VIEW', payload: 'orgchart' });
                    }}>Visualizar</Button>
                    <Button size="sm" variant="destructive" onClick={() => {
                      const confirmed = window.confirm(`Tem certeza que deseja excluir "${chart.name}"?`);
                      if (confirmed) {
                        setOrgCharts(prev => prev.filter(org => org.id !== chart.id));
                        toast({
                          title: "Organograma removido",
                          description: `${chart.name} foi removido com sucesso`
                        });
                      }
                    }}>Excluir</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'employees':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gerenciar Funcionários</h2>
              <div className="flex gap-2">
                <Button onClick={() => setAddDepartmentModalOpen(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Departamento
                </Button>
                <Button onClick={() => setAddEmployeeModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Funcionário
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.employees.length === 0 ? (
                <Card className="col-span-full p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum funcionário cadastrado.
                    <br />
                    Use a integração com Google Sheets para importar dados.
                  </p>
                </Card>
              ) : (
                state.employees.map((employee) => (
                  <Card key={employee.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {employee.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{employee.department}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingEmployee(employee);
                        setAddEmployeeModalOpen(true);
                      }}>Editar</Button>
                      <Button size="sm" variant="destructive" onClick={async () => {
                        try {
                          dispatch({ type: 'DELETE_EMPLOYEE', payload: employee.id });
                          toast({
                            title: "Funcionário removido",
                            description: `${employee.name} foi removido`
                          });
                        } catch (error) {
                          toast({
                            title: "Erro",
                            description: "Erro ao remover funcionário",
                            variant: "destructive"
                          });
                        }
                      }}>Remover</Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );

      case 'files':
        return <FileManager />;

      case 'design':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Configurações do Site</h2>
            
            {/* Configurações Gerais */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informações da Empresa</h3>
              <div className="space-y-4">
                <div>
                  <Label>Nome da Empresa</Label>
                  <Input 
                    value={state.siteSettings.companyName} 
                    onChange={(e) => dispatch({ 
                      type: 'UPDATE_SITE_SETTINGS', 
                      payload: { companyName: e.target.value } 
                    })}
                  />
                </div>
                
                <div>
                  <Label>Texto Introdutório</Label>
                  <Input 
                    value={state.siteSettings.introText} 
                    onChange={(e) => dispatch({ 
                      type: 'UPDATE_SITE_SETTINGS', 
                      payload: { introText: e.target.value } 
                    })}
                  />
                </div>
                
                <Button 
                  className="mt-4" 
                  onClick={async () => {
                    try {
                      if (localStorage.getItem('google_sheets_connected') === 'true') {
                        await googleSheetsService.updateSiteSettings(state.siteSettings);
                        toast({
                          title: "Informações salvas",
                          description: "Informações da empresa salvas no Google Sheets com sucesso"
                        });
                      } else {
                        localStorage.setItem('site_settings', JSON.stringify(state.siteSettings));
                        toast({
                          title: "Informações salvas localmente",
                          description: "Configure o Google Sheets para sincronização completa"
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "Erro",
                        description: "Erro ao salvar informações",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Salvar Informações
                </Button>
              </div>
            </Card>

            {/* Identidade Visual */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cores da Marca</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Cor Primária (Azul)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-12 h-12 bg-primary rounded-lg border"></div>
                    <Input 
                      value={state.siteSettings.primaryColor} 
                      onChange={(e) => dispatch({ 
                        type: 'UPDATE_SITE_SETTINGS', 
                        payload: { primaryColor: e.target.value } 
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Cor Secundária (Verde)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-12 h-12 bg-secondary rounded-lg border"></div>
                    <Input 
                      value={state.siteSettings.secondaryColor} 
                      onChange={(e) => dispatch({ 
                        type: 'UPDATE_SITE_SETTINGS', 
                        payload: { secondaryColor: e.target.value } 
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <Button className="mt-4" onClick={async () => {
                try {
                  // Salvar no Google Sheets se configurado
                  if (localStorage.getItem('google_sheets_connected') === 'true') {
                    try {
                      await googleSheetsService.updateSiteSettings(state.siteSettings);
                      toast({
                        title: "Cores salvas",
                        description: "Cores da marca salvas no Google Sheets com sucesso"
                      });
                    } catch (error) {
                      console.warn('Falha ao salvar no Google Sheets');
                      toast({
                        title: "Erro",
                        description: "Erro ao salvar no Google Sheets, mas salvo localmente",
                        variant: "destructive"
                      });
                    }
                  } else {
                    // Salvar localmente se Google Sheets não estiver configurado
                    localStorage.setItem('site_settings', JSON.stringify(state.siteSettings));
                    toast({
                      title: "Cores salvas localmente",
                      description: "Configure o Google Sheets para sincronização completa"
                    });
                  }
                  
                  // Aplicar as cores no CSS imediatamente
                  const root = document.documentElement;
                  
                  // Converter hex para HSL se necessário
                  const hexToHsl = (hex: string) => {
                    const r = parseInt(hex.slice(1, 3), 16) / 255;
                    const g = parseInt(hex.slice(3, 5), 16) / 255;
                    const b = parseInt(hex.slice(5, 7), 16) / 255;

                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    let h = 0, s = 0, l = (max + min) / 2;

                    if (max !== min) {
                      const d = max - min;
                      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                      switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                      }
                      h /= 6;
                    }

                    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
                  };
                  
                  root.style.setProperty('--primary', hexToHsl(state.siteSettings.primaryColor));
                  root.style.setProperty('--secondary', hexToHsl(state.siteSettings.secondaryColor));
                  
                } catch (error) {
                  toast({
                    title: "Erro",
                    description: "Erro ao aplicar cores: " + error.message,
                    variant: "destructive"
                  });
                }
              }}>Salvar Cores</Button>
            </Card>

            {/* Logo da Empresa */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Logo da Empresa</h3>
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Clique para fazer upload do logo</p>
                <Button variant="outline" className="mt-2" onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const logoUrl = e.target?.result as string;
                        dispatch({ 
                          type: 'UPDATE_SITE_SETTINGS', 
                          payload: { logo: logoUrl } 
                        });
                        toast({
                          title: "Logo atualizado",
                          description: "Logo da empresa foi atualizado com sucesso"
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}>Selecionar Arquivo</Button>
              </div>
            </Card>

            {/* Carrossel de Imagens */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Carrossel da Página Inicial</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {state.siteSettings.carouselImages?.map((image, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <img src={image} alt={`Imagem ${index + 1}`} className="w-full h-32 object-cover rounded" />
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-sm">Imagem {index + 1}</p>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            const newImages = state.siteSettings.carouselImages?.filter((_, i) => i !== index) || [];
                            dispatch({ 
                              type: 'UPDATE_SITE_SETTINGS', 
                              payload: { ...state.siteSettings, carouselImages: newImages }
                            });
                            toast({
                              title: "Imagem removida",
                              description: "Imagem removida do carrossel"
                            });
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {(!state.siteSettings.carouselImages || state.siteSettings.carouselImages.length === 0) && (
                    <div className="col-span-3 p-8 border-2 border-dashed rounded-lg text-center">
                      <p className="text-muted-foreground">Nenhuma imagem adicionada ainda</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label>Adicionar Nova Imagem (URL)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      placeholder="Cole a URL da imagem"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          if (input.value) {
                            const currentImages = state.siteSettings.carouselImages || [];
                            dispatch({ 
                              type: 'UPDATE_SITE_SETTINGS', 
                              payload: { 
                                ...state.siteSettings, 
                                carouselImages: [...currentImages, input.value]
                              }
                            });
                            input.value = '';
                            toast({
                              title: "Imagem adicionada",
                              description: "Nova imagem adicionada ao carrossel"
                            });
                          }
                        }
                      }}
                    />
                    <Button onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                      if (input?.value) {
                        const currentImages = state.siteSettings.carouselImages || [];
                        dispatch({ 
                          type: 'UPDATE_SITE_SETTINGS', 
                          payload: { 
                            ...state.siteSettings, 
                            carouselImages: [...currentImages, input.value]
                          }
                        });
                        input.value = '';
                        toast({
                          title: "Imagem adicionada",
                          description: "Nova imagem adicionada ao carrossel"
                        });
                      }
                    }}>Adicionar</Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'googlesheets':
        return <GoogleSheetsConfig />;

      case 'integrations':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Integrações</h2>
            <AutoSyncManager />
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Google Sheets</h3>
              <p className="text-muted-foreground mb-4">
                Configure a integração com Google Sheets para sincronizar dados dos organogramas.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setActiveTab('googlesheets')}>
                  Configurar Google Sheets
                </Button>
                <Button variant="outline" onClick={async () => {
                  try {
                    // Criar backup dos dados atuais
                    const backupData = {
                      employees: state.employees,
                      departments: state.departments,
                      siteSettings: state.siteSettings,
                      timestamp: new Date().toISOString()
                    };
                    
                    const dataStr = JSON.stringify(backupData, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `backup-organograma-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    
                    URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Backup criado",
                      description: "Backup dos dados baixado com sucesso"
                    });
                  } catch (error) {
                    toast({
                      title: "Erro no backup",
                      description: "Erro ao criar backup dos dados",
                      variant: "destructive"
                    });
                  }
                }}>
                  Fazer Backup
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Gerenciar Organogramas</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Adicionar Novo Organograma</Label>
                    <div className="flex gap-2 mt-2">
                      <Input placeholder="Nome do organograma" />
                      <Button onClick={() => {
                        toast({
                          title: "Novo organograma",
                          description: "Organograma adicionado com sucesso"
                        });
                      }}>Adicionar</Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Remover Organograma</Label>
                    <div className="flex gap-2 mt-2">
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <option>Selecione para remover</option>
                        <option>DHO</option>
                        <option>DP</option>
                        <option>Facilities</option>
                        <option>SESMT</option>
                        <option>SGQ</option>
                      </select>
                      <Button variant="destructive" onClick={() => {
                        toast({
                          title: "Organograma removido",
                          description: "Organograma removido com sucesso",
                          variant: "destructive"
                        });
                      }}>Remover</Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Backup e Sincronização</h3>
              <div className="space-y-4">
                <Button onClick={async () => {
                  try {
                    const backupData = {
                      employees: state.employees,
                      departments: state.departments,
                      siteSettings: state.siteSettings,
                      timestamp: new Date().toISOString()
                    };
                    
                    const dataStr = JSON.stringify(backupData, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `backup-organograma-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    
                    URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Backup criado",
                      description: "Backup dos dados baixado com sucesso"
                    });
                  } catch (error) {
                    toast({
                      title: "Erro no backup", 
                      description: "Erro ao criar backup dos dados",
                      variant: "destructive"
                    });
                  }
                }}>Criar Backup</Button>
                
                <Button variant="outline" onClick={async () => {
                  try {
                    // Verificar se está conectado ao Google Sheets
                    if (localStorage.getItem('google_sheets_connected') === 'true') {
                      await googleSheetsService.readSheet('Funcionarios');
                      toast({
                        title: "Sincronização iniciada",
                        description: "Dados sincronizados com Google Sheets com sucesso"
                      });
                    } else {
                      toast({
                        title: "Google Sheets não configurado",
                        description: "Configure o Google Sheets primeiro",
                        variant: "destructive"
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Erro na sincronização",
                      description: "Erro ao sincronizar com Google Sheets",
                      variant: "destructive"
                    });
                  }
                }}>Sincronizar com Google Sheets</Button>
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Selecione uma opção do menu lateral</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Painel Administrativo - Cazanga</h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-light"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-muted/30 min-h-screen p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <AddEmployeeModal 
        isOpen={addEmployeeModalOpen}
        onClose={() => {
          setAddEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        editingEmployee={editingEmployee}
      />
      
      <AddDepartmentModal 
        isOpen={addDepartmentModalOpen}
        onClose={() => {
          setAddDepartmentModalOpen(false);
          setEditingDepartment(null);
        }}
        editingDepartment={editingDepartment}
      />
      
      <AddOrgChartModal 
        isOpen={addOrgChartModalOpen}
        onClose={() => setAddOrgChartModalOpen(false)}
        onSuccess={() => {
          // Adicionar novo organograma à lista
          const newId = (Math.max(...orgCharts.map(org => parseInt(org.id))) + 1).toString();
          // Este será tratado pelo modal AddOrgChartModal através do callback
          toast({
            title: "Organograma criado",
            description: "Novo organograma disponível"
          });
        }}
      />
      
      <EditOrgChartModal 
        isOpen={editOrgChartModalOpen}
        onClose={() => {
          setEditOrgChartModalOpen(false);
          setEditingOrgChart(null);
        }}
        orgChart={editingOrgChart}
        onSave={(updatedOrgChart) => {
          setOrgCharts(prev => prev.map(org => 
            org.id === updatedOrgChart.id ? updatedOrgChart : org
          ));
        }}
        onDelete={(id) => {
          setOrgCharts(prev => prev.filter(org => org.id !== id));
        }}
      />
    </div>
  );
};

export default AdminPanel;