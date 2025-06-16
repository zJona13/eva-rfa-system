
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
    <Card className={cn("border-0 shadow-sm rounded-2xl", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-gray-700">
                {icon}
              </div>
            </div>
            {trend && (
              <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                trend.isPositive 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              )}>
                <span>
                  {trend.isPositive ? '↗' : '↘'}
                </span>
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 leading-relaxed">{title}</p>
            <h3 className={cn("text-3xl font-bold tracking-tight", valueClassName || "text-gray-900")}>
              {value}
            </h3>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
