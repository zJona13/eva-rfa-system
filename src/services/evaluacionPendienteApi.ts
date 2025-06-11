import { getToken } from '../contexts/AuthContext';

const API_URL = '/api/evaluaciones';

export async function obtenerEvaluacionesPendientes(idUsuario: number, idTipoEvaluacion: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/pendientes/${idUsuario}/${idTipoEvaluacion}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Error al obtener evaluaciones pendientes');
  return res.json();
}

export async function obtenerInfoEvaluacion(idEvaluacion: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/${idEvaluacion}/info`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Error al obtener información de evaluación');
  return res.json();
}
