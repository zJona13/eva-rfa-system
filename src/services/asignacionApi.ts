const API_URL = `${import.meta.env.VITE_API_URL}/api/asignaciones`;
import { getToken } from '../contexts/AuthContext';

export const listarAsignaciones = async (token: string) => {
  const response = await fetch(`${API_URL}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error('Error al obtener asignaciones');
  return response.json();
};

export const crearAsignacion = async (data: any, token: string) => {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear asignación');
  return response.json();
};

export const actualizarAsignacion = async (id: number, data: any, token: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar asignación');
  return response.json();
}; 