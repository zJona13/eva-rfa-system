
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  href,
  icon,
  color = "bg-blue-50 text-blue-600 border-blue-200"
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="group border-gray-100 shadow-sm bg-white hover:shadow-md hover:border-gray-200 transition-all duration-300 rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className={cn("flex items-center justify-center w-12 h-12 rounded-xl border group-hover:scale-105 transition-transform duration-300", color)}>
            {icon}
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          onClick={() => navigate(href)}
          className="w-full justify-between text-sm h-10 px-4 hover:bg-blue-50 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300 rounded-xl"
        >
          <span className="font-medium">Acceder</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModuleCard;
