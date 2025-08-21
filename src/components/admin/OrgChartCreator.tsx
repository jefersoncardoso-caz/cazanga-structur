import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Save, 
  Trash2, 
  Users, 
  Building, 
  Crown, 
  Shield,
  Edit3,
  Eye,
  Download,
  Maximize2
} from 'lucide-react';
import { useApp, OrgChart } from '@/contexts/AppContext';
import { googleSheetsService } from '@/services/googleSheetsService';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface OrgNode {
  id: string;
  parentId?: string;
  name: string;
  position: string;
  type: 'socio' | 'diretor-executivo' | 'diretoria' | 'gerencia' | 'coordenacao' | 'funcionario';
  employeeCount?: number;
  department?: string;
  description?: string;
  photo?: string;
  level: number;
  x?: number;
  y?: number;
}

interface OrgChartCreatorProps {
  orgChart?: OrgChart;
  onSave: (orgChart: OrgChart) => void;
  onCancel: () => void;
}

const OrgChartCreator: React.FC<OrgChartCreatorProps> = ({ orgChart, onSave, onCancel }) => {
  const { state } = useApp();
  const [name, setName] = useState(orgChart?.name || '');
  const [description, setDescription] = useState(orgChart?.description || '');
  const [type, setType] = useState<OrgChart['type']>(orgChart?.type || 'macro');
  const [nodes, setNodes] = useState<OrgNode[]>(orgChart?.data?.nodes || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeForm, setNodeForm] = useState<Partial<OrgNode>>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [showNodeModal, setShowNodeModal] = useState(false);

  const nodeTypes = [
    { value: 'socio', label: 'Sócio', icon: Crown, color: 'bg-blue-600', level: 1 },
    { value: 'diretor-executivo', label: 'Diretor Executivo', icon: Shield, color: 'bg-blue-500', level: 2 },
    { value: 'diretoria', label: 'Diretoria', icon: Building, color: 'bg-primary', level: 3 },
    { value: 'gerencia', label: 'Gerência', icon: Users, color: 'bg-secondary', level: 4 },
    { value: 'coordenacao', label: 'Coordenação', icon: Users, color: 'bg-accent', level: 5 },
    { value: 'funcionario', label: 'Funcionário', icon: Users, color: 'bg-muted', level: 6 }
  ];

  const orgChartTypes = [
    { value: 'macro', label: 'Organograma Macro', description: 'Visão geral da empresa com todos os níveis' },
    { value: 'gerencial', label: 'Organograma Gerencial', description: 'Apenas gerentes e líderes' },
    { value: 'departamental', label: 'Organograma Departamental', description: 'Foco em departamentos específicos' },
    { value: 'hierarquico', label: 'Organograma Hierárquico', description: 'Estrutura hierárquica completa' }
  ];

  const addNode = () => {
    if (!nodeForm.name || !nodeForm.position || !nodeForm.type) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, posição e tipo",
        variant: "destructive"
      });
      return;
    }

    const typeInfo = nodeTypes.find(nt => nt.value === nodeForm.type);
    const newNode: OrgNode = {
      id: selectedNode || uuidv4(),
      name: nodeForm.name || '',
      position: nodeForm.position || '',
      type: nodeForm.type || 'funcionario',
      parentId: nodeForm.parentId,
      employeeCount: nodeForm.employeeCount || 1,
      department: nodeForm.department,
      description: nodeForm.description,
      photo: nodeForm.photo,
      level: typeInfo?.level || 6,
      x: 0,
      y: 0
    };

    if (selectedNode) {
      // Update existing node
      setNodes(nodes.map(node => 
        node.id === selectedNode ? newNode : node
      ));
    } else {
      // Add new node
      setNodes([...nodes, newNode]);
    }

    setNodeForm({});
    setSelectedNode(null);
    setShowNodeModal(false);
  };

  const deleteNode = (nodeId: string) => {
    // Remove node and all its children
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (nodeToDelete) {
      const getAllChildren = (parentId: string): string[] => {
        const children = nodes.filter(n => n.parentId === parentId);
        let allChildren = children.map(c => c.id);
        children.forEach(child => {
          allChildren = [...allChildren, ...getAllChildren(child.id)];
        });
        return allChildren;
      };

      const idsToDelete = [nodeId, ...getAllChildren(nodeId)];
      setNodes(nodes.filter(node => !idsToDelete.includes(node.id)));
      
      if (selectedNode === nodeId) {
        setSelectedNode(null);
      }
    }
  };

  const editNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setNodeForm(node);
      setSelectedNode(nodeId);
      setShowNodeModal(true);
    }
  };

  const getPossibleParents = (currentNodeId?: string) => {
    return nodes.filter(node => 
      node.id !== currentNodeId && 
      !isDescendant(node.id, currentNodeId || '')
    );
  };

  const isDescendant = (parentId: string, childId: string): boolean => {
    const child = nodes.find(n => n.id === childId);
    if (!child || !child.parentId) return false;
    if (child.parentId === parentId) return true;
    return isDescendant(parentId, child.parentId);
  };

  const buildHierarchy = () => {
    const sortedNodes = [...nodes].sort((a, b) => a.level - b.level);
    const rootNodes = sortedNodes.filter(node => !node.parentId);
    
    const buildTree = (parentId?: string): OrgNode[] => {
      return sortedNodes
        .filter(node => node.parentId === parentId)
        .sort((a, b) => {
          const aType = nodeTypes.findIndex(nt => nt.value === a.type);
          const bType = nodeTypes.findIndex(nt => nt.value === b.type);
          return aType - bType || a.name.localeCompare(b.name);
        });
    };

    return { roots: rootNodes, buildTree };
  };

  const saveOrgChart = async () => {
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o organograma",
        variant: "destructive"
      });
      return;
    }

    if (nodes.length === 0) {
      toast({
        title: "Organograma vazio",
        description: "Adicione pelo menos um nó ao organograma",
        variant: "destructive"
      });
      return;
    }

    const orgChartData: OrgChart = {
      id: orgChart?.id || uuidv4(),
      name,
      description,
      type,
      data: {
        nodes,
        connections: buildConnections(),
        createdAt: orgChart?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          totalNodes: nodes.length,
          maxLevel: Math.max(...nodes.map(n => n.level)),
          departments: Array.from(new Set(nodes.map(n => n.department).filter(Boolean)))
        }
      },
      visible: orgChart?.visible !== false,
      createdAt: orgChart?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (orgChart) {
        await googleSheetsService.updateCustomOrgChart(orgChartData);
        toast({
          title: "Organograma atualizado",
          description: `${name} foi atualizado no Google Sheets`
        });
      } else {
        await googleSheetsService.addCustomOrgChart(orgChartData);
        toast({
          title: "Organograma criado",
          description: `${name} foi salvo no Google Sheets`
        });
      }
      
      onSave(orgChartData);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar no Google Sheets",
        variant: "destructive"
      });
    }
  };

  const buildConnections = () => {
    return nodes
      .filter(node => node.parentId)
      .map(node => ({
        from: node.parentId!,
        to: node.id,
        type: 'hierarchy'
      }));
  };

  const importFromEmployees = () => {
    const employeeNodes: OrgNode[] = state.employees
      .filter(emp => emp.visible !== false)
      .map(emp => {
        const typeInfo = nodeTypes.find(nt => 
          emp.position?.toLowerCase().includes(nt.label.toLowerCase()) ||
          (emp.isManager && nt.value === 'gerencia')
        ) || nodeTypes[nodeTypes.length - 1];

        return {
          id: emp.id,
          name: emp.name,
          position: emp.position,
          type: typeInfo.value as any,
          department: emp.department,
          description: emp.description,
          photo: emp.photo,
          parentId: emp.parentId,
          employeeCount: 1,
          level: typeInfo.level
        };
      });

    setNodes(employeeNodes);
    toast({
      title: "Funcionários importados",
      description: `${employeeNodes.length} funcionários foram importados`
    });
  };

  const { roots, buildTree } = buildHierarchy();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{orgChart ? 'Editar' : 'Criar'} Organograma</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Editar' : 'Visualizar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={importFromEmployees}
                disabled={state.employees.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Importar Funcionários
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Configure a estrutura hierárquica da sua organização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Nome do Organograma</Label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Organograma Macro 2025"
                disabled={previewMode}
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)} disabled={previewMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orgChartTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setNodeForm({});
                  setSelectedNode(null);
                  setShowNodeModal(true);
                }}
                disabled={previewMode}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Posição
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <Label>Descrição</Label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo e escopo deste organograma..."
              disabled={previewMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Organograma Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Estrutura do Organograma
            <Badge variant="outline">{nodes.length} posições</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nodes.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Building className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg mb-2">Organograma vazio</p>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione posições para construir a estrutura organizacional
              </p>
              <Button onClick={() => setShowNodeModal(true)} disabled={previewMode}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Posição
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Render hierarchy levels */}
              {Array.from(new Set(nodes.map(n => n.level))).sort().map(level => {
                const levelNodes = nodes.filter(n => n.level === level);
                const levelType = nodeTypes.find(nt => nt.level === level);
                
                return (
                  <div key={level} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Nível {level} - {levelType?.label}
                      </Badge>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {levelNodes.map(node => (
                        <NodeCard 
                          key={node.id}
                          node={node}
                          nodeTypes={nodeTypes}
                          onEdit={() => editNode(node.id)}
                          onDelete={() => deleteNode(node.id)}
                          previewMode={previewMode}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={saveOrgChart} disabled={!name.trim() || nodes.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Organograma
        </Button>
      </div>

      {/* Node Creation/Edit Modal */}
      <Dialog open={showNodeModal} onOpenChange={setShowNodeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedNode ? 'Editar Posição' : 'Adicionar Nova Posição'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label>Nome/Cargo *</Label>
                <Input 
                  value={nodeForm.name || ''}
                  onChange={(e) => setNodeForm({...nodeForm, name: e.target.value})}
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div>
                <Label>Posição *</Label>
                <Input 
                  value={nodeForm.position || ''}
                  onChange={(e) => setNodeForm({...nodeForm, position: e.target.value})}
                  placeholder="Ex: Chief Executive Officer"
                />
              </div>

              <div>
                <Label>Tipo de Posição *</Label>
                <Select 
                  value={nodeForm.type || 'funcionario'} 
                  onValueChange={(value: any) => setNodeForm({...nodeForm, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeTypes.map(nt => (
                      <SelectItem key={nt.value} value={nt.value}>
                        <div className="flex items-center gap-2">
                          <nt.icon className="h-4 w-4" />
                          <span>{nt.label}</span>
                          <Badge variant="outline" className="text-xs">Nível {nt.level}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Superior Hierárquico</Label>
                <Select 
                  value={nodeForm.parentId || ''} 
                  onValueChange={(value) => setNodeForm({...nodeForm, parentId: value || undefined})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum (posição raiz)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum (posição raiz)</SelectItem>
                    {getPossibleParents(selectedNode || undefined).map(node => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.name} ({node.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Departamento</Label>
                <Select 
                  value={nodeForm.department || ''} 
                  onValueChange={(value) => setNodeForm({...nodeForm, department: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {state.departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantidade de Funcionários</Label>
                <Input 
                  type="number"
                  value={nodeForm.employeeCount || 1}
                  onChange={(e) => setNodeForm({...nodeForm, employeeCount: parseInt(e.target.value) || 1})}
                  min={1}
                />
              </div>

              <div>
                <Label>URL da Foto</Label>
                <Input 
                  value={nodeForm.photo || ''}
                  onChange={(e) => setNodeForm({...nodeForm, photo: e.target.value})}
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea 
                  value={nodeForm.description || ''}
                  onChange={(e) => setNodeForm({...nodeForm, description: e.target.value})}
                  placeholder="Responsabilidades e atribuições..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowNodeModal(false)}>
              Cancelar
            </Button>
            <Button onClick={addNode}>
              <Save className="h-4 w-4 mr-2" />
              {selectedNode ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Node Card Component
const NodeCard: React.FC<{
  node: OrgNode;
  nodeTypes: any[];
  onEdit: () => void;
  onDelete: () => void;
  previewMode: boolean;
}> = ({ node, nodeTypes, onEdit, onDelete, previewMode }) => {
  const typeInfo = nodeTypes.find(nt => nt.value === node.type) || nodeTypes[nodeTypes.length - 1];
  const Icon = typeInfo.icon;

  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full ${typeInfo.color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{node.name}</h4>
            <p className="text-sm text-muted-foreground truncate">{node.position}</p>
            {node.department && (
              <Badge variant="outline" className="text-xs mt-1">
                {node.department}
              </Badge>
            )}
            {node.employeeCount && node.employeeCount > 1 && (
              <Badge variant="secondary" className="text-xs mt-1 ml-1">
                {node.employeeCount} pessoas
              </Badge>
            )}
          </div>
        </div>
        
        {!previewMode && (
          <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrgChartCreator;