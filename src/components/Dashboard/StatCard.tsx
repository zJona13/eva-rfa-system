
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
    <Card className={cn("group border-0 shadow-sm bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                {icon}
              </div>
              <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            </div>
            <div className="space-y-1">
              <h3 className={cn("text-2xl font-bold tracking-tight", valueClassName || "text-foreground")}>
                {value}
              </h3>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
              {trend && (
                <div className="flex items-center gap-1">
                  <span className={cn("text-xs font-medium flex items-center gap-1",
                    trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  )}>
                    <span className="text-sm">
                      {trend.isPositive ? '↗' : '↘'}
                    </span>
                    {Math.abs(trend.value)}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs. anterior</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
