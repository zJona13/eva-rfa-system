import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS, api } from '@/config/api';

interface Notificacion {
  id: number;
  mensaje: string;
  leida: boolean;
  fecha: string;
}

export const NotificacionesBadge: React.FC = () => {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotificaciones = async () => {
    if (!user?.id) return;
    try {
      const data = await api.get(`${API_ENDPOINTS.NOTIFICACIONES.USER}/${user.id}`);
      setNotificaciones(data.notificaciones);
      setUnreadCount(data.notificaciones.filter((n: Notificacion) => !n.leida).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const marcarComoLeida = async (notificationId: number) => {
    try {
      await api.put(`${API_ENDPOINTS.NOTIFICACIONES.READ}/${notificationId}`);
      fetchNotificaciones();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </Button>
  );
};
