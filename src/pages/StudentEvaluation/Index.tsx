// Página vacía temporalmente por solicitud
import { useEffect, useState } from 'react';
import { getCriteriosPorTipoEvaluacion, crearEvaluacion } from '../../services/evaluacionApi';

export default function StudentEvaluationPage() {
  const [criterios, setCriterios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [puntajes, setPuntajes] = useState({});
  const [comentario, setComentario] = useState('');
  const [idAsignacion, setIdAsignacion] = useState('');
  const [idEvaluador, setIdEvaluador] = useState('');
  const [idEvaluado, setIdEvaluado] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    // 1 = Evaluación Estudiante al Docente
    getCriteriosPorTipoEvaluacion(1).then(data => {
      setCriterios(data.criterios);
      setLoading(false);
    });
  }, []);

  const handlePuntaje = (idSubCriterio, valor) => {
    setPuntajes(prev => ({ ...prev, [idSubCriterio]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    // Construir detalles
    const detalles = [];
    criterios.forEach(criterio => {
      criterio.subcriterios.forEach(sub => {
        if (puntajes[sub.idSubCriterio]) {
          detalles.push({
            idSubCriterio: sub.idSubCriterio,
            puntaje: Number(puntajes[sub.idSubCriterio])
          });
        }
      });
    });
    // Calcular puntaje total (promedio simple)
    const score = detalles.length > 0 ? detalles.reduce((a, b) => a + b.puntaje, 0) / detalles.length : 0;
    const evaluacionData = {
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      score,
      comments: comentario,
      status: 'Activo',
      idAsignacion: Number(idAsignacion),
      idEvaluador: Number(idEvaluador),
      idEvaluado: Number(idEvaluado),
      idTipoEvaluacion: 1,
      detalles
    };
    try {
      const res = await crearEvaluacion(evaluacionData);
      alert('Evaluación enviada: ' + res.evaluacionId);
      setPuntajes({});
      setComentario('');
    } catch (e) {
      alert('Error al enviar evaluación');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Evaluación Estudiante al Docente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input type="number" placeholder="ID Asignación" value={idAsignacion} onChange={e => setIdAsignacion(e.target.value)} required className="border p-1 rounded" />
          <input type="number" placeholder="ID Evaluador" value={idEvaluador} onChange={e => setIdEvaluador(e.target.value)} required className="border p-1 rounded" />
          <input type="number" placeholder="ID Evaluado" value={idEvaluado} onChange={e => setIdEvaluado(e.target.value)} required className="border p-1 rounded" />
        </div>
        {loading ? <p>Cargando criterios...</p> : (
          <div className="space-y-4">
            {criterios.map(criterio => (
              <div key={criterio.idCriterio} className="border rounded p-2">
                <h3 className="font-semibold mb-2">{criterio.nombre}</h3>
                <ul className="space-y-2">
                  {criterio.subcriterios.map(sub => (
                    <li key={sub.idSubCriterio} className="flex items-center gap-2">
                      <span className="flex-1">{sub.nombre}</span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={puntajes[sub.idSubCriterio] || ''}
                        onChange={e => handlePuntaje(sub.idSubCriterio, e.target.value)}
                        className="w-16 border rounded p-1"
                        required
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <textarea
          placeholder="Comentario general"
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar Evaluación'}
        </button>
      </form>
    </div>
  );
}
