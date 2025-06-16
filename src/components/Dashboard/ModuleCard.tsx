
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
    <Card className="group border-border/50 shadow-sm bg-card/70 backdrop-blur-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 rounded-xl md:rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 md:pb-4">
        <div className="flex items-start justify-between">
          <div className={cn("flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl border group-hover:scale-105 transition-all duration-300", color)}>
            {icon}
          </div>
        </div>
        <div className="space-y-1.5 md:space-y-2">
          <CardTitle className="text-base md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          onClick={() => navigate(href)}
          className="w-full justify-between text-sm h-9 md:h-10 px-3 md:px-4 hover:bg-primary/10 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 rounded-lg md:rounded-xl"
        >
          <span className="font-medium">Acceder</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModuleCard;
