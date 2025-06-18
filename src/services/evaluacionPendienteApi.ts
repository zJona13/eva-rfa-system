import { getToken } from '../contexts/AuthContext';
import { API_ENDPOINTS, api } from '../config/api';

export async function obtenerEvaluacionesPendientes(idUsuario: number, idTipoEvaluacion: number) {
  const token = getToken();
  return api.get(`${API_ENDPOINTS.EVALUACIONES.PENDIENTES}/${idUsuario}/${idTipoEvaluacion}`, token);
}

export const obtenerInfoEvaluacion = async (idEvaluacion: number) => {
  const token = getToken();
  return api.get(`${API_ENDPOINTS.EVALUACIONES.BASE}/${idEvaluacion}/info`, token);
};

export async function obtenerTodasLasEvaluacionesPorUsuarioYTipo(idUsuario: number, idTipoEvaluacion: number, rol: 'evaluador' | 'evaluado' = 'evaluador') {
  const token = getToken();
  let url = '';
  if (rol === 'evaluador') {
    url = `${API_ENDPOINTS.EVALUACIONES.BASE}/byUserAndType/${idUsuario}/${idTipoEvaluacion}`;
  } else {
    url = `${API_ENDPOINTS.EVALUACIONES.BASE}/byEvaluadoAndType/${idUsuario}/${idTipoEvaluacion}`;
  }
  return api.get(url, token);
}
