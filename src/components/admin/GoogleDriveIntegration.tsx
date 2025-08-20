import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FolderOpen, 
  Upload, 
  Link2, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Image,
  FileText,
  Video,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const GoogleDriveIntegration: React.FC = () => {
  const [driveFolder, setDriveFolder] = useState(() => {
    return localStorage.getItem('google_drive_folder') || '';
  });
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('google_api_key') || '';
  });
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

  const handleSaveConfig = async () => {
    if (!driveFolder.trim()) {
      toast({
        title: "Pasta necessária",
        description: "Por favor, insira o ID da pasta do Google Drive",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key necessária",
        description: "Por favor, insira a API Key do Google",
        variant: "destructive"
      });
      return;
    }

    try {
      localStorage.setItem('google_drive_folder', driveFolder);
      localStorage.setItem('google_api_key', apiKey);
      
      toast({
        title: "Configurações salvas",
        description: "Integração com Google Drive configurada com sucesso"
      });

      // Testar conexão após salvar
      await testConnection();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    }
  };

  const testConnection = async () => {
    if (!driveFolder || !apiKey) {
      toast({
        title: "Configuração incompleta",
        description: "Configure a pasta e API Key primeiro",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Simular teste de conexão com Google Drive API
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${driveFolder}'+in+parents&key=${apiKey}`,
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
        setConnected(true);
        toast({
          title: "Conexão bem-sucedida",
          description: `Conectado ao Google Drive. ${data.files?.length || 0} arquivos encontrados`,
        });
      } else {
        throw new Error('Falha na conexão');
      }
    } catch (error) {
      setConnected(false);
      setFiles([]);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao Google Drive. Verifique as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const copyFileUrl = (fileId: string, fileName: string) => {
    const url = `https://drive.google.com/file/d/${fileId}/view`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada",
      description: `URL de ${fileName} copiada para a área de transferência`
    });
  };

  const getPublicImageUrl = (fileId: string) => {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  };

  return (
    <div className="space-y-6">
      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Integração Google Drive
          </CardTitle>
          <CardDescription>
            Configure o Google Drive como banco de imagens e arquivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Badge variant={connected ? "default" : "secondary"} className="flex items-center gap-1">
              {connected ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {connected ? 'Conectado' : 'Desconectado'}
            </Badge>
            {files.length > 0 && (
              <Badge variant="outline">
                {files.length} arquivos
              </Badge>
            )}
            <Button onClick={testConnection} disabled={loading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Testar Conexão
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="drive-folder">ID da Pasta do Google Drive</Label>
              <Input
                id="drive-folder"
                placeholder="1ABc2dEfGhI3jKlMnOpQrStUvWxYz"
                value={driveFolder}
                onChange={(e) => setDriveFolder(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Encontre o ID na URL da pasta: https://drive.google.com/drive/folders/[ID_DA_PASTA]
              </p>
            </div>

            <div>
              <Label htmlFor="api-key">API Key do Google</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Insira sua API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button onClick={handleSaveConfig} className="w-full">
              Salvar Configurações
            </Button>

            <Alert>
              <FolderOpen className="h-4 w-4" />
              <AlertDescription>
                <strong>Como configurar:</strong><br />
                1. Crie uma pasta no Google Drive para armazenar imagens<br />
                2. Torne a pasta pública (qualquer pessoa com o link pode visualizar)<br />
                3. Copie o ID da pasta da URL<br />
                4. Configure uma API Key no Google Cloud Console<br />
                5. Cole as informações acima e teste a conexão
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Arquivos */}
      {connected && files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Arquivos Disponíveis
            </CardTitle>
            <CardDescription>
              Arquivos encontrados na pasta configurada do Google Drive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file: any) => (
                <Card key={file.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {getFileIcon(file.mimeType)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {file.mimeType?.split('/')[0] || 'arquivo'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyFileUrl(file.id, file.name)}
                      className="flex-1"
                    >
                      <Link2 className="h-3 w-3 mr-1" />
                      Copiar URL
                    </Button>
                    {file.mimeType?.startsWith('image/') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const url = getPublicImageUrl(file.id);
                          navigator.clipboard.writeText(url);
                          toast({
                            title: "URL de imagem copiada",
                            description: "URL direta da imagem copiada"
                          });
                        }}
                      >
                        <Image className="h-3 w-3 mr-1" />
                        URL Imagem
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções para upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Como Adicionar Arquivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="border-l-2 border-primary pl-3">
              <p className="font-medium">1. Acesse sua pasta no Google Drive</p>
              <p className="text-muted-foreground">Use o link ou navegue até a pasta configurada</p>
            </div>
            <div className="border-l-2 border-primary pl-3">
              <p className="font-medium">2. Faça upload dos arquivos</p>
              <p className="text-muted-foreground">Arraste e solte ou use o botão "Novo" {">"} "Fazer upload de arquivo"</p>
            </div>
            <div className="border-l-2 border-primary pl-3">
              <p className="font-medium">3. Atualize a lista</p>
              <p className="text-muted-foreground">Clique em "Testar Conexão" para ver os novos arquivos</p>
            </div>
            <div className="border-l-2 border-primary pl-3">
              <p className="font-medium">4. Use as URLs</p>
              <p className="text-muted-foreground">Copie as URLs dos arquivos para usar no site</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleDriveIntegration;