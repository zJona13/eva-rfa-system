
const API_URL = '/api/evaluaciones';

export async function obtenerEvaluacionesPendientes(idUsuario: number, idTipoEvaluacion: number) {
  const res = await fetch(`${API_URL}/pendientes/${idUsuario}/${idTipoEvaluacion}`);
  if (!res.ok) throw new Error('Error al obtener evaluaciones pendientes');
  return res.json();
}

export async function obtenerInfoEvaluacion(idEvaluacion: number) {
  const res = await fetch(`${API_URL}/${idEvaluacion}/info`);
  if (!res.ok) throw new Error('Error al obtener información de evaluación');
  return res.json();
}
