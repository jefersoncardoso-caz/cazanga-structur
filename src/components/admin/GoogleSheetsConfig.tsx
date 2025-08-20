import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { toast } from '@/hooks/use-toast';
import { 
  Sheet, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Database
} from 'lucide-react';

const GoogleSheetsConfig: React.FC = () => {
  const { loading, connected, testConnection, loadAllData, syncToSheets } = useGoogleSheets();
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(() => {
    return localStorage.getItem('google_sheets_url') || '';
  });
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('google_api_key') || '';
  });
  const [driveFolder, setDriveFolder] = useState(() => {
    return localStorage.getItem('google_drive_folder') || '';
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    const saved = localStorage.getItem('google_config_last_saved');
    return saved ? new Date(saved) : null;
  });

  const extractSpreadsheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '';
  };

  const handleSaveConfig = async () => {
    const id = extractSpreadsheetId(spreadsheetUrl);
    
    if (!spreadsheetUrl || !id) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida do Google Sheets",
        variant: "destructive"
      });
      return;
    }
    
    if (!apiKey) {
      toast({
        title: "API Key necessária",
        description: "Por favor, insira a API Key do Google",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Save all configurations to localStorage
      localStorage.setItem('google_sheets_spreadsheet_id', id);
      localStorage.setItem('google_sheets_url', spreadsheetUrl);
      localStorage.setItem('google_api_key', apiKey);
      localStorage.setItem('google_drive_folder', driveFolder);
      localStorage.setItem('google_config_last_saved', new Date().toISOString());
      
      setLastSaved(new Date());
      
      toast({
        title: "Configurações salvas",
        description: "Todas as configurações foram salvas com sucesso!"
      });
      
      // Test connection after saving
      await testConnection();
      
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isConfigComplete = () => {
    return spreadsheetUrl && apiKey && extractSpreadsheetId(spreadsheetUrl);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sheet className="h-5 w-5" />
            Configuração Google Sheets
          </CardTitle>
          <CardDescription>
            Configure a integração com Google Sheets para gerenciar dados dos organogramas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Badge variant={connected ? "default" : "secondary"} className="flex items-center gap-1">
              {connected ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {connected ? 'Conectado' : 'Desconectado'}
            </Badge>
            <Badge variant={isConfigComplete() ? "default" : "outline"} className="flex items-center gap-1">
              {isConfigComplete() ? 'Configurado' : 'Não Configurado'}
            </Badge>
            {lastSaved && (
              <Badge variant="outline" className="text-xs">
                Salvo: {lastSaved.toLocaleString()}
              </Badge>
            )}
            <Button onClick={testConnection} disabled={loading || !isConfigComplete()} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Testar Conexão
            </Button>
          </div>

          <Tabs defaultValue="setup">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Configuração</TabsTrigger>
              <TabsTrigger value="structure">Estrutura</TabsTrigger>
              <TabsTrigger value="sync">Sincronização</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="spreadsheet-url">URL da Planilha Google Sheets</Label>
                  <Input
                    id="spreadsheet-url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={spreadsheetUrl}
                    onChange={(e) => setSpreadsheetUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="api-key">API Key do Google</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Insira sua API Key do Google"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="drive-folder">Pasta de Destino do Google Drive (Opcional)</Label>
                  <Input
                    id="drive-folder"
                    placeholder="ID da pasta do Google Drive"
                    value={driveFolder}
                    onChange={(e) => setDriveFolder(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={handleSaveConfig} 
                  disabled={isSaving || !spreadsheetUrl || !apiKey}
                  className="w-full"
                >
                  {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Salvar Configurações
                </Button>

                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Instruções de configuração:</strong><br />
                    1. Crie uma planilha no Google Sheets<br />
                    2. Configure as abas conforme a estrutura mostrada na aba "Estrutura"<br />
                    3. Torne a planilha pública para leitura<br />
                    4. Cole a URL completa da planilha acima<br />
                    5. Insira sua API Key do Google (necessária para funcionalidades avançadas)<br />
                    6. Opcionalmente, configure uma pasta do Google Drive para arquivos
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="structure" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Estrutura das Abas Necessárias</h3>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Aba: "Funcionarios"</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-5 gap-2 text-sm">
                          <div className="font-semibold">A: ID</div>
                          <div className="font-semibold">B: Nome</div>
                          <div className="font-semibold">C: Cargo</div>
                          <div className="font-semibold">D: Departamento</div>
                          <div className="font-semibold">E: Equipe</div>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-sm mt-2">
                          <div className="font-semibold">F: Descrição</div>
                          <div className="font-semibold">G: Foto (URL)</div>
                          <div className="font-semibold">H: É Gerente</div>
                          <div className="font-semibold">I: ID do Superior</div>
                          <div className="font-semibold">J: Visível</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Aba: "Departamentos"</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="font-semibold">A: ID</div>
                          <div className="font-semibold">B: Nome</div>
                          <div className="font-semibold">C: Cor</div>
                          <div className="font-semibold">D: Visível</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Aba: "Configuracoes"</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="font-semibold">A: Configuração</div>
                          <div className="font-semibold">B: Valor</div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Linhas de exemplo: companyName, primaryColor, secondaryColor, introText, logo, carouselImages
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Aba: "Organogramas"</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-5 gap-2 text-sm">
                          <div className="font-semibold">A: ID</div>
                          <div className="font-semibold">B: Nome</div>
                          <div className="font-semibold">C: Tipo</div>
                          <div className="font-semibold">D: Dados (JSON)</div>
                          <div className="font-semibold">E: Visível</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sync" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Importar do Google Sheets
                      </CardTitle>
                      <CardDescription>
                        Carrega todos os dados do Google Sheets para o sistema
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={loadAllData} disabled={loading || !connected || !isConfigComplete()} className="w-full">
                        {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                        Importar Dados
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Exportar para Google Sheets
                      </CardTitle>
                      <CardDescription>
                        Salva os dados atuais do sistema no Google Sheets
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={syncToSheets} disabled={loading || !connected || !isConfigComplete()} className="w-full">
                        {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        Exportar Dados
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <ExternalLink className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dica:</strong> Para melhores resultados, sempre importe os dados após fazer alterações na planilha do Google Sheets. 
                    A sincronização é bidirecional - você pode editar tanto no sistema quanto na planilha.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleSheetsConfig;