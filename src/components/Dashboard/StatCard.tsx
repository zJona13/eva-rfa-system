
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valueClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  className,
  valueClassName,
}) => {
  return (
    <Card className={cn("border-0 shadow-sm rounded-xl md:rounded-2xl overflow-hidden group", className)}>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 md:p-3 bg-muted/50 rounded-xl border border-border/50 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
              <div className="text-muted-foreground group-hover:text-primary transition-colors duration-300">
                {icon}
              </div>
            </div>
            {trend && (
              <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300",
                trend.isPositive 
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" 
                  : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              )}>
                <span>
                  {trend.isPositive ? '↗' : '↘'}
                </span>
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          
          <div className="space-y-1.5 md:space-y-2">
            <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-2">{title}</p>
            <h3 className={cn("text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-300", valueClassName || "text-foreground group-hover:text-primary")}>
              {value}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground/80 line-clamp-1">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
