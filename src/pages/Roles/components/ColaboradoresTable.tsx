
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';

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

interface ColaboradoresTableProps {
  colaboradores: Colaborador[];
  onEdit: (colaborador: Colaborador) => void;
  onDelete: (id: number) => void;
}

const ColaboradoresTable: React.FC<ColaboradoresTableProps> = ({
  colaboradores,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="overflow-x-auto bg-background rounded-lg border-2 border-primary/10">
      <Table className="min-w-full">
        <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
          <TableRow className="hover:bg-muted/50">
            <TableHead className="font-semibold text-primary">Nombre Completo</TableHead>
            <TableHead className="font-semibold text-primary">DNI</TableHead>
            <TableHead className="font-semibold text-primary">Rol</TableHead>
            <TableHead className="font-semibold text-primary">Área</TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-primary">Contrato</TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-primary">Estado</TableHead>
            <TableHead className="text-right font-semibold text-primary">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {colaboradores.map((colaborador, index) => (
            <TableRow 
              key={colaborador.id} 
              className={`hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200 ${
                index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
              }`}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {colaborador.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{colaborador.fullName}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {colaborador.dni}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {colaborador.roleName}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {colaborador.areaName || (
                    <span className="text-muted-foreground italic">Sin área asignada</span>
                  )}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-mono">
                    {formatDate(colaborador.startDate)} - {formatDate(colaborador.endDate)}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {colaborador.contractType}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge 
                  variant={colaborador.active && colaborador.contractActive ? "default" : "destructive"} 
                  className={`text-xs font-medium ${
                    colaborador.active && colaborador.contractActive 
                      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400" 
                      : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {colaborador.active && colaborador.contractActive ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(colaborador)}
                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-2 border-destructive/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive">
                          ¿Confirmar eliminación?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará permanentemente al colaborador{' '}
                          <strong className="text-foreground">{colaborador.fullName}</strong> y todos sus datos asociados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => onDelete(colaborador.id)}
                        >
                          Eliminar Colaborador
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ColaboradoresTable;
