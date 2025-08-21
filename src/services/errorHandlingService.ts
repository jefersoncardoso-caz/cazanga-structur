export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  context?: any;
}

class ErrorHandlingService {
  private errors: AppError[] = [];

  logError(error: AppError): void {
    this.errors.push(error);
    console.error(`[${error.code}] ${error.message}`, error);
    
    // Send to monitoring service (future implementation)
    // this.sendToSentry(error);
  }

  createError(code: string, message: string, details?: string, context?: any): AppError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
      context
    };
  }

  handleGoogleSheetsError(error: any): AppError {
    if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      return this.createError(
        'SHEETS_PERMISSION_DENIED',
        'Acesso negado ao Google Sheets',
        'Verifique se a conta de serviço tem permissão de editor na planilha',
        { originalError: error }
      );
    }

    if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      return this.createError(
        'SHEETS_NOT_FOUND',
        'Planilha não encontrada',
        'Verifique se o ID da planilha está correto e se ela existe',
        { originalError: error }
      );
    }

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return this.createError(
        'SHEETS_QUOTA_EXCEEDED',
        'Cota de API excedida',
        'Tente novamente em alguns minutos. Considere reduzir a frequência de requisições',
        { originalError: error }
      );
    }

    if (error.message?.includes('timeout')) {
      return this.createError(
        'SHEETS_TIMEOUT',
        'Timeout na conexão',
        'A conexão com o Google Sheets demorou muito. Tente novamente',
        { originalError: error }
      );
    }

    return this.createError(
      'SHEETS_UNKNOWN_ERROR',
      'Erro desconhecido no Google Sheets',
      error.message || 'Erro não identificado',
      { originalError: error }
    );
  }

  getUserFriendlyMessage(error: AppError): string {
    switch (error.code) {
      case 'SHEETS_PERMISSION_DENIED':
        return 'Sem permissão para acessar a planilha. Configure as permissões na aba Google Sheets.';
      case 'SHEETS_NOT_FOUND':
        return 'Planilha não encontrada. Verifique o ID da planilha nas configurações.';
      case 'SHEETS_QUOTA_EXCEEDED':
        return 'Muitas requisições. Aguarde alguns minutos e tente novamente.';
      case 'SHEETS_TIMEOUT':
        return 'Conexão lenta. Tente novamente em alguns segundos.';
      default:
        return error.message;
    }
  }

  getRetryable(error: AppError): boolean {
    return ['SHEETS_TIMEOUT', 'SHEETS_QUOTA_EXCEEDED'].includes(error.code);
  }

  getRecentErrors(): AppError[] {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.errors.filter(error => error.timestamp > oneHourAgo);
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const errorHandlingService = new ErrorHandlingService();