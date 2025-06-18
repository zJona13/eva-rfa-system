// Servicio para consumir los endpoints de evaluaciones y criterios/subcriterios

import { API_URL } from '@/config/api';
import { getToken } from '../contexts/AuthContext';

// Obtener criterios y subcriterios por tipo de evaluación
export async function getCriteriosPorTipoEvaluacion(idTipoEvaluacion) {
  const token = getToken();
  const res = await fetch(`${API_URL}/evaluaciones/criterios/${idTipoEvaluacion}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Error al obtener criterios');
  return res.json();
}

// Crear una evaluación con subcriterios
export async function crearEvaluacion(evaluacionData) {
  const res = await fetch(`${API_URL}/evaluaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evaluacionData)
  });
  if (!res.ok) throw new Error('Error al crear evaluación');
  return res.json();
}

// Actualizar una evaluación
export async function actualizarEvaluacion(idEvaluacion, evaluacionData) {
  const token = getToken();
  const res = await fetch(`${API_URL}/evaluaciones/${idEvaluacion}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify(evaluacionData)
  });
  if (!res.ok) throw new Error('Error al actualizar evaluación');
  return res.json();
} 