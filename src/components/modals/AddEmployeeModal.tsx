import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import { Employee } from '@/contexts/AppContext';
import { googleSheetsService } from '@/services/googleSheetsService';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEmployee?: Employee | null;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ 
  isOpen, 
  onClose, 
  editingEmployee 
}) => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Employee>>(() => ({
    id: editingEmployee?.id || uuidv4(),
    name: editingEmployee?.name || '',
    position: editingEmployee?.position || '',
    department: editingEmployee?.department || '',
    team: editingEmployee?.team || '',
    description: editingEmployee?.description || '',
    photo: editingEmployee?.photo || '',
    isManager: editingEmployee?.isManager || false,
    parentId: editingEmployee?.parentId || '',
    visible: editingEmployee?.visible !== false
  }));

  const handleInputChange = (field: keyof Employee, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.position || !formData.department) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome, posição e departamento",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const employee: Employee = {
        id: formData.id!,
        name: formData.name!,
        position: formData.position!,
        department: formData.department!,
        team: formData.team,
        description: formData.description,
        photo: formData.photo,
        isManager: formData.isManager,
        parentId: formData.parentId,
        visible: formData.visible
      };

      if (editingEmployee) {
        dispatch({ type: 'UPDATE_EMPLOYEE', payload: { id: employee.id, updates: employee } });
        
        // Tentar salvar no Google Sheets se estiver configurado
        if (localStorage.getItem('google_sheets_connected') === 'true') {
          try {
            await googleSheetsService.updateEmployee(employee);
          } catch (error) {
            console.warn('Falha ao salvar no Google Sheets, dados salvos localmente');
          }
        }
        
        toast({
          title: "Funcionário atualizado",
          description: `${employee.name} foi atualizado com sucesso`
        });
      } else {
        // Adicionar localmente primeiro
        dispatch({ type: 'ADD_EMPLOYEE', payload: employee });
        
        // Tentar salvar no Google Sheets se estiver configurado
        if (localStorage.getItem('google_sheets_connected') === 'true') {
          try {
            await googleSheetsService.addEmployee(employee);
          } catch (error) {
            console.warn('Falha ao salvar no Google Sheets, dados salvos localmente');
          }
        }
        
        toast({
          title: "Funcionário adicionado",
          description: `${employee.name} foi adicionado com sucesso`
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar funcionário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const availableManagers = state.employees.filter(emp => 
    emp.isManager && emp.id !== formData.id
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEmployee ? 'Editar Funcionário' : 'Adicionar Funcionário'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <Label htmlFor="position">Posição/Cargo *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Ex: Gerente de Vendas"
              />
            </div>

            <div>
              <Label htmlFor="department">Departamento *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  {state.departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Diretoria">Diretoria</SelectItem>
                  <SelectItem value="RH">Recursos Humanos</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="TI">Tecnologia</SelectItem>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="team">Equipe</Label>
              <Input
                id="team"
                value={formData.team}
                onChange={(e) => handleInputChange('team', e.target.value)}
                placeholder="Nome da equipe"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="photo">URL da Foto</Label>
              <Input
                id="photo"
                value={formData.photo}
                onChange={(e) => handleInputChange('photo', e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
              />
            </div>

            <div>
              <Label htmlFor="parentId">Superior Direto</Label>
              <Select value={formData.parentId} onValueChange={(value) => handleInputChange('parentId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o superior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum superior</SelectItem>
                  {availableManagers.map(manager => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} - {manager.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isManager"
                checked={formData.isManager}
                onCheckedChange={(checked) => handleInputChange('isManager', checked)}
              />
              <Label htmlFor="isManager">É gerente/líder</Label>
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
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Descrição/Responsabilidades</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Descreva as principais responsabilidades..."
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : editingEmployee ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModal;