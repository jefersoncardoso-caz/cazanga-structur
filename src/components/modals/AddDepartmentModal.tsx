import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import { Department } from '@/contexts/AppContext';
import { googleSheetsService } from '@/services/googleSheetsService';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDepartment?: Department | null;
}

const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({ 
  isOpen, 
  onClose, 
  editingDepartment 
}) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: editingDepartment?.id || uuidv4(),
    name: editingDepartment?.name || '',
    color: editingDepartment?.color || '#1f4e78',
    visible: editingDepartment?.visible !== false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o nome do departamento",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const department = {
        id: formData.id,
        name: formData.name,
        color: formData.color,
        visible: formData.visible
      };

      if (editingDepartment) {
        dispatch({ type: 'UPDATE_DEPARTMENT', payload: { id: department.id, updates: department } });
        toast({
          title: "Departamento atualizado",
          description: `${department.name} foi atualizado com sucesso`
        });
      } else {
        await googleSheetsService.addDepartment(department);
        dispatch({ type: 'ADD_DEPARTMENT', payload: { ...department, employees: [] } });
        toast({
          title: "Departamento adicionado",
          description: `${department.name} foi adicionado com sucesso`
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar departamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    { name: 'Azul', value: '#1f4e78' },
    { name: 'Verde', value: '#548235' },
    { name: 'Vermelho', value: '#c5504b' },
    { name: 'Laranja', value: '#d28c47' },
    { name: 'Roxo', value: '#7b68a6' },
    { name: 'Cinza', value: '#5b5b5b' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingDepartment ? 'Editar Departamento' : 'Adicionar Departamento'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Departamento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Recursos Humanos"
            />
          </div>

          <div>
            <Label>Cor do Departamento</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-full h-12 rounded-lg border-2 transition-all flex items-center justify-center text-white text-xs font-medium ${
                    formData.color === color.value 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-muted hover:border-muted-foreground'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleInputChange('color', color.value)}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="color-custom">Cor Personalizada (Hex)</Label>
            <Input
              id="color-custom"
              type="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="h-12"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="visible"
              checked={formData.visible}
              onCheckedChange={(checked) => handleInputChange('visible', checked)}
            />
            <Label htmlFor="visible">Visível no organograma</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : editingDepartment ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDepartmentModal;