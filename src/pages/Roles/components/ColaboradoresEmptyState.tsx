
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserSquare2, Plus } from 'lucide-react';

interface ColaboradoresEmptyStateProps {
  searchQuery: string;
  onCreateColaborador: () => void;
}

const ColaboradoresEmptyState: React.FC<ColaboradoresEmptyStateProps> = ({
  searchQuery,
  onCreateColaborador
}) => {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
        <UserSquare2 className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          {searchQuery ? 'No se encontraron colaboradores' : 'No hay colaboradores registrados'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {searchQuery 
            ? 'Intenta ajustar los términos de búsqueda para encontrar colaboradores.'
            : 'Comienza agregando el primer colaborador al sistema.'
          }
        </p>
      </div>
      {!searchQuery && (
        <Button 
          onClick={onCreateColaborador}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Primer Colaborador
        </Button>
      )}
    </div>
  );
};

export default ColaboradoresEmptyState;
