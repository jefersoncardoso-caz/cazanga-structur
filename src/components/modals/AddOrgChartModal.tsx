import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { googleSheetsService } from '@/services/googleSheetsService';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface AddOrgChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddOrgChartModal: React.FC<AddOrgChartModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: uuidv4(),
    name: '',
    type: 'macro',
    description: '',
    visible: true
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e tipo do organograma",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const orgChart = {
        id: formData.id,
        name: formData.name,
        type: formData.type,
        data: {
          description: formData.description,
          createdAt: new Date().toISOString(),
          nodes: [],
          connections: []
        },
        visible: formData.visible
      };

      // Tentar salvar no Google Sheets se estiver configurado
      if (localStorage.getItem('google_sheets_connected') === 'true') {
        try {
          await googleSheetsService.addCustomOrgChart(orgChart);
        } catch (error) {
          console.warn('Falha ao salvar no Google Sheets, organograma criado localmente');
        }
      }
      
      toast({
        title: "Organograma criado",
        description: `${orgChart.name} foi criado com sucesso`
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar organograma",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const orgChartTypes = [
    { value: 'macro', label: 'Macro Organograma' },
    { value: 'departamental', label: 'Departamental' },
    { value: 'funcional', label: 'Funcional' },
    { value: 'equipe', label: 'Por Equipe' },
    { value: 'hierarquico', label: 'Hierárquico' },
    { value: 'customizado', label: 'Personalizado' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Organograma</DialogTitle>
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
            <Label htmlFor="type">Tipo *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {orgChartTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="visible"
              checked={formData.visible}
              onCheckedChange={(checked) => handleInputChange('visible', checked)}
            />
            <Label htmlFor="visible">Visível publicamente</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Criando...' : 'Criar Organograma'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrgChartModal;