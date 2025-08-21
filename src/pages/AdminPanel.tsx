import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, Settings, FileText, Palette, Link2, Database, Sheet, Plus, Folder, CheckSquare, Building2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import GoogleSheetsConfig from '@/components/admin/GoogleSheetsConfig';
import GoogleDriveIntegration from '@/components/admin/GoogleDriveIntegration';
import StructureValidator from '@/components/admin/StructureValidator';
import AutoSyncManager from '@/components/admin/AutoSyncManager';
import AdminLogin from '@/components/admin/AdminLogin';
import AddEmployeeModal from '@/components/modals/AddEmployeeModal';
import AddDepartmentModal from '@/components/modals/AddDepartmentModal';
import EditDepartmentModal from '@/components/modals/EditDepartmentModal';
import AddOrgChartModal from '@/components/modals/AddOrgChartModal';
import EditOrgChartModal from '@/components/modals/EditOrgChartModal';
import FileManager from '@/components/admin/FileManager';
import { googleSheetsService } from '@/services/googleSheetsService';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useAutoSync } from '@/hooks/useAutoSync';

const AdminPanel = () => {
  const { state, dispatch } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { loadAllData } = useGoogleSheets();
  const { manualSync, loadFromSheets } = useAutoSync();
  
  // Modal states
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
  const [addDepartmentModalOpen, setAddDepartmentModalOpen] = useState(false);
  const [editDepartmentModalOpen, setEditDepartmentModalOpen] = useState(false);
  const [addOrgChartModalOpen, setAddOrgChartModalOpen] = useState(false);
  const [editOrgChartModalOpen, setEditOrgChartModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingOrgChart, setEditingOrgChart] = useState(null);
  
  // Organogramas carregados do Google Sheets
  const [orgCharts, setOrgCharts] = useState<Array<{id: string; name: string; type: string; description?: string}>>([]);
  
  // Carregar organogramas do Google Sheets
  useEffect(() => {
    const loadOrgCharts = async () => {
      try {
        const isConnected = localStorage.getItem('google_sheets_connected') === 'true';
        if (isConnected) {
          const customOrgCharts = await googleSheetsService.getCustomOrgCharts();
          setOrgCharts(customOrgCharts);
        }
      } catch (error) {
        console.error('Error loading org charts:', error);
        setOrgCharts([]);
      }
    };

    if (isAuthenticated) {
      loadOrgCharts();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    dispatch({ type: 'SET_ADMIN', payload: true });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    dispatch({ type: 'SET_ADMIN', payload: false });
    dispatch({ type: 'SET_VIEW', payload: 'home' });
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Menu reorganizado em grupos lógicos
  const menuGroups = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Settings }
      ]
    },
    {
      title: 'Gestão de Dados',
      items: [
        { id: 'employees', label: 'Funcionários', icon: Users },
        { id: 'departments', label: 'Departamentos', icon: Users },
        { id: 'orgcharts', label: 'Organogramas', icon: Users }
      ]
    },
    {
      title: 'Configuração do Site',
      items: [
        { id: 'design', label: 'Identidade Visual', icon: Palette },
        { id: 'pages', label: 'Menu Lateral', icon: Link2 }
      ]
    },
    {
      title: 'Integrações e Arquivos',
      items: [
        { id: 'googlesheets', label: 'Google Sheets', icon: Sheet },
        { id: 'googledrive', label: 'Google Drive', icon: Folder },
        { id: 'validator', label: 'Validador', icon: CheckSquare },
        { id: 'files', label: 'Arquivos', icon: FileText }
      ]
    },
    {
      title: 'Sistema',
      items: [
        { id: 'sync', label: 'Sincronização', icon: Database },
        { id: 'settings', label: 'Configurações', icon: Settings }
      ]
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <div className="flex gap-2">
                <Button onClick={loadFromSheets} variant="outline" size="sm">
                  Recarregar do Google Sheets
                </Button>
                <Button onClick={manualSync} variant="outline" size="sm">
                  Sincronizar Agora
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <Sheet className="w-8 h-8 text-primary" />
                  <h3 className="text-lg font-semibold">Organogramas</h3>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {orgCharts.length}
                </p>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-8 h-8 text-primary" />
                  <h3 className="text-lg font-semibold">Sincronização</h3>
                </div>
                <p className="text-sm font-medium text-green-600">
                  {localStorage.getItem('google_sheets_connected') === 'true' ? 'Conectado' : 'Desconectado'}
                </p>
                <p className="text-xs text-muted-foreground">Google Sheets</p>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => setAddEmployeeModalOpen(true)}
                >
                  <Users className="w-6 h-6 mb-2" />
                  Adicionar Funcionário
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => setAddDepartmentModalOpen(true)}
                >
                  <Users className="w-6 h-6 mb-2" />
                  Adicionar Departamento
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => setActiveTab('design')}
                >
                  <Palette className="w-6 h-6 mb-2" />
                  Identidade Visual
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => setActiveTab('validator')}
                >
                  <CheckSquare className="w-6 h-6 mb-2" />
                  Validar Estrutura
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'employees':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gerenciar Funcionários</h2>
              <Button onClick={() => setAddEmployeeModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Funcionário
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.employees.length === 0 ? (
                <Card className="col-span-full p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum funcionário cadastrado.
                    <br />
                    Use o botão "Adicionar Funcionário" ou importe do Google Sheets.
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
                        const confirmed = window.confirm(`Tem certeza que deseja remover ${employee.name}?`);
                        if (confirmed) {
                          dispatch({ type: 'DELETE_EMPLOYEE', payload: employee.id });
                          toast({
                            title: "Funcionário removido",
                            description: `${employee.name} foi removido`
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

      case 'departments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gerenciar Departamentos</h2>
              <Button onClick={() => setAddDepartmentModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Departamento
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.departments.length === 0 ? (
                <Card className="col-span-full p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum departamento cadastrado.
                    <br />
                    Use o botão "Adicionar Departamento" ou importe do Google Sheets.
                  </p>
                </Card>
              ) : (
                state.departments.map((department) => (
                  <Card key={department.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: department.color }}
                      ></div>
                      <h4 className="font-medium">{department.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {department.employees.length} funcionários
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingDepartment(department);
                        setEditDepartmentModalOpen(true);
                      }}>Editar</Button>
                      <Button size="sm" variant="destructive" onClick={() => {
                        setEditingDepartment(department);
                        setEditDepartmentModalOpen(true);
                      }}>Excluir</Button>
                    </div>
                  </Card>
                ))
              )}
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
              {orgCharts.length === 0 ? (
                <Card className="col-span-full p-8 text-center">
                  <p className="text-muted-foreground">
                    {localStorage.getItem('google_sheets_connected') === 'true' 
                      ? 'Nenhum organograma criado ainda.'
                      : 'Google Sheets não configurado.'
                    }
                    <br />
                    {localStorage.getItem('google_sheets_connected') === 'true' 
                      ? 'Use o botão "Adicionar Organograma" para criar seu primeiro organograma.'
                      : 'Configure a integração com Google Sheets primeiro.'
                    }
                  </p>
                </Card>
              ) : (
                orgCharts.map((chart) => (
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
                ))
              )}
            </div>
          </div>
        );

      case 'design':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Identidade Visual</h2>
            
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
                  <Label>Logo da Empresa</Label>
                  <Input 
                    value={state.siteSettings.logo || ''} 
                    onChange={(e) => dispatch({ 
                      type: 'UPDATE_SITE_SETTINGS', 
                      payload: { logo: e.target.value } 
                    })}
                    placeholder="URL do logo da empresa"
                  />
                  {state.siteSettings.logo && (
                    <div className="mt-2">
                      <img 
                        src={state.siteSettings.logo} 
                        alt="Logo preview" 
                        className="h-16 w-auto object-contain border rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
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
                          description: "Informações da empresa salvas no Google Sheets"
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
                  <Label>Cor Primária</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-12 h-12 bg-primary rounded-lg border"></div>
                    <Input 
                      type="color"
                      value={state.siteSettings.primaryColor} 
                      onChange={(e) => dispatch({ 
                        type: 'UPDATE_SITE_SETTINGS', 
                        payload: { primaryColor: e.target.value } 
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Cor Secundária</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-12 h-12 bg-secondary rounded-lg border"></div>
                    <Input 
                      type="color"
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
                  if (localStorage.getItem('google_sheets_connected') === 'true') {
                    await googleSheetsService.updateSiteSettings(state.siteSettings);
                    toast({
                      title: "Cores salvas",
                      description: "Cores da marca salvas no Google Sheets"
                    });
                  } else {
                    localStorage.setItem('site_settings', JSON.stringify(state.siteSettings));
                    toast({
                      title: "Cores salvas localmente",
                      description: "Configure o Google Sheets para sincronização completa"
                    });
                  }

                  // Aplicar as cores no CSS imediatamente
                  const root = document.documentElement;
                  
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
                    description: "Erro ao salvar cores",
                    variant: "destructive"
                  });
                }
              }}>Salvar Cores</Button>
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
                              payload: { carouselImages: newImages }
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

                <Button onClick={async () => {
                  try {
                    if (localStorage.getItem('google_sheets_connected') === 'true') {
                      await googleSheetsService.updateSiteSettings(state.siteSettings);
                      toast({
                        title: "Carrossel salvo",
                        description: "Imagens do carrossel salvas no Google Sheets"
                      });
                    } else {
                      localStorage.setItem('site_settings', JSON.stringify(state.siteSettings));
                      toast({
                        title: "Carrossel salvo localmente",
                        description: "Configure o Google Sheets para sincronização completa"
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Erro",
                      description: "Erro ao salvar carrossel",
                      variant: "destructive"
                    });
                  }
                }}>Salvar Carrossel</Button>
              </div>
            </Card>
          </div>
        );

      case 'googlesheets':
        return <GoogleSheetsConfig />;

      case 'googledrive':
        return <GoogleDriveIntegration />;

      case 'validator':
        return <StructureValidator />;

      case 'files':
        return <FileManager />;

      case 'sync':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Sincronização</h2>
            <AutoSyncManager />
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sincronização Manual</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={loadFromSheets}>
                    Importar do Google Sheets
                  </Button>
                  <Button onClick={manualSync} variant="outline">
                    Exportar para Google Sheets
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use a importação para carregar dados do Google Sheets e a exportação para salvar dados locais no Google Sheets.
                </p>
              </div>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Backup e Restauração</h3>
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
                
                <p className="text-sm text-muted-foreground">
                  Crie um backup local dos dados para proteção contra perda de informações.
                </p>
              </div>
            </Card>
          </div>
        );

      case 'pages':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Menu Lateral</h2>
            <Card className="p-6">
              <p className="text-muted-foreground">
                Configurações do menu lateral do site em desenvolvimento.
              </p>
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
              {state.siteSettings.logo ? (
                <>
                  <img 
                    src={state.siteSettings.logo} 
                    alt={`Logo ${state.siteSettings.companyName}`}
                    className="h-8 w-auto object-contain"
                  />
                  <h1 className="text-xl font-bold">Painel Administrativo</h1>
                </>
              ) : (
                <>
                  <Building2 className="w-6 h-6" />
                  <h1 className="text-xl font-bold">Painel Administrativo - {state.siteSettings.companyName}</h1>
                </>
              )}
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
          <nav className="space-y-4">
            {menuGroups.map((group, index) => (
              <div key={index}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab(item.id)}
                        size="sm"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
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
        onClose={() => setAddDepartmentModalOpen(false)} 
      />
      <EditDepartmentModal 
        isOpen={editDepartmentModalOpen} 
        onClose={() => {
          setEditDepartmentModalOpen(false);
          setEditingDepartment(null);
        }}
        department={editingDepartment}
      />
      <AddOrgChartModal 
        isOpen={addOrgChartModalOpen} 
        onClose={() => setAddOrgChartModalOpen(false)}
        onSuccess={() => {
          // Recarregar organogramas após adicionar um novo
          const loadOrgCharts = async () => {
            try {
              const isConnected = localStorage.getItem('google_sheets_connected') === 'true';
              if (isConnected) {
                const customOrgCharts = await googleSheetsService.getCustomOrgCharts();
                setOrgCharts(customOrgCharts);
              }
            } catch (error) {
              console.error('Error reloading org charts:', error);
            }
          };
          loadOrgCharts();
        }}
      />
      <EditOrgChartModal 
        isOpen={editOrgChartModalOpen} 
        onClose={() => {
          setEditOrgChartModalOpen(false);
          setEditingOrgChart(null);
        }}
        orgChart={editingOrgChart}
        onSave={(updatedChart) => {
          setOrgCharts(prev => prev.map(chart => 
            chart.id === updatedChart.id ? updatedChart : chart
          ));
          toast({
            title: "Organograma atualizado",
            description: "Organograma foi atualizado com sucesso"
          });
        }}
        onDelete={(chartId) => {
          setOrgCharts(prev => prev.filter(chart => chart.id !== chartId));
          toast({
            title: "Organograma removido",
            description: "Organograma foi removido com sucesso"
          });
        }}
      />
    </div>
  );
};

export default AdminPanel;