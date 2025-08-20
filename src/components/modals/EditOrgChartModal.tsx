import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface OrgChart {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface EditOrgChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgChart: OrgChart | null;
  onSave: (orgChart: OrgChart) => void;
  onDelete: (id: string) => void;
}

const EditOrgChartModal: React.FC<EditOrgChartModalProps> = ({ 
  isOpen, 
  onClose, 
  orgChart,
  onSave,
  onDelete
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: orgChart?.name || '',
    type: orgChart?.type || '',
    description: orgChart?.description || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o nome do organograma",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const updatedOrgChart = {
        id: orgChart?.id || '',
        name: formData.name,
        type: formData.type,
        description: formData.description
      };
      
      onSave(updatedOrgChart);
      onClose();
      
      toast({
        title: "Organograma atualizado",
        description: `${formData.name} foi atualizado com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar organograma",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!orgChart?.id) return;
    
    const confirmed = window.confirm(`Tem certeza que deseja excluir o organograma "${orgChart.name}"?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      onDelete(orgChart.id);
      onClose();
      
      toast({
        title: "Organograma excluído",
        description: `${orgChart.name} foi excluído com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir organograma",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Organograma</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Organograma *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Organograma Vendas 2025"
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              placeholder="Ex: Departamental"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o propósito deste organograma..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
            className="mr-auto"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrgChartModal;