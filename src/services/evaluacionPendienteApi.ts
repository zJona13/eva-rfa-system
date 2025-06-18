import { getToken } from '../contexts/AuthContext';

const API_URL = 'http://localhost:3309/api/evaluaciones';

export async function obtenerEvaluacionesPendientes(idUsuario: number, idTipoEvaluacion: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/pendientes/${idUsuario}/${idTipoEvaluacion}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Error al obtener evaluaciones pendientes');
  return res.json();
}

export const obtenerInfoEvaluacion = async (idEvaluacion: number) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/${idEvaluacion}/info`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error('Error al obtener información de evaluación');
  return response.json();
};

export async function obtenerTodasLasEvaluacionesPorUsuarioYTipo(idUsuario: number, idTipoEvaluacion: number, rol: 'evaluador' | 'evaluado' = 'evaluador') {
  const token = getToken();
  let url = '';
  if (rol === 'evaluador') {
    url = `${API_URL}/byUserAndType/${idUsuario}/${idTipoEvaluacion}`;
  } else {
    url = `${API_URL}/byEvaluadoAndType/${idUsuario}/${idTipoEvaluacion}`;
  }
  const res = await fetch(url, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Error al obtener todas las evaluaciones por usuario y tipo');
  return res.json();
}
