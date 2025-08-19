import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, MapPin, Phone, Mail, FileText } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    name: string;
    position: string;
    department: string;
    photo?: string;
    description?: string;
    email?: string;
    phone?: string;
    location?: string;
    responsibilities?: string[];
  } | null;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, employee }) => {
  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Informações do Funcionário
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com foto e informações básicas */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {employee.photo ? (
                <img 
                  src={employee.photo} 
                  alt={employee.name}
                  className="w-32 h-32 rounded-lg object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-32 h-32 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-16 h-16 text-primary/60" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-primary mb-2">{employee.name}</h2>
              <p className="text-lg text-secondary font-semibold mb-1">{employee.position}</p>
              <Badge variant="outline" className="mb-4">{employee.department}</Badge>
              
              {employee.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {employee.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Informações de contato */}
          <div className="grid md:grid-cols-2 gap-4">
            {employee.email && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
              </div>
            )}
            
            {employee.phone && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">{employee.phone}</p>
                </div>
              </div>
            )}
            
            {employee.location && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Localização</p>
                  <p className="text-sm text-muted-foreground">{employee.location}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Responsabilidades */}
          {employee.responsibilities && employee.responsibilities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Principais Responsabilidades
              </h3>
              <ul className="space-y-2">
                {employee.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={() => {
              window.print();
            }}>
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeModal;