
// Servicio para consumir los endpoints de asignaciones

const API_URL = '/api/asignaciones';

export interface AsignacionData {
  idUsuario: number;
  periodo: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  idArea: number;
}

export interface Asignacion {
  idAsignacion: number;
  periodo: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  areaNombre: string;
  usuarioCorreo: string;
  nombreCompleto: string;
}

export interface EvaluacionAsignacion {
  idEvaluacion: number;
  fechaEvaluacion: string;
  horaEvaluacion: string;
  puntajeTotal: number;
  comentario: string;
  estado: string;
  tipoEvaluacion: string;
  evaluadorNombre: string;
  evaluadoNombre: string;
}

// Crear una nueva asignación
export async function crearAsignacion(asignacionData: AsignacionData) {
  const res = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asignacionData)
  });
  if (!res.ok) throw new Error('Error al crear asignación');
  return res.json();
}

// Obtener todas las asignaciones
export async function obtenerAsignaciones() {
  const res = await fetch(`${API_URL}`);
  if (!res.ok) throw new Error('Error al obtener asignaciones');
  return res.json();
}

// Obtener asignaciones activas por usuario
export async function obtenerAsignacionesActivasByUsuario(userId: number) {
  const res = await fetch(`${API_URL}/user/${userId}`);
  if (!res.ok) throw new Error('Error al obtener asignaciones activas');
  return res.json();
}

// Obtener evaluaciones de una asignación
export async function obtenerEvaluacionesByAsignacion(asignacionId: number) {
  const res = await fetch(`${API_URL}/${asignacionId}/evaluaciones`);
  if (!res.ok) throw new Error('Error al obtener evaluaciones');
  return res.json();
}

// Verificar si evaluación está en período activo
export async function verificarPeriodoActivo(evaluacionId: number) {
  const res = await fetch(`/api/evaluaciones/${evaluacionId}/periodo-activo`);
  if (!res.ok) throw new Error('Error al verificar período');
  return res.json();
}

// Actualizar estado de asignación
export async function actualizarEstadoAsignacion(asignacionId: number, estado: string) {
  const res = await fetch(`${API_URL}/${asignacionId}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
  return res.json();
}
