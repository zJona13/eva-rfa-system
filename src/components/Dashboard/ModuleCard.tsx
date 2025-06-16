
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
  color = "bg-primary/10 text-primary border-primary/20"
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="h-full group border-0 shadow-sm bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={cn("flex items-center justify-center w-12 h-12 rounded-xl border group-hover:scale-110 transition-transform duration-300", color)}>
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          onClick={() => navigate(href)}
          className="w-full justify-between text-xs h-8 px-3 hover:bg-primary/10 group-hover:bg-primary/15 transition-colors"
        >
          <span>Acceder</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModuleCard;
