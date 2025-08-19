import React from 'react';
import { cn } from '@/lib/utils';

interface OrgChartProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

export const OrgChart: React.FC<OrgChartProps> = ({ children, title, className }) => {
  return (
    <div className={cn("w-full bg-background", className)}>
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4 px-6 mb-6">
        <h1 className="text-lg font-bold text-center uppercase tracking-wide">
          {title}
        </h1>
      </div>
      
      {/* Chart Content */}
      <div className="px-4 pb-8">
        {children}
      </div>
    </div>
  );
};

interface OrgLevelProps {
  children: React.ReactNode;
  className?: string;
}

export const OrgLevel: React.FC<OrgLevelProps> = ({ children, className }) => {
  return (
    <div className={cn("flex flex-wrap justify-center items-start gap-8 mb-8", className)}>
      {children}
    </div>
  );
};

interface OrgConnectionProps {
  children: React.ReactNode;
  vertical?: boolean;
  className?: string;
}

export const OrgConnection: React.FC<OrgConnectionProps> = ({ 
  children, 
  vertical = false, 
  className 
}) => {
  return (
    <div className={cn("relative", className)}>
      {/* Connection Lines */}
      {vertical && (
        <div className="absolute left-1/2 top-0 w-px h-8 bg-primary transform -translate-x-1/2 -translate-y-full" />
      )}
      
      {children}
      
      {/* Horizontal connector for multiple children */}
      {React.Children.count(children) > 1 && (
        <div className="absolute top-8 left-0 right-0 h-px bg-primary" />
      )}
    </div>
  );
};