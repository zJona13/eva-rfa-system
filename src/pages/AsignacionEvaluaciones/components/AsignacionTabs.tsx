
import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AsignacionHistorial from './AsignacionHistorial';
import { Asignacion } from '../hooks/useAsignacionData';

interface AsignacionTabsProps {
  todasAsignaciones: Asignacion[];
  asignacionesAbiertas: Asignacion[];
  asignacionesCerradas: Asignacion[];
  onEdit: (asignacion: Asignacion) => void;
  onDelete: (id: number) => void;
  onNewAsignacion: () => void;
}

const AsignacionTabs: React.FC<AsignacionTabsProps> = ({
  todasAsignaciones,
  asignacionesAbiertas,
  asignacionesCerradas,
  onEdit,
  onDelete,
  onNewAsignacion,
}) => {
  const EmptyState = ({ title, description, showButton = false }: { 
    title: string; 
    description: string; 
    showButton?: boolean;
  }) => (
    <div className="text-center py-8">
      <p className="text-gray-500">{title}</p>
      <p className="text-sm text-gray-400 mt-2">{description}</p>
      {showButton && (
        <Button onClick={onNewAsignacion} className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          Crear Primera Asignación
        </Button>
      )}
    </div>
  );

  return (
    <Tabs defaultValue="todas" className="space-y-4">
      <TabsList>
        <TabsTrigger value="todas" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Todas ({todasAsignaciones.length})
        </TabsTrigger>
        <TabsTrigger value="abiertas" className="flex items-center gap-2">
          Abiertas ({asignacionesAbiertas.length})
        </TabsTrigger>
        <TabsTrigger value="cerradas" className="flex items-center gap-2">
          Cerradas ({asignacionesCerradas.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="todas">
        <Card>
          <CardHeader>
            <CardTitle>Todas las Asignaciones</CardTitle>
            <CardDescription>
              Historial completo de asignaciones de evaluación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todasAsignaciones.length > 0 ? (
              <AsignacionHistorial
                asignaciones={todasAsignaciones}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ) : (
              <EmptyState
                title="No hay asignaciones para mostrar"
                description="No se han creado asignaciones aún"
                showButton={true}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="abiertas">
        <Card>
          <CardHeader>
            <CardTitle>Asignaciones Abiertas</CardTitle>
            <CardDescription>
              Asignaciones que están actualmente abiertas para evaluación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {asignacionesAbiertas.length > 0 ? (
              <AsignacionHistorial
                asignaciones={asignacionesAbiertas}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ) : (
              <EmptyState
                title="No hay asignaciones abiertas"
                description=""
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cerradas">
        <Card>
          <CardHeader>
            <CardTitle>Asignaciones Cerradas</CardTitle>
            <CardDescription>
              Asignaciones completadas y cerradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {asignacionesCerradas.length > 0 ? (
              <AsignacionHistorial
                asignaciones={asignacionesCerradas}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ) : (
              <EmptyState
                title="No hay asignaciones cerradas"
                description=""
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AsignacionTabs;
