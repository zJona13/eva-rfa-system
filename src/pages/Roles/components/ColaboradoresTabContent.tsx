import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search, User, Building, Calendar, Phone, Mail, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ColaboradorDialog from './ColaboradorDialog';

// Tipos
interface Role {
  id: number;
  name: string;
}

interface TipoColaborador {
  id: number;
  name: string;
}

interface TipoContrato {
  id: number;
  name: string;
}

interface Area {
  id: number;
  name: string;
  descripcion: string;
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

interface ColaboradorDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  colaborador?: Colaborador;
  tiposColaborador: TipoColaborador[];
  tiposContrato: TipoContrato[];
  roles: Role[];
  areas: Area[];
  onSave: (colaboradorData: any) => Promise<void>;
}

interface ColaboradoresTabContentProps {
  colaboradores: Colaborador[];
  isLoading: boolean;
  searchQuery: string;
  tiposColaborador: TipoColaborador[];
  tiposContrato: TipoContrato[];
  roles: Role[];
  areas: Area[];
}

const ColaboradoresTabContent: React.FC<ColaboradoresTabContentProps> = ({
  colaboradores,
  isLoading,
  searchQuery,
  tiposColaborador,
  tiposContrato,
  roles,
  areas
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [colaboradoresList, setColaboradores] = useState<Colaborador[]>(colaboradores);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    async (id: number) => {
      const response = await fetch(`http://localhost:3309/api/colaboradores/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar el colaborador');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        toast.success('Colaborador eliminado exitosamente');
        queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
        setColaboradores(prev => prev.filter(colaborador => colaborador.id !== editingColaborador?.id));
        setEditingColaborador(null);
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Error al eliminar el colaborador');
      },
    }
  );

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const filteredColaboradores = colaboradores.filter(colaborador =>
    colaborador.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    colaborador.nombres.toLowerCase().includes(searchQuery.toLowerCase()) ||
    colaborador.apePat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    colaborador.apeMat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    colaborador.dni.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (colaboradorData: any) => {
    try {
      let response;
      if (editingColaborador) {
        response = await fetch(`http://localhost:3309/api/colaboradores/${editingColaborador.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': { 'Content-Type': 'application/json' }['Content-Type'] },
          body: JSON.stringify(colaboradorData)
        });
      } else {
        response = await fetch('http://localhost:3309/api/colaboradores', {
          method: 'POST',
          headers: { 'Content-Type': { 'Content-Type': 'application/json' }['Content-Type'] },
          body: JSON.stringify(colaboradorData)
        });
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(editingColaborador ? 'Colaborador actualizado exitosamente' : 'Colaborador creado exitosamente');
        
        if (!editingColaborador && data.colaborador) {
          const createdColaborador: Colaborador = {
            id: data.colaborador.id,
            fullName: data.colaborador.fullName,
            nombres: data.colaborador.nombres,
            apePat: data.colaborador.apePat,
            apeMat: data.colaborador.apeMat,
            birthDate: data.colaborador.birthDate,
            address: data.colaborador.address,
            phone: data.colaborador.phone,
            dni: data.colaborador.dni,
            active: data.colaborador.active,
            roleId: Number(data.colaborador.roleId), // Convert to number
            roleName: data.colaborador.roleName,
            contractId: Number(data.colaborador.contractId), // Convert to number
            startDate: data.colaborador.startDate,
            endDate: data.colaborador.endDate,
            contractActive: data.colaborador.contractActive,
            contractTypeId: data.colaborador.contractTypeId,
            contractType: data.colaborador.contractType,
            areaName: data.colaborador.areaName,
            areaId: Number(data.colaborador.areaId) // Convert to number
          };
          setColaboradores(prev => [...prev, createdColaborador]);
        }
        
        queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
        setDialogOpen(false);
        setEditingColaborador(null);
      } else {
        toast.error(data.message || 'Error al guardar colaborador');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar colaborador');
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-background/80 backdrop-blur-sm border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Cargando colaboradores...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-2 shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Gestión de Colaboradores</CardTitle>
              <CardDescription className="text-muted-foreground">
                Administra los colaboradores existentes en el sistema
              </CardDescription>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-md"
                onClick={() => setEditingColaborador(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Colaborador
              </Button>
            </DialogTrigger>
            <ColaboradorDialog
              open={dialogOpen}
              setOpen={setDialogOpen}
              colaborador={editingColaborador}
              tiposColaborador={tiposColaborador}
              tiposContrato={tiposContrato}
              roles={roles}
              areas={areas}
              onSave={handleSave}
            />
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">ID</TableHead>
                <TableHead className="font-semibold text-foreground">Nombre Completo</TableHead>
                <TableHead className="font-semibold text-foreground">DNI</TableHead>
                <TableHead className="font-semibold text-foreground">Rol</TableHead>
                <TableHead className="font-semibold text-foreground">Tipo Contrato</TableHead>
                <TableHead className="font-semibold text-foreground">Estado</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredColaboradores.map((colaborador, index) => (
                <TableRow key={colaborador.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium">{colaborador.id}</TableCell>
                  <TableCell>{colaborador.fullName}</TableCell>
                  <TableCell>{colaborador.dni}</TableCell>
                  <TableCell>{colaborador.roleName}</TableCell>
                  <TableCell>{colaborador.contractType}</TableCell>
                  <TableCell>
                    {colaborador.active ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Activo
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Inactivo
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingColaborador(colaborador);
                          setDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar colaborador</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(colaborador.id)}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar colaborador</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredColaboradores.length === 0 && (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <User className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No se encontraron colaboradores</p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Intenta ajustar los filtros de búsqueda
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ColaboradoresTabContent;
