import React from 'react';
import { cn } from '@/lib/utils';
import { Users, User, Crown, Shield, UserCheck } from 'lucide-react';

interface OrgChartNodeProps {
  name?: string;
  title: string;
  subtitle?: string;
  level?: 'socio' | 'diretor-executivo' | 'diretoria' | 'gerencia' | 'coordenacao' | 'funcionario';
  variant?: string;
  children?: React.ReactNode;
  count?: number;
  onClick?: () => void;
  className?: string;
}

export const OrgChartNode: React.FC<OrgChartNodeProps> = ({
  name,
  title,
  subtitle,
  level = 'funcionario',
  variant,
  children,
  count,
  onClick,
  className
}) => {
  const getLevelConfig = (level: string, variant?: string) => {
    // Legacy variant support
    if (variant) {
      switch (variant) {
        case 'diretoria':
        case 'director':
          return {
            bgColor: 'bg-primary',
            textColor: 'text-primary-foreground',
            icon: UserCheck,
            borderColor: 'border-primary'
          };
        case 'gerencia':
        case 'manager':
          return {
            bgColor: 'bg-secondary',
            textColor: 'text-secondary-foreground',
            icon: Users,
            borderColor: 'border-secondary'
          };
        case 'coordenacao':
        case 'coordinator':
          return {
            bgColor: 'bg-accent',
            textColor: 'text-accent-foreground',
            icon: User,
            borderColor: 'border-accent'
          };
        default:
          return {
            bgColor: 'bg-muted',
            textColor: 'text-muted-foreground',
            icon: User,
            borderColor: 'border-muted'
          };
      }
    }

    // New level-based configuration
    switch (level) {
      case 'socio':
        return {
          bgColor: 'bg-blue-600',
          textColor: 'text-white',
          icon: Crown,
          borderColor: 'border-blue-700'
        };
      case 'diretor-executivo':
        return {
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          icon: Shield,
          borderColor: 'border-blue-600'
        };
      case 'diretoria':
        return {
          bgColor: 'bg-primary',
          textColor: 'text-primary-foreground',
          icon: UserCheck,
          borderColor: 'border-primary'
        };
      case 'gerencia':
        return {
          bgColor: 'bg-secondary',
          textColor: 'text-secondary-foreground',
          icon: Users,
          borderColor: 'border-secondary'
        };
      case 'coordenacao':
        return {
          bgColor: 'bg-accent',
          textColor: 'text-accent-foreground',
          icon: User,
          borderColor: 'border-accent'
        };
      default:
        return {
          bgColor: 'bg-muted',
          textColor: 'text-muted-foreground',
          icon: User,
          borderColor: 'border-muted'
        };
    }
  };

  const config = getLevelConfig(level, variant);
  const IconComponent = config.icon;

  return (
    <div className={cn("relative", className)}>
      {/* Connection Lines */}
      {children && (
        <>
          {/* Vertical line down */}
          <div className="absolute left-1/2 bottom-0 w-px h-6 bg-primary transform -translate-x-1/2 translate-y-full" />
          {/* Horizontal line */}
          <div className="absolute left-1/2 top-full w-24 h-px bg-primary transform -translate-x-1/2 translate-y-6" />
        </>
      )}

      {/* Node */}
      <div
        className={cn(
          "rounded-lg border-2 p-4 min-w-[200px] text-center shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105",
          config.bgColor,
          config.textColor,
          config.borderColor,
          onClick && "hover:opacity-90"
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <IconComponent className="w-5 h-5" />
          {count && count > 0 && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        <h3 className="font-bold text-sm mb-1">{name || title}</h3>
        {subtitle && <p className="text-xs opacity-90">{subtitle}</p>}
        {!subtitle && name && <p className="text-xs opacity-90">{title}</p>}
      </div>

      {/* Children */}
      {children && (
        <div className="flex justify-center mt-12">
          <div className="flex flex-wrap justify-center gap-8">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};