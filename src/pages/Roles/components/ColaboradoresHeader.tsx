
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { UserSquare2, Plus } from 'lucide-react';

interface ColaboradoresHeaderProps {
  onCreateColaborador: () => void;
}

const ColaboradoresHeader: React.FC<ColaboradoresHeaderProps> = ({
  onCreateColaborador
}) => {
  return (
    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg border-b-2 border-primary/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserSquare2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-primary">
              Gestión de Colaboradores
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Administra la información de todos los colaboradores
            </p>
          </div>
        </div>
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
          onClick={onCreateColaborador}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Colaborador
        </Button>
      </div>
    </CardHeader>
  );
};

export default ColaboradoresHeader;
