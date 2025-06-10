
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import ColaboradorDialog from './ColaboradorDialog';
import UserDialog from './UserDialog';
import ColaboradoresHeader from './ColaboradoresHeader';
import ColaboradoresLoading from './ColaboradoresLoading';
import ColaboradoresEmptyState from './ColaboradoresEmptyState';
import ColaboradoresTable from './ColaboradoresTable';
import { useColaboradoresOperations } from './useColaboradoresOperations';

interface TipoColaborador {
  id: number;
  name: string;
}

interface TipoContrato {
  id: number;
  name: string;
}

interface Colaborador {
  id: number;
  fullName: string;
  nombres: string;
  apePat: string;
  apeMat: string;
  birthDate: string;
  address: string;
  phone: string;
  dni: string;
  active: boolean;
  roleId: number;
  roleName: string;
  contractId: number;
  startDate: string;
  endDate: string;
  contractActive: boolean;
  contractTypeId: number;
  contractType: string;
  areaName: string;
  areaId: number;
}

interface ColaboradoresTabContentProps {
  colaboradores: Colaborador[];
  isLoading: boolean;
  searchQuery: string;
  tiposColaborador: TipoColaborador[];
  tiposContrato: TipoContrato[];
  roles?: any[];
  areas?: any[];
}

const ColaboradoresTabContent: React.FC<ColaboradoresTabContentProps> = ({ 
  colaboradores, 
  isLoading, 
  searchQuery,
  tiposColaborador,
  tiposContrato,
  roles = [],
  areas = []
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [createdColaborador, setCreatedColaborador] = useState<Colaborador | null>(null);
  const queryClient = useQueryClient();
  
  const {
    createColaborador,
    createMutation,
    updateMutation,
    deleteMutation
  } = useColaboradoresOperations();
  
  // Filtrar colaboradores basado en la búsqueda
  const filteredColaboradores = colaboradores.filter(colab => 
    colab.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    colab.dni.includes(searchQuery) ||
    colab.phone.includes(searchQuery) ||
    colab.roleName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Abrir diálogo para crear nuevo colaborador
  const handleCreateColaborador = () => {
    setSelectedColaborador(null);
    setIsDialogOpen(true);
  };
  
  // Abrir diálogo para editar colaborador
  const handleEditColaborador = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setIsDialogOpen(true);
  };
  
  // Guardar colaborador
  const handleSaveColaborador = async (data: any) => {
    // Normaliza los campos numéricos obligatorios
    const payload = {
      ...data,
      areaId: data.areaId ? Number(data.areaId) : undefined,
      roleId: data.roleId ? Number(data.roleId) : undefined,
      contractTypeId: data.contractTypeId ? Number(data.contractTypeId) : undefined,
    };
    console.log('Payload enviado:', payload);
    if (selectedColaborador) {
      updateMutation.mutate({ id: selectedColaborador.id, data: payload });
    } else {
      try {
        const result = await createColaborador(payload);
        if (result && result.colaboradorId) {
          setCreatedColaborador({ 
            ...payload, 
            id: result.colaboradorId, 
            fullName: `${payload.nombres} ${payload.apePat} ${payload.apeMat}`,
            areaId: Number(payload.areaId),
            areaName: areas.find(a => a.id === Number(payload.areaId))?.name || ''
          });
          setIsUserDialogOpen(true);
        }
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
        toast.success('Colaborador creado exitosamente');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };
  
  // Guardar usuario asociado
  const handleSaveUser = async (userData: any) => {
    try {
      const response = await fetch('http://localhost:3309/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...userData, 
          colaboradorId: Number(createdColaborador?.id),
          areaId: Number(userData.areaId)
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error al crear usuario');
      toast.success('Usuario creado exitosamente');
      setIsUserDialogOpen(false);
      setCreatedColaborador(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  return (
    <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
      <ColaboradoresHeader onCreateColaborador={handleCreateColaborador} />
      <CardContent className="p-6">
        {isLoading ? (
          <ColaboradoresLoading />
        ) : filteredColaboradores.length === 0 ? (
          <ColaboradoresEmptyState 
            searchQuery={searchQuery}
            onCreateColaborador={handleCreateColaborador}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary">
                  {filteredColaboradores.length} colaborador{filteredColaboradores.length !== 1 ? 'es' : ''} encontrado{filteredColaboradores.length !== 1 ? 's' : ''}
                </span>
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Filtrado por: "{searchQuery}"
                  </Badge>
                )}
              </div>
            </div>
            
            <ColaboradoresTable 
              colaboradores={filteredColaboradores}
              onEdit={handleEditColaborador}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          </div>
        )}
        
        <ColaboradorDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          colaborador={selectedColaborador}
          tiposColaborador={tiposColaborador}
          tiposContrato={tiposContrato}
          roles={roles}
          areas={areas}
          onSave={handleSaveColaborador}
        />
        
        <UserDialog
          open={isUserDialogOpen}
          onOpenChange={setIsUserDialogOpen}
          userData={{
            name: createdColaborador?.fullName || '',
            email: '',
            roleId: '',
            colaboradorId: createdColaborador?.id,
            areaId: createdColaborador?.areaId,
            active: true
          }}
          roles={roles}
          areas={areas}
          onSubmit={handleSaveUser}
          isSubmitting={false}
        />
      </CardContent>
    </Card>
  );
};

export default ColaboradoresTabContent;
