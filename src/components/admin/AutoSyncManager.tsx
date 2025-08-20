import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Database,
  RotateCcw
} from 'lucide-react';

const AutoSyncManager: React.FC = () => {
  const { state } = useApp();
  const { loading, connected, loadAllData, syncToSheets, testConnection } = useGoogleSheets();
  const [autoSync, setAutoSync] = useState(() => {
    return localStorage.getItem('auto_sync_enabled') === 'true';
  });
  const [lastSync, setLastSync] = useState<Date | null>(() => {
    const saved = localStorage.getItem('last_sync_time');
    return saved ? new Date(saved) : null;
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Auto sync effect
  useEffect(() => {
    if (!autoSync || !connected) return;

    const interval = setInterval(async () => {
      try {
        setSyncStatus('syncing');
        await loadAllData();
        setLastSync(new Date());
        localStorage.setItem('last_sync_time', new Date().toISOString());
        setSyncStatus('success');
        
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (error) {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
    }, 5 * 60 * 1000); // Sync every 5 minutes

    return () => clearInterval(interval);
  }, [autoSync, connected, loadAllData]);

  const handleToggleAutoSync = () => {
    const newValue = !autoSync;
    setAutoSync(newValue);
    localStorage.setItem('auto_sync_enabled', newValue.toString());
    
    toast({
      title: newValue ? "Auto-sincronização ativada" : "Auto-sincronização desativada",
      description: newValue 
        ? "Dados serão sincronizados automaticamente a cada 5 minutos"
        : "Sincronização manual necessária"
    });
  };

  const handleManualSync = async () => {
    try {
      setSyncStatus('syncing');
      await loadAllData();
      setLastSync(new Date());
      localStorage.setItem('last_sync_time', new Date().toISOString());
      setSyncStatus('success');
      
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  const validateDataStructure = () => {
    const issues = [];
    
    // Verificar se há funcionários sem departamento válido
    const validDepartments = state.departments.map(d => d.name);
    const orphanEmployees = state.employees.filter(emp => 
      emp.department && !validDepartments.includes(emp.department)
    );
    
    if (orphanEmployees.length > 0) {
      issues.push(`${orphanEmployees.length} funcionário(s) com departamento inválido`);
    }

    // Verificar hierarquia circular
    const circularRefs = state.employees.filter(emp => {
      if (!emp.parentId) return false;
      let current = emp.parentId;
      let depth = 0;
      while (current && depth < 10) {
        if (current === emp.id) return true;
        const parent = state.employees.find(e => e.id === current);
        current = parent?.parentId;
        depth++;
      }
      return false;
    });

    if (circularRefs.length > 0) {
      issues.push(`${circularRefs.length} referência(s) circular(es) na hierarquia`);
    }

    return issues;
  };

  const dataIssues = validateDataStructure();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Sincronização Automática
        </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-sincronização</p>
              <p className="text-sm text-muted-foreground">
                Sincroniza dados automaticamente a cada 5 minutos
              </p>
            </div>
            <Button 
              variant={autoSync ? "default" : "outline"} 
              onClick={handleToggleAutoSync}
              disabled={!connected}
            >
              {autoSync ? "Ativada" : "Desativada"}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant={connected ? "default" : "secondary"} className="flex items-center gap-1">
              {connected ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {connected ? 'Conectado' : 'Desconectado'}
            </Badge>
            
            <Badge variant={
              syncStatus === 'success' ? 'default' : 
              syncStatus === 'error' ? 'destructive' :
              syncStatus === 'syncing' ? 'secondary' : 'outline'
            } className="flex items-center gap-1">
              {syncStatus === 'syncing' && <RefreshCw className="h-3 w-3 animate-spin" />}
              {syncStatus === 'success' && <CheckCircle className="h-3 w-3" />}
              {syncStatus === 'error' && <XCircle className="h-3 w-3" />}
              {syncStatus === 'idle' ? 'Aguardando' :
               syncStatus === 'syncing' ? 'Sincronizando' :
               syncStatus === 'success' ? 'Sucesso' : 'Erro'}
            </Badge>

            {lastSync && (
              <Badge variant="outline" className="text-xs">
                Última sync: {lastSync.toLocaleString()}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleManualSync} 
              disabled={loading || !connected}
              size="sm"
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
              Sincronizar Agora
            </Button>
            
            <Button 
              onClick={testConnection} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Testar Conexão
            </Button>
          </div>

          {dataIssues.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Problemas detectados na estrutura de dados:</strong>
                <ul className="list-disc list-inside mt-1">
                  {dataIssues.map((issue, index) => (
                    <li key={index} className="text-sm">{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoSyncManager;