
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
      <CardHeader className="pb-2">
        <div className={cn("p-2 w-fit rounded-lg mb-3", color)}>
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          onClick={() => navigate(href)}
          className="w-full justify-start"
        >
          Acceder
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModuleCard;
