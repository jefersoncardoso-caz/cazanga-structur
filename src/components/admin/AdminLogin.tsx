import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Lock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const { state } = useApp();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    
    // Simulate a delay for authentication
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (password === 'cazanga@2025') {
      onLogin();
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
    
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          {state.siteSettings.logo ? (
            <img 
              src={state.siteSettings.logo} 
              alt={`Logo ${state.siteSettings.companyName}`}
              className="h-16 w-auto mx-auto mb-4 object-contain"
            />
          ) : (
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building2 className="w-12 h-12 text-primary" />
              <h1 className="text-2xl font-bold text-primary">{state.siteSettings.companyName}</h1>
            </div>
          )}
          <h2 className="text-lg text-muted-foreground">Painel Administrativo</h2>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Acesso Restrito
            </CardTitle>
            <CardDescription>
              Digite a senha para acessar o painel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleLogin} 
              disabled={loading || !password.trim()}
              className="w-full"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </Button>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = '/'}
            className="text-muted-foreground hover:text-primary"
          >
            ← Voltar ao site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;