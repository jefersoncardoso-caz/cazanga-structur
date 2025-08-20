import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useApp, Department } from '@/contexts/AppContext';
import { googleSheetsService } from '@/services/googleSheetsService';
import { toast } from '@/hooks/use-toast';

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({
  isOpen,
  onClose,
  department
}) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#1f4e78',
    visible: true
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        color: department.color,
        visible: department.visible !== false
      });
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department) return;

    setLoading(true);
    
    try {
      const updatedDepartment = {
        ...department,
        name: formData.name,
        color: formData.color,
        visible: formData.visible
      };

      // Atualizar no contexto local
      dispatch({ 
        type: 'UPDATE_DEPARTMENT', 
        payload: { 
          id: department.id, 
          updates: updatedDepartment 
        } 
      });

      // Sincronizar com Google Sheets se configurado
      if (localStorage.getItem('google_sheets_connected') === 'true') {
        try {
          await googleSheetsService.updateDepartment({
            id: updatedDepartment.id,
            name: updatedDepartment.name,
            color: updatedDepartment.color,
            visible: updatedDepartment.visible,
            employees: updatedDepartment.employees
          });
          toast({
            title: "Departamento atualizado",
            description: `${formData.name} foi atualizado com sucesso no Google Sheets`
          });
        } catch (error) {
          toast({
            title: "Erro na sincronização",
            description: "Departamento atualizado localmente, mas falha no Google Sheets",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Departamento atualizado localmente",
          description: "Configure o Google Sheets para sincronização automática"
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar departamento: " + (error instanceof Error ? error.message : 'Erro desconhecido'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!department) return;

    const confirmed = window.confirm(`Tem certeza que deseja excluir o departamento "${department.name}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    setLoading(true);
    
    try {
      // Remover do contexto local
      dispatch({ type: 'DELETE_DEPARTMENT', payload: department.id });

      // Sincronizar com Google Sheets se configurado
      if (localStorage.getItem('google_sheets_connected') === 'true') {
        try {
          await googleSheetsService.deleteDepartment(department.id);
          toast({
            title: "Departamento removido",
            description: `${department.name} foi removido com sucesso do Google Sheets`
          });
        } catch (error) {
          toast({
            title: "Erro na sincronização",
            description: "Departamento removido localmente, mas falha no Google Sheets",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Departamento removido localmente",
          description: "Configure o Google Sheets para sincronização automática"
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover departamento: " + (error instanceof Error ? error.message : 'Erro desconhecido'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Departamento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Departamento</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="color">Cor do Departamento</Label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="color"
                id="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-12 h-12 rounded border cursor-pointer"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="#1f4e78"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="visible">Departamento Visível</Label>
            <Switch
              id="visible"
              checked={formData.visible}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visible: checked }))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={loading}
            >
              Excluir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDepartmentModal;