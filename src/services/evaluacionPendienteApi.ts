import { getToken } from '../contexts/AuthContext';
import { API_URL } from '@/config/api';

export async function obtenerEvaluacionesPendientes(idUsuario: number, idTipoEvaluacion: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/evaluaciones/pendientes/${idUsuario}/${idTipoEvaluacion}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Error al obtener evaluaciones pendientes');
  return res.json();
}

export const obtenerInfoEvaluacion = async (idEvaluacion: number) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/evaluaciones/${idEvaluacion}/info`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error('Error al obtener información de evaluación');
  return response.json();
};

export async function obtenerTodasLasEvaluacionesPorUsuarioYTipo(idUsuario: number, idTipoEvaluacion: number, rol: 'evaluador' | 'evaluado' = 'evaluador') {
  const token = getToken();
  let url = '';
  if (rol === 'evaluador') {
    url = `${API_URL}/evaluaciones/byUserAndType/${idUsuario}/${idTipoEvaluacion}`;
  } else {
    url = `${API_URL}/evaluaciones/byEvaluadoAndType/${idUsuario}/${idTipoEvaluacion}`;
  }
  const res = await fetch(url, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Error al obtener todas las evaluaciones por usuario y tipo');
  return res.json();
}
