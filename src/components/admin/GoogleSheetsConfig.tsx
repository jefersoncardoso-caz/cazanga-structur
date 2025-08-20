import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
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

  const extractSpreadsheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '';
  };

  const handleUrlSubmit = () => {
    const id = extractSpreadsheetId(spreadsheetUrl);
    if (id) {
      console.log('Spreadsheet ID:', id);
      // Save to localStorage for immediate use
      localStorage.setItem('google_sheets_spreadsheet_id', id);
      localStorage.setItem('google_sheets_url', spreadsheetUrl);
      
      // Test connection after saving
      testConnection();
    } else {
      alert('Por favor, insira uma URL válida do Google Sheets');
    }
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
            <Button onClick={testConnection} disabled={loading} size="sm">
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
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="spreadsheet-url"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={spreadsheetUrl}
                      onChange={(e) => setSpreadsheetUrl(e.target.value)}
                    />
                    <Button onClick={handleUrlSubmit} size="sm">
                      Configurar
                    </Button>
                  </div>
                </div>

                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Instruções de configuração:</strong><br />
                    1. Crie uma planilha no Google Sheets<br />
                    2. Configure as abas conforme a estrutura mostrada na aba "Estrutura"<br />
                    3. Torne a planilha pública para leitura<br />
                    4. Cole a URL completa da planilha acima
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
                      <Button onClick={loadAllData} disabled={loading || !connected} className="w-full">
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
                      <Button onClick={syncToSheets} disabled={loading || !connected} className="w-full">
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