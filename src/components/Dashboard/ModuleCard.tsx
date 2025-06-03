import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  color = "bg-primary/10 text-primary"
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-1 sm:pb-2">
        <div className={cn("p-2 w-fit rounded-lg mb-2 sm:mb-3", color)}>
          {icon}
        </div>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-1 sm:pt-2">
        <Button 
          variant="outline" 
          onClick={() => navigate(href)}
          className="w-full justify-start text-xs sm:text-sm"
        >
          Acceder
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModuleCard;
