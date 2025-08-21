import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Save, 
  Trash2, 
  Users, 
  Building, 
  Crown, 
  Shield,
  Edit3
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
}

interface OrgChartBuilderProps {
  orgChart?: OrgChart;
  onSave: (orgChart: OrgChart) => void;
  onCancel: () => void;
}

const OrgChartBuilder: React.FC<OrgChartBuilderProps> = ({ orgChart, onSave, onCancel }) => {
  const { state } = useApp();
  const [name, setName] = useState(orgChart?.name || '');
  const [description, setDescription] = useState(orgChart?.description || '');
  const [type, setType] = useState<OrgChart['type']>(orgChart?.type || 'macro');
  const [nodes, setNodes] = useState<OrgNode[]>(orgChart?.data?.nodes || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeForm, setNodeForm] = useState<Partial<OrgNode>>({});

  const nodeTypes = [
    { value: 'socio', label: 'Sócio', icon: Crown, color: 'bg-blue-500' },
    { value: 'diretor-executivo', label: 'Diretor Executivo', icon: Shield, color: 'bg-blue-600' },
    { value: 'diretoria', label: 'Diretoria', icon: Building, color: 'bg-primary' },
    { value: 'gerencia', label: 'Gerência', icon: Users, color: 'bg-secondary' },
    { value: 'coordenacao', label: 'Coordenação', icon: Users, color: 'bg-muted' },
    { value: 'funcionario', label: 'Funcionário', icon: Users, color: 'bg-accent' }
  ];

  const addNode = () => {
    const newNode: OrgNode = {
      id: uuidv4(),
      name: nodeForm.name || '',
      position: nodeForm.position || '',
      type: nodeForm.type || 'funcionario',
      parentId: nodeForm.parentId,
      employeeCount: nodeForm.employeeCount || 1,
      department: nodeForm.department,
      description: nodeForm.description
    };

    setNodes([...nodes, newNode]);
    setNodeForm({});
    setSelectedNode(newNode.id);
  };

  const updateNode = (nodeId: string, updates: Partial<OrgNode>) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  const deleteNode = (nodeId: string) => {
    // Also remove children nodes
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (nodeToDelete) {
      const childrenToDelete = nodes.filter(n => n.parentId === nodeId);
      const idsToDelete = [nodeId, ...childrenToDelete.map(c => c.id)];
      setNodes(nodes.filter(node => !idsToDelete.includes(node.id)));
      
      if (selectedNode === nodeId) {
        setSelectedNode(null);
      }
    }
  };

  const getNodeTypeInfo = (type: string) => {
    return nodeTypes.find(nt => nt.value === type) || nodeTypes[nodeTypes.length - 1];
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
    const rootNodes = nodes.filter(node => !node.parentId);
    const buildTree = (parentId?: string): OrgNode[] => {
      return nodes
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

    const orgChartData: OrgChart = {
      id: orgChart?.id || uuidv4(),
      name,
      description,
      type,
      data: {
        nodes,
        connections: [], // Could be built from parent-child relationships
        createdAt: orgChart?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      visible: orgChart?.visible !== false,
      createdAt: orgChart?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (orgChart) {
        // Update existing
        await googleSheetsService.updateCustomOrgChart(orgChartData);
        toast({
          title: "Organograma atualizado",
          description: `${name} foi atualizado com sucesso`
        });
      } else {
        // Create new
        await googleSheetsService.addCustomOrgChart(orgChartData);
        toast({
          title: "Organograma criado",
          description: `${name} foi criado com sucesso`
        });
      }
      
      onSave(orgChartData);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o organograma",
        variant: "destructive"
      });
    }
  };

  const { roots, buildTree } = buildHierarchy();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>
            {orgChart ? 'Editar' : 'Criar'} Organograma
          </CardTitle>
          <CardDescription>
            Configure a estrutura hierárquica da sua organização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Organograma</Label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Organograma Macro 2025"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macro">Macro</SelectItem>
                  <SelectItem value="departamental">Departamental</SelectItem>
                  <SelectItem value="hierarquico">Hierárquico</SelectItem>
                  <SelectItem value="gente-gestao">Gente & Gestão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Descrição</Label>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o objetivo e escopo deste organograma..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Node Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {selectedNode ? 'Editar Posição' : 'Adicionar Posição'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome/Cargo</Label>
              <Input 
                value={nodeForm.name || ''}
                onChange={(e) => setNodeForm({...nodeForm, name: e.target.value})}
                placeholder="Ex: CEO, Gerente de TI..."
              />
            </div>
            
            <div>
              <Label>Posição</Label>
              <Input 
                value={nodeForm.position || ''}
                onChange={(e) => setNodeForm({...nodeForm, position: e.target.value})}
                placeholder="Ex: Chief Executive Officer"
              />
            </div>

            <div>
              <Label>Tipo de Posição</Label>
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
                        {nt.label}
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

            <Button 
              onClick={addNode} 
              className="w-full"
              disabled={!nodeForm.name?.trim() || !nodeForm.position?.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              {selectedNode ? 'Atualizar' : 'Adicionar'} Posição
            </Button>
          </CardContent>
        </Card>

        {/* Hierarchy Viewer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Estrutura Hierárquica
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nodes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Adicione posições para visualizar a hierarquia
              </p>
            ) : (
              <div className="space-y-2">
                {roots.map(root => (
                  <div key={root.id}>
                    <NodeDisplay 
                      node={root} 
                      level={0}
                      children={buildTree(root.id)}
                      buildTree={buildTree}
                      onEdit={setSelectedNode}
                      onDelete={deleteNode}
                      getNodeTypeInfo={getNodeTypeInfo}
                    />
                  </div>
                ))}
                {buildTree().map(orphan => (
                  <NodeDisplay 
                    key={orphan.id}
                    node={orphan} 
                    level={0}
                    children={buildTree(orphan.id)}
                    buildTree={buildTree}
                    onEdit={setSelectedNode}
                    onDelete={deleteNode}
                    getNodeTypeInfo={getNodeTypeInfo}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={saveOrgChart}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Organograma
        </Button>
      </div>
    </div>
  );
};

// Node Display Component
const NodeDisplay: React.FC<{
  node: OrgNode;
  level: number;
  children: OrgNode[];
  buildTree: (parentId?: string) => OrgNode[];
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  getNodeTypeInfo: (type: string) => any;
}> = ({ node, level, children, buildTree, onEdit, onDelete, getNodeTypeInfo }) => {
  const typeInfo = getNodeTypeInfo(node.type);
  const Icon = typeInfo.icon;

  return (
    <div className={`ml-${level * 4}`}>
      <div className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50">
        <div className={`w-8 h-8 rounded-full ${typeInfo.color} flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-medium">{node.name}</div>
          <div className="text-sm text-muted-foreground">{node.position}</div>
          {node.department && (
            <Badge variant="outline" className="text-xs mt-1">
              {node.department}
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => onEdit(node.id)}>
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(node.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {children.map(child => (
        <NodeDisplay 
          key={child.id}
          node={child}
          level={level + 1}
          children={buildTree(child.id)}
          buildTree={buildTree}
          onEdit={onEdit}
          onDelete={onDelete}
          getNodeTypeInfo={getNodeTypeInfo}
        />
      ))}
    </div>
  );
};

export default OrgChartBuilder;