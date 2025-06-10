
import React from 'react';

const ColaboradoresLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <div className="absolute inset-0 animate-ping h-8 w-8 border-4 border-primary/20 rounded-full"></div>
      </div>
      <span className="ml-3 text-muted-foreground">Cargando colaboradores...</span>
    </div>
  );
};

export default ColaboradoresLoading;
