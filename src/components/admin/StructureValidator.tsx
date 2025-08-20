import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  Database,
  Sheet,
  Info
} from 'lucide-react';
import { googleSheetsService } from '@/services/googleSheetsService';
import { toast } from '@/hooks/use-toast';

interface ValidationResult {
  sheet: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const StructureValidator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  const requiredSheets = [
    {
      name: 'Funcionarios',
      columns: ['ID', 'Nome', 'Cargo', 'Departamento', 'Equipe', 'Descrição', 'Foto (URL)', 'É Gerente', 'ID do Superior', 'Visível'],
      description: 'Lista de funcionários da empresa'
    },
    {
      name: 'Departamentos',
      columns: ['ID', 'Nome', 'Cor', 'Visível'],
      description: 'Departamentos e suas configurações'
    },
    {
      name: 'Configuracoes',
      columns: ['Configuração', 'Valor'],
      description: 'Configurações gerais do site'
    },
    {
      name: 'Organogramas',
      columns: ['ID', 'Nome', 'Tipo', 'Dados (JSON)', 'Visível'],
      description: 'Organogramas personalizados'
    }
  ];

  const validateStructure = async () => {
    setLoading(true);
    const results: ValidationResult[] = [];

    try {
      // Verificar conectividade
      const isConnected = localStorage.getItem('google_sheets_connected') === 'true';
      const spreadsheetId = localStorage.getItem('google_sheets_spreadsheet_id');
      
      if (!isConnected || !spreadsheetId) {
        results.push({
          sheet: 'Conexão',
          status: 'error',
          message: 'Google Sheets não configurado',
          details: 'Configure a conexão primeiro na aba Google Sheets'
        });
        setValidationResults(results);
        setLoading(false);
        return;
      }

      // Validar cada aba necessária
      for (const sheetInfo of requiredSheets) {
        try {
          const data = await googleSheetsService.readSheet(sheetInfo.name);
          
          if (data.length === 0) {
            results.push({
              sheet: sheetInfo.name,
              status: 'error',
              message: 'Aba vazia ou não encontrada',
              details: `A aba "${sheetInfo.name}" não existe ou está vazia. Crie a aba com os cabeçalhos: ${sheetInfo.columns.join(', ')}`
            });
          } else if (data.length === 1) {
            results.push({
              sheet: sheetInfo.name,
              status: 'warning',
              message: 'Aba encontrada mas sem dados',
              details: `A aba "${sheetInfo.name}" existe mas não possui dados. Adicione pelo menos uma linha de dados.`
            });
          } else {
            const headers = data[0];
            const missingColumns = sheetInfo.columns.filter(col => !headers.includes(col));
            
            if (missingColumns.length > 0) {
              results.push({
                sheet: sheetInfo.name,
                status: 'warning',
                message: 'Colunas faltando',
                details: `Colunas faltando: ${missingColumns.join(', ')}`
              });
            } else {
              results.push({
                sheet: sheetInfo.name,
                status: 'success',
                message: `Aba configurada corretamente (${data.length - 1} registros)`,
                details: sheetInfo.description
              });
            }
          }
        } catch (error) {
          results.push({
            sheet: sheetInfo.name,
            status: 'error',
            message: 'Erro ao acessar aba',
            details: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          });
        }
      }

      setValidationResults(results);
      setLastValidation(new Date());

      const errors = results.filter(r => r.status === 'error').length;
      const warnings = results.filter(r => r.status === 'warning').length;

      if (errors === 0 && warnings === 0) {
        toast({
          title: "Validação concluída",
          description: "Todas as abas estão configuradas corretamente!",
        });
      } else {
        toast({
          title: "Validação concluída",
          description: `${errors} erros e ${warnings} avisos encontrados`,
          variant: errors > 0 ? "destructive" : "default"
        });
      }

    } catch (error) {
      toast({
        title: "Erro na validação",
        description: "Não foi possível validar a estrutura",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fixStructureIssues = async () => {
    setLoading(true);
    const results: ValidationResult[] = [];

    try {
      // Create missing sheets with headers
      const sheetsToCreate = requiredSheets.filter(sheet => {
        const result = validationResults.find(r => r.sheet === sheet.name);
        return result && result.status === 'error' && result.message.includes('vazia ou não encontrada');
      });

      for (const sheetInfo of sheetsToCreate) {
        try {
          const headerValues = [sheetInfo.columns];
          await googleSheetsService.writeSheet(sheetInfo.name, headerValues, 'A:Z');
          results.push({
            sheet: sheetInfo.name,
            status: 'success',
            message: 'Aba criada com sucesso',
            details: `Aba "${sheetInfo.name}" foi criada com os cabeçalhos corretos`
          });
        } catch (error) {
          results.push({
            sheet: sheetInfo.name,
            status: 'error',
            message: 'Erro ao criar aba',
            details: `Falha ao criar a aba "${sheetInfo.name}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          });
        }
      }

      // Show results
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      if (successCount > 0) {
        toast({
          title: "Estrutura corrigida",
          description: `${successCount} ${successCount === 1 ? 'aba foi criada' : 'abas foram criadas'} com sucesso${errorCount > 0 ? `, ${errorCount} falhas` : ''}`,
          variant: errorCount > 0 ? "default" : "default"
        });
      }

      if (errorCount > 0 && successCount === 0) {
        toast({
          title: "Erro na correção",
          description: `Falha ao corrigir ${errorCount} ${errorCount === 1 ? 'aba' : 'abas'}`,
          variant: "destructive"
        });
      }

      // Re-validate after fixing
      setTimeout(() => {
        validateStructure();
      }, 1000);

    } catch (error) {
      toast({
        title: "Erro na correção",
        description: "Não foi possível corrigir a estrutura",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">✅ OK</Badge>;
      case 'error':
        return <Badge variant="destructive">❌ Erro</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⚠️ Atenção</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Validador de Estrutura - Google Sheets
          </CardTitle>
          <CardDescription>
            Verifica se todas as abas necessárias estão configuradas corretamente na planilha
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
              {validationResults.some(r => r.status === 'error' && r.message.includes('vazia ou não encontrada')) && (
                <Button 
                  onClick={fixStructureIssues} 
                  disabled={loading}
                  variant="secondary"
                  size="sm"
                >
                  <CheckCircle className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Corrigindo...' : 'Corrigir Problemas'}
                </Button>
              )}
              <Button onClick={validateStructure} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Validando...' : 'Validar Estrutura'}
              </Button>
            </div>
          </div>

          {validationResults.length > 0 && (
            <div className="space-y-3">
              {validationResults.map((result, index) => (
                <Alert key={index} className={`border-l-4 ${
                  result.status === 'success' ? 'border-l-green-500' :
                  result.status === 'error' ? 'border-l-red-500' : 'border-l-yellow-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Aba: {result.sheet}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        <AlertDescription className="text-sm">
                          <strong>{result.message}</strong>
                          {result.details && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {result.details}
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

          {validationResults.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Clique em "Validar Estrutura" para verificar se todas as abas estão configuradas corretamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Guia de estrutura recomendada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sheet className="h-5 w-5" />
            Estrutura Recomendada
          </CardTitle>
          <CardDescription>
            Configure sua planilha com esta estrutura para garantir o funcionamento correto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requiredSheets.map((sheet, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Aba: "{sheet.name}"</h4>
                <p className="text-sm text-muted-foreground mb-3">{sheet.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {sheet.columns.map((column, colIndex) => (
                    <Badge key={colIndex} variant="outline" className="justify-center">
                      {String.fromCharCode(65 + colIndex)}: {column}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StructureValidator;