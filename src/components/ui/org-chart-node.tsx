import React from 'react';
import { User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrgChartNodeProps {
  title: string;
  subtitle?: string;
  count?: number;
  isManager?: boolean;
  variant?: 'default' | 'manager' | 'team';
  onClick?: () => void;
  className?: string;
}

export const OrgChartNode: React.FC<OrgChartNodeProps> = ({
  title,
  subtitle,
  count,
  isManager = false,
  variant = 'default',
  onClick,
  className
}) => {
  const showGroupIcon = count && count > 1;
  
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      {/* Icon Container */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 transition-colors",
          {
            "w-16 h-16 bg-primary border-primary": variant === 'manager',
            "w-12 h-12 bg-background border-foreground": variant === 'default',
            "w-14 h-14 bg-background border-primary": variant === 'team'
          }
        )}
      >
        {showGroupIcon ? (
          <Users 
            className={cn(
              "transition-colors",
              {
                "w-8 h-8 text-primary-foreground": variant === 'manager',
                "w-6 h-6 text-foreground": variant === 'default',
                "w-7 h-7 text-primary": variant === 'team'
              }
            )} 
          />
        ) : (
          <User 
            className={cn(
              "transition-colors",
              {
                "w-8 h-8 text-primary-foreground": variant === 'manager',
                "w-6 h-6 text-foreground": variant === 'default',
                "w-7 h-7 text-primary": variant === 'team'
              }
            )} 
          />
        )}
        
        {/* Count Badge */}
        {count && count > 1 && (
          <div className="absolute -bottom-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {count.toString().padStart(2, '0')}
          </div>
        )}
      </div>
      
      {/* Text Content */}
      <div className="text-center max-w-32">
        <h3 className={cn(
          "font-medium text-sm leading-tight",
          {
            "text-primary": variant === 'manager',
            "text-foreground": variant === 'default' || variant === 'team'
          }
        )}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};