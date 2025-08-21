import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Upload, 
  Database, 
  Shield,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { backupService } from '@/services/backupService';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

const BackupManager: React.FC = () => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const result = await backupService.createFullBackup();
      toast({
        title: "Backup criado",
        description: result
      });
    } catch (error) {
      toast({
        title: "Erro no backup",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    try {
      // Validate backup first
      const validation = await backupService.validateBackup(file);
      
      if (!validation.isValid) {
        toast({
          title: "Backup inválido",
          description: `Problemas encontrados: ${validation.issues.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      // Confirm restoration
      const confirmed = window.confirm(
        'Tem certeza que deseja restaurar este backup? Todos os dados atuais serão substituídos.'
      );
      
      if (!confirmed) return;

      // Restore backup
      const result = await backupService.restoreFromBackup(file, dispatch);
      
      toast({
        title: "Backup restaurado",
        description: result
      });

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Erro na restauração",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Backup e Restauração
          </CardTitle>
          <CardDescription>
            Crie backups dos dados e restaure quando necessário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create Backup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Criar Backup</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Backup Completo</p>
                <p className="text-sm text-muted-foreground">
                  Inclui funcionários, departamentos, configurações e organogramas
                </p>
              </div>
              <Button onClick={handleCreateBackup} disabled={loading}>
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Criando...' : 'Criar Backup'}
              </Button>
            </div>
          </div>

          {/* Restore Backup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Restaurar Backup</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Restaurar de Arquivo</p>
                  <p className="text-sm text-muted-foreground">
                    Selecione um arquivo de backup para restaurar
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={restoring}
                >
                  {restoring ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {restoring ? 'Restaurando...' : 'Selecionar Arquivo'}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> A restauração de backup substituirá todos os dados atuais. 
                  Certifique-se de criar um backup dos dados atuais antes de prosseguir.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Backup Guidelines */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Diretrizes de Backup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Backup Regular</p>
                    <p className="text-xs text-muted-foreground">
                      Crie backups semanalmente ou antes de grandes alterações
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Armazenamento Seguro</p>
                    <p className="text-xs text-muted-foreground">
                      Mantenha backups em local seguro (Google Drive, Dropbox, etc.)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Sincronização Automática</p>
                    <p className="text-xs text-muted-foreground">
                      Os dados são automaticamente salvos no Google Sheets
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Validação de Integridade</p>
                    <p className="text-xs text-muted-foreground">
                      Backups são validados antes da restauração
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManager;