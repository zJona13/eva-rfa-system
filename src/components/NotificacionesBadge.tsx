
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiWithToken } from '@/hooks/useApiWithToken';
import { toast } from 'sonner';

const NotificacionesBadge = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { apiRequest } = useApiWithToken();
  const [open, setOpen] = useState(false);

  const userId = user?.id ? parseInt(user.id) : 0;

  const { data: notificacionesData } = useQuery({
    queryKey: ['notificaciones', userId],
    queryFn: () => apiRequest(`/notificaciones/user/${userId}`),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch cada 30 segundos
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => apiRequest(`/notificaciones/${notificationId}/read`, {
      method: 'PUT'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
    onError: (error: any) => {
      toast.error(`Error al marcar notificación: ${error.message}`);
    },
  });

  const notificaciones = notificacionesData?.data?.notificaciones || [];
  const unreadCount = notificaciones.filter((n: any) => !n.leido).length;

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <h3 className="font-semibold">Notificaciones</h3>
          <ScrollArea className="h-[300px]">
            {notificaciones.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay notificaciones
              </p>
            ) : (
              <div className="space-y-2">
                {notificaciones.map((notificacion: any) => (
                  <div 
                    key={notificacion.id}
                    className={`p-3 rounded-lg border ${notificacion.leido ? 'bg-muted/50' : 'bg-muted'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm">{notificacion.mensaje}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notificacion.fecha).toLocaleDateString()} - {notificacion.hora}
                        </p>
                        {notificacion.incidenciaTipo && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {notificacion.incidenciaTipo}
                          </Badge>
                        )}
                      </div>
                      {!notificacion.leido && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notificacion.id)}
                          className="p-1 h-auto"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificacionesBadge;
