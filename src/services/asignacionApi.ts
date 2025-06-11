const API_URL = '/api/asignaciones';
import { getToken } from '../contexts/AuthContext';

export async function crearAsignacion(asignacionData) {
  const res = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asignacionData)
  });
  if (!res.ok) throw new Error('Error al crear asignación');
  return res.json();
}

export async function listarAsignaciones() {
  const token = getToken();
  const res = await fetch(`${API_URL}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Error al obtener asignaciones');
  return res.json();
} 