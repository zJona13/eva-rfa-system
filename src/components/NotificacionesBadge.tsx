
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3306/api';

// Función para obtener el token OAuth
const getOAuthToken = () => {
  return localStorage.getItem('oauth_access_token');
};

// Función para verificar si el token ha expirado
const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('oauth_expires_at');
  if (!expiresAt) return true;
  return Date.now() > parseInt(expiresAt);
};

// Función para refrescar el token
const refreshToken = async () => {
  const refresh_token = localStorage.getItem('oauth_refresh_token');
  if (!refresh_token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.access_token) {
      localStorage.setItem('oauth_access_token', data.access_token);
      localStorage.setItem('oauth_refresh_token', data.refresh_token);
      localStorage.setItem('oauth_expires_at', (Date.now() + (data.expires_in * 1000)).toString());
      return true;
    } else {
      console.error('Error refreshing token:', data);
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Función para hacer requests autenticados con OAuth
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  let token = getOAuthToken();
  
  if (!token) {
    throw new Error('No OAuth token available');
  }

  if (isTokenExpired()) {
    console.log('Token expired, attempting to refresh...');
    const refreshed = await refreshToken();
    if (!refreshed) {
      throw new Error('OAuth token expired and refresh failed');
    }
    token = getOAuthToken();
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

const fetchNotificaciones = async (userId: number) => {
  console.log('Fetching notifications for user:', userId);
  
  const response = await authenticatedFetch(`${API_BASE_URL}/notificaciones/user/${userId}`);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error fetching notifications:', errorData);
    throw new Error(`Error ${response.status}: ${errorData.error_description || response.statusText}`);
  }

  return response.json();
};

const markAsRead = async (notificationId: number) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/notificaciones/${notificationId}/read`, {
    method: 'PUT',
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error marking notification as read:', errorData);
    throw new Error(`Error ${response.status}: ${errorData.error_description || response.statusText}`);
  }

  return response.json();
};

const NotificacionesBadge = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const userId = user?.id ? parseInt(user.id) : 0;

  const { data: notificacionesData } = useQuery({
    queryKey: ['notificaciones', userId],
    queryFn: () => fetchNotificaciones(userId),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch cada 30 segundos
    retry: (failureCount, error: any) => {
      // No reintentar si es un error de autenticación
      if (error?.message?.includes('invalid_token') || error?.message?.includes('token_expired')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
    onError: (error: any) => {
      console.error('Error marking notification as read:', error);
      toast.error(`Error al marcar notificación: ${error.message}`);
    },
  });

  const notificaciones = notificacionesData?.notificaciones || [];
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
