import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Maximize2, 
  Download, 
  Users, 
  Building,
  Crown,
  Shield,
  User,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import InteractiveOrgChart from './InteractiveOrgChart';
import { cn } from '@/lib/utils';

interface OrgChartViewerProps {
  orgChart: any;
  onBack: () => void;
  isPublic?: boolean;
}

const OrgChartViewer: React.FC<OrgChartViewerProps> = ({ orgChart, onBack, isPublic = true }) => {
  const { state } = useApp();
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);

  const handleTeamClick = (team: any) => {
    // Find team members from employees data
    const teamMembers = state.employees.filter(emp => 
      emp.department === team.department && emp.visible !== false
    );

    setSelectedTeam({
      ...team,
      members: teamMembers,
      manager: teamMembers.find(emp => emp.isManager),
      regularMembers: teamMembers.filter(emp => !emp.isManager)
    });
    setTeamModalOpen(true);
  };

  const generatePDF = () => {
    // Future implementation for PDF generation
    toast({
      title: "PDF em desenvolvimento",
      description: "Funcionalidade de PDF será implementada em breve"
    });
  };

  return (
    <div className="w-full bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-primary-foreground hover:bg-primary-light"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="h-6 w-px bg-primary-foreground/30" />
            <div>
              <h1 className="text-lg font-bold">{orgChart?.name}</h1>
              {orgChart?.description && (
                <p className="text-sm text-primary-foreground/80">{orgChart.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white">
              {orgChart?.data?.nodes?.length || 0} posições
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFullscreenMode(true)}
              className="text-primary-foreground hover:bg-primary-light"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Tela Cheia
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={generatePDF}
              className="text-primary-foreground hover:bg-primary-light"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="relative">
        <InteractiveOrgChart 
          orgChart={orgChart} 
          isPublic={isPublic}
        />
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={fullscreenMode} onOpenChange={setFullscreenMode}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{orgChart?.name} - Visualização Completa</span>
              <Button variant="ghost" size="sm" onClick={() => setFullscreenMode(false)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <InteractiveOrgChart 
              orgChart={orgChart} 
              isPublic={isPublic}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Details Modal */}
      <Dialog open={teamModalOpen} onOpenChange={setTeamModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Equipe: {selectedTeam?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTeam && (
            <div className="space-y-6">
              {/* Team Header */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{selectedTeam.department}</h3>
                  <Badge variant="outline">
                    {selectedTeam.members.length} membros
                  </Badge>
                </div>
                {selectedTeam.manager && (
                  <div className="flex items-center gap-3">
                    <Crown className="w-4 h-4 text-primary" />
                    <span className="text-sm">
                      <strong>Gerente:</strong> {selectedTeam.manager.name} - {selectedTeam.manager.position}
                    </span>
                  </div>
                )}
              </div>

              {/* Team Members */}
              <div>
                <h4 className="font-semibold mb-3">Membros da Equipe</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTeam.regularMembers.map((member: any) => (
                    <Card key={member.id} className="p-4">
                      <div className="flex items-center gap-3">
                        {member.photo ? (
                          <img 
                            src={member.photo} 
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium">{member.name}</h5>
                          <p className="text-sm text-muted-foreground">{member.position}</p>
                          {member.team && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {member.team}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {member.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {member.description}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setTeamModalOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={generatePDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Gerar PDF da Equipe
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Instructions for public users */}
      {isPublic && (
        <div className="bg-muted/30 py-4 px-6 text-center">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Dica:</strong> Clique nos departamentos com múltiplos funcionários para ver detalhes da equipe
          </p>
        </div>
      )}
    </div>
  );
};

export default OrgChartViewer;