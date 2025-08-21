import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Database,
  Info,
  Wrench
} from 'lucide-react';
import { dataIntegrityService, IntegrityIssue } from '@/services/dataIntegrityService';
import { toast } from '@/hooks/use-toast';

const ConsistencyValidator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);
  const [issues, setIssues] = useState<IntegrityIssue[]>([]);

  const validateData = async () => {
    setLoading(true);
    try {
      const foundIssues = await dataIntegrityService.validateDataIntegrity();
      setIssues(foundIssues);
      setLastValidation(new Date());

      const criticalCount = foundIssues.filter(i => i.severity === 'critical').length;
      const highCount = foundIssues.filter(i => i.severity === 'high').length;
      const mediumCount = foundIssues.filter(i => i.severity === 'medium').length;
      const lowCount = foundIssues.filter(i => i.severity === 'low').length;

      if (foundIssues.length === 0) {
        toast({
          title: "Validação concluída",
          description: "Todos os dados estão íntegros e consistentes!",
        });
      } else {
        toast({
          title: "Validação concluída",
          description: `${criticalCount} críticos, ${highCount} altos, ${mediumCount} médios, ${lowCount} baixos`,
          variant: criticalCount > 0 ? "destructive" : "default"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na validação",
        description: "Não foi possível validar a integridade dos dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fixAllFixableIssues = async () => {
    setFixing(true);
    const fixableIssues = issues.filter(issue => issue.fixable);
    let fixedCount = 0;

    try {
      for (const issue of fixableIssues) {
        const success = await dataIntegrityService.fixIssue(issue);
        if (success) {
          fixedCount++;
        }
      }

      if (fixedCount > 0) {
        toast({
          title: "Problemas corrigidos",
          description: `${fixedCount} de ${fixableIssues.length} problemas foram corrigidos`,
        });
        
        // Re-validate after fixing
        await validateData();
      } else {
        toast({
          title: "Nenhum problema corrigido",
          description: "Não foi possível corrigir automaticamente os problemas",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na correção",
        description: "Falha ao corrigir os problemas encontrados",
        variant: "destructive"
      });
    } finally {
      setFixing(false);
    }
  };

  const getSeverityBadge = (severity: IntegrityIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="bg-red-600">🔥 Crítico</Badge>;
      case 'high':
        return <Badge variant="destructive">❌ Alto</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⚠️ Médio</Badge>;
      case 'low':
        return <Badge variant="outline">ℹ️ Baixo</Badge>;
    }
  };

  const getSeverityIcon = (severity: IntegrityIssue['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Validador de Consistência de Dados
          </CardTitle>
          <CardDescription>
            Verifica a integridade e consistência dos dados entre Google Sheets e a aplicação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {lastValidation && (
                <Badge variant="outline" className="text-xs">
                  Última validação: {lastValidation.toLocaleString('pt-BR')}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {issues.some(issue => issue.fixable) && (
                <Button 
                  onClick={fixAllFixableIssues} 
                  disabled={fixing}
                  variant="secondary"
                  size="sm"
                >
                  <Wrench className={`h-4 w-4 mr-2 ${fixing ? 'animate-pulse' : ''}`} />
                  {fixing ? 'Corrigindo...' : 'Corrigir Problemas'}
                </Button>
              )}
              <Button onClick={validateData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Validando...' : 'Validar Consistência'}
              </Button>
            </div>
          </div>

          {issues.length > 0 && (
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-3 text-center">
                  <div className="text-lg font-bold text-red-600">
                    {issues.filter(i => i.severity === 'critical').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Críticos</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-lg font-bold text-red-500">
                    {issues.filter(i => i.severity === 'high').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Altos</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    {issues.filter(i => i.severity === 'medium').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Médios</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {issues.filter(i => i.severity === 'low').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Baixos</div>
                </Card>
              </div>

              {issues.map((issue, index) => (
                <Alert key={index} className={`border-l-4 ${
                  issue.severity === 'critical' || issue.severity === 'high' ? 'border-l-red-500' :
                  issue.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {issue.entity.charAt(0).toUpperCase() + issue.entity.slice(1)}
                            {issue.entityId && `: ${issue.entityId}`}
                          </span>
                          {getSeverityBadge(issue.severity)}
                          {issue.fixable && (
                            <Badge variant="outline" className="text-xs">
                              Corrigível
                            </Badge>
                          )}
                        </div>
                        <AlertDescription className="text-sm">
                          <strong>{issue.message}</strong>
                          {issue.details && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {issue.details}
                            </div>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {issues.length === 0 && lastValidation && (
            <Alert className="border-l-4 border-l-green-500">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>Todos os dados estão consistentes!</strong>
                <div className="mt-1 text-xs text-muted-foreground">
                  Nenhum problema de integridade foi encontrado na última validação.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {issues.length === 0 && !lastValidation && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Clique em "Validar Consistência" para verificar a integridade dos dados.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsistencyValidator;