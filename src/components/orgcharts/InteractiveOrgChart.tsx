import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  Crown, 
  Shield, 
  Building, 
  ChevronDown, 
  ChevronUp,
  Maximize2,
  Download,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

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
  children?: OrgNode[];
  collapsed?: boolean;
}

interface InteractiveOrgChartProps {
  orgChart: any;
  isPublic?: boolean;
}

const InteractiveOrgChart: React.FC<InteractiveOrgChartProps> = ({ orgChart, isPublic = false }) => {
  const { state } = useApp();
  const [nodes, setNodes] = useState<OrgNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (orgChart?.data?.nodes) {
      const processedNodes = orgChart.data.nodes.map((node: any) => ({
        ...node,
        collapsed: false
      }));
      setNodes(processedNodes);
      
      // Auto-expand all nodes initially
      const allNodeIds = new Set(processedNodes.map((n: any) => n.id));
      setExpandedNodes(allNodeIds);
    }
  }, [orgChart]);

  const nodeTypes = [
    { value: 'socio', label: 'Sócio', icon: Crown, color: 'bg-blue-600 text-white', level: 1 },
    { value: 'diretor-executivo', label: 'Diretor Executivo', icon: Shield, color: 'bg-blue-500 text-white', level: 2 },
    { value: 'diretoria', label: 'Diretoria', icon: Building, color: 'bg-primary text-primary-foreground', level: 3 },
    { value: 'gerencia', label: 'Gerência', icon: Users, color: 'bg-secondary text-secondary-foreground', level: 4 },
    { value: 'coordenacao', label: 'Coordenação', icon: Users, color: 'bg-accent text-accent-foreground', level: 5 },
    { value: 'funcionario', label: 'Funcionário', icon: User, color: 'bg-muted text-muted-foreground', level: 6 }
  ];

  const buildHierarchy = () => {
    const nodeMap = new Map(nodes.map(node => [node.id, { ...node, children: [] }]));
    const roots: OrgNode[] = [];

    nodes.forEach(node => {
      const nodeWithChildren = nodeMap.get(node.id)!;
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parent = nodeMap.get(node.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(nodeWithChildren);
      } else {
        roots.push(nodeWithChildren);
      }
    });

    // Sort by level and name
    const sortNodes = (nodes: OrgNode[]) => {
      nodes.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
      nodes.forEach(node => {
        if (node.children) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(roots);
    return roots;
  };

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleNodeClick = (node: OrgNode) => {
    if (isPublic && (node.employeeCount || 0) > 1) {
      // Show team details in modal
      setSelectedNode(node);
      setModalOpen(true);
    } else if (!isPublic) {
      // Admin view - show node details
      setSelectedNode(node);
      setModalOpen(true);
    }
  };

  const getNodeTypeInfo = (type: string) => {
    return nodeTypes.find(nt => nt.value === type) || nodeTypes[nodeTypes.length - 1];
  };

  const hierarchy = buildHierarchy();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              {orgChart?.name || 'Organograma'}
            </h1>
            {orgChart?.description && (
              <p className="text-primary-foreground/80 mt-1">
                {orgChart.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white">
              {nodes.length} posições
            </Badge>
            {!isPublic && (
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Organograma */}
      <div className="px-6 pb-8">
        {hierarchy.length === 0 ? (
          <div className="text-center py-16">
            <Building className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma estrutura definida</p>
          </div>
        ) : (
          <div className="space-y-8">
            {hierarchy.map(rootNode => (
              <HierarchyNode
                key={rootNode.id}
                node={rootNode}
                level={0}
                expandedNodes={expandedNodes}
                onToggleExpansion={toggleNodeExpansion}
                onNodeClick={handleNodeClick}
                getNodeTypeInfo={getNodeTypeInfo}
                isPublic={isPublic}
              />
            ))}
          </div>
        )}
      </div>

      {/* Node Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNode && (
                <>
                  {React.createElement(getNodeTypeInfo(selectedNode.type).icon, { className: "w-5 h-5" })}
                  {selectedNode.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedNode && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary">Informações Básicas</h4>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedNode.position}</span>
                      </div>
                      {selectedNode.department && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedNode.department}</span>
                        </div>
                      )}
                      {selectedNode.employeeCount && selectedNode.employeeCount > 1 && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedNode.employeeCount} funcionários</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedNode.description && (
                    <div>
                      <h4 className="font-semibold text-primary">Descrição</h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedNode.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedNode.photo && (
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Foto</h4>
                      <img 
                        src={selectedNode.photo} 
                        alt={selectedNode.name}
                        className="w-32 h-32 rounded-lg object-cover border"
                      />
                    </div>
                  )}

                  {isPublic && (
                    <div>
                      <h4 className="font-semibold text-primary">Contato</h4>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {selectedNode.name.toLowerCase().replace(/\s+/g, '.')}@{state.siteSettings.companyName.toLowerCase()}.com
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">+55 (11) 9999-9999</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">São Paulo, SP</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Members (if applicable) */}
              {isPublic && selectedNode.employeeCount && selectedNode.employeeCount > 1 && (
                <div>
                  <h4 className="font-semibold text-primary mb-3">Equipe</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Show related employees from the same department */}
                    {state.employees
                      .filter(emp => emp.department === selectedNode.department && emp.visible !== false)
                      .slice(0, 6)
                      .map(emp => (
                        <div key={emp.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {emp.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{emp.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{emp.position}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Hierarchy Node Component
const HierarchyNode: React.FC<{
  node: OrgNode;
  level: number;
  expandedNodes: Set<string>;
  onToggleExpansion: (nodeId: string) => void;
  onNodeClick: (node: OrgNode) => void;
  getNodeTypeInfo: (type: string) => any;
  isPublic: boolean;
}> = ({ node, level, expandedNodes, onToggleExpansion, onNodeClick, getNodeTypeInfo, isPublic }) => {
  const typeInfo = getNodeTypeInfo(node.type);
  const Icon = typeInfo.icon;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);

  return (
    <div className="relative">
      {/* Connection Lines */}
      {level > 0 && (
        <>
          <div className="absolute -top-4 left-1/2 w-px h-4 bg-border transform -translate-x-1/2" />
          <div className="absolute -top-4 left-0 right-1/2 h-px bg-border top-0" />
        </>
      )}

      {/* Node */}
      <div className="flex flex-col items-center">
        <Card 
          className={cn(
            "relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105",
            isPublic && (node.employeeCount || 0) > 1 && "hover:ring-2 hover:ring-primary/50"
          )}
          onClick={() => onNodeClick(node)}
        >
          <CardContent className="p-4 text-center min-w-[200px]">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", typeInfo.color)}>
                <Icon className="w-4 h-4" />
              </div>
              {node.employeeCount && node.employeeCount > 1 && (
                <Badge variant="secondary" className="text-xs">
                  {node.employeeCount}
                </Badge>
              )}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpansion(node.id);
                  }}
                  className="w-6 h-6 p-0"
                >
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              )}
            </div>
            
            <h3 className="font-bold text-sm mb-1">{node.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">{node.position}</p>
            
            {node.department && (
              <Badge variant="outline" className="text-xs">
                {node.department}
              </Badge>
            )}

            {isPublic && (node.employeeCount || 0) > 1 && (
              <div className="mt-2 text-xs text-primary">
                Clique para ver detalhes
              </div>
            )}
          </CardContent>
        </Card>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-8 relative">
            {/* Vertical connector */}
            <div className="absolute -top-4 left-1/2 w-px h-4 bg-border transform -translate-x-1/2" />
            
            {/* Horizontal connector */}
            {node.children!.length > 1 && (
              <div className="absolute top-0 left-0 right-0 h-px bg-border" />
            )}
            
            <div className="flex flex-wrap justify-center gap-8 pt-4">
              {node.children!.map(child => (
                <HierarchyNode
                  key={child.id}
                  node={child}
                  level={level + 1}
                  expandedNodes={expandedNodes}
                  onToggleExpansion={onToggleExpansion}
                  onNodeClick={onNodeClick}
                  getNodeTypeInfo={getNodeTypeInfo}
                  isPublic={isPublic}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveOrgChart;