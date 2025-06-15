import { useEffect, useState } from 'react';
import { getCriteriosPorTipoEvaluacion, crearEvaluacion, actualizarEvaluacion } from '../../services/evaluacionApi';
import { obtenerEvaluacionesPendientes, obtenerInfoEvaluacion, obtenerTodasLasEvaluacionesPorUsuarioYTipo } from '../../services/evaluacionPendienteApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ClipboardCheck, CheckSquare, MessageSquare, Send, Loader2, AlertCircle, User, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EvaluationCard from '../../components/EvaluationCard';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getToken } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

export default function SupervisorEvaluationPage() {
  const [historialEvaluaciones, setHistorialEvaluaciones] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [evaluacionActual, setEvaluacionActual] = useState(null);
  const [criterios, setCriterios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [puntajes, setPuntajes] = useState({});
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [open, setOpen] = useState(false);
  const [estadoEvaluacion, setEstadoEvaluacion] = useState('Pendiente');
  const navigate = useNavigate();

  // Lista de periodos académicos
  const periodosAcademicos = [
    { value: '2024-1', label: '2024 - I' },
    { value: '2024-2', label: '2024 - II' },
    { value: '2025-1', label: '2025 - I' },
    { value: '2025-2', label: '2025 - II' }
  ];

  useEffect(() => {
    const fetchEvaluaciones = async () => {
      try {
        setError(null);
        setLoading(true);
        const token = getToken();
        const response = await fetch('http://localhost:3309/api/users/current', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!response.ok) {
          throw new Error('Error al obtener información del usuario');
        }
        const userData = await response.json();
        // Obtener TODAS las evaluaciones de supervisor (tipo 2) del usuario
        const evaluacionesData = await obtenerTodasLasEvaluacionesPorUsuarioYTipo(userData.id, 2);
        setHistorialEvaluaciones(evaluacionesData.evaluaciones || []);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar historial de evaluaciones de supervisor:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchEvaluaciones();
  }, []);

  const iniciarEvaluacion = async (idEvaluacion) => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener información de la evaluación, que ahora incluye detalles
      const infoData = await obtenerInfoEvaluacion(idEvaluacion);
      const evaluacionCargada = infoData.evaluacion;

      console.log('Evaluación de supervisor cargada (iniciarEvaluacion):', evaluacionCargada);

      setEvaluacionActual(evaluacionCargada);
      setEstadoEvaluacion(evaluacionCargada.estado);
      setComentario(evaluacionCargada.comentario || ''); // Cargar comentario

      // Cargar puntajes si existen detalles guardados
      if (evaluacionCargada.detalles && Array.isArray(evaluacionCargada.detalles)) {
        const loadedPuntajes = {};
        evaluacionCargada.detalles.forEach(detalle => {
          let formattedPuntaje;
          if (parseFloat(detalle.puntaje) === 1) {
            formattedPuntaje = '1';
          } else if (parseFloat(detalle.puntaje) === 0.5) {
            formattedPuntaje = '0.5';
          } else if (parseFloat(detalle.puntaje) === 0) {
            formattedPuntaje = '0';
          } else {
            formattedPuntaje = ''; 
          }
          loadedPuntajes[detalle.idSubCriterio] = formattedPuntaje;
        });
        setPuntajes(loadedPuntajes);
        console.log('Puntajes cargados (loadedPuntajes):', loadedPuntajes);
      } else {
        setPuntajes({});
        console.log('No se encontraron detalles para cargar puntajes.');
      }
      
      // Obtener criterios de evaluación supervisor-docente (tipo 2)
      const criteriosData = await getCriteriosPorTipoEvaluacion(2);
      setCriterios(criteriosData.criterios);
      console.log('Criterios obtenidos (criteriosData.criterios):', criteriosData.criterios);
      
      setMostrarFormulario(true);
      setLoading(false);
    } catch (error) {
      console.error('Error al iniciar evaluación de supervisor (iniciarEvaluacion):', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const volverALista = () => {
    setMostrarFormulario(false);
    setEvaluacionActual(null);
    setCriterios([]);
    setPuntajes({});
    setComentario('');
    setError(null);
    setEstadoEvaluacion('Pendiente'); // Resetear el estado al volver a la lista
  };

  const handlePuntaje = (idSubCriterio, valor) => {
    setPuntajes(prev => ({ ...prev, [idSubCriterio]: valor }));
  };

  const handlePeriodoChange = (value) => {
    //setEvaluacionInfo(prev => ({ ...prev, periodo: value })); // No es necesario si se carga por asignación
  };

  const handleDocenteSelect = (docente) => {
    //setEvaluacionInfo(prev => ({ // No es necesario si se carga por asignación
    //  ...prev,
    //  nombreDocente: docente.name,
    //  idDocente: docente.id
    //}));
    //setOpen(false);
  };

  const renderRatingOptions = (idSubCriterio, currentValue) => {
    const options = [
      { value: '1', label: 'Cumple Totalmente / Observado Satisfactoriamente', color: 'text-green-600' },
      { value: '0.5', label: 'Cumple Parcialmente / Observado con Áreas de Mejora', color: 'text-yellow-600' },
      { value: '0', label: 'No Cumple / No Observado', color: 'text-red-600' }
    ];

    return (
      <div className="space-y-3">
        <RadioGroup
          value={currentValue || ''}
          onValueChange={(value) => handlePuntaje(idSubCriterio, value)}
          className="space-y-2"
          disabled={estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada'}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.value} 
                id={`${idSubCriterio}-${option.value}`} 
                disabled={estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada'}
              />
              <Label 
                htmlFor={`${idSubCriterio}-${option.value}`} 
                className={`text-sm cursor-pointer ${option.color} font-medium`}
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  const handleEnviar = async () => {
    setEnviando(true);
    setError(null);
    
    try {
      const totalSubcriterios = criterios.reduce((total, criterio) => total + criterio.subcriterios.length, 0);
      if (Object.keys(puntajes).length !== totalSubcriterios) {
        const errorMessage = 'Debe calificar todos los criterios antes de enviar la evaluación';
        console.error('Error de validación frontend (handleEnviar):', errorMessage);
        throw new Error(errorMessage);
      }

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
      
      const score = detalles.length > 0 ? detalles.reduce((a, b) => a + b.puntaje, 0) / detalles.length : 0;
      const puntaje20 = Math.round(score * 20 * 100) / 100;

      const evaluacionDataToSend = {
        puntajeTotal: puntaje20,
        comentario,
        status: 'Activo', // Se guarda como Activo para permitir ediciones
        detalles
      };
      
      console.log('Enviando evaluación de supervisor - ID de evaluación:', evaluacionActual.idEvaluacion);
      console.log('Datos a enviar:', evaluacionDataToSend);

      const result = await actualizarEvaluacion(evaluacionActual.idEvaluacion, evaluacionDataToSend);
      
      if (result.success) {
        setEstadoEvaluacion('Activo');
        toast.success('Evaluación enviada', {
          description: 'Puedes seguir editando mientras la asignación esté activa.',
        });
        console.log('Evaluación de supervisor enviada exitosamente.', result);
        volverALista();
        navigate('/supervisor-evaluation');
      } else {
        console.error('Error en la respuesta del backend (handleEnviar):', result.message);
        throw new Error(result.message);
      }
    } catch (e) {
      console.error('Error general al enviar evaluación de supervisor (handleEnviar):', e.message);
      setError(e.message || 'Error al enviar evaluación');
    } finally {
      setEnviando(false);
    }
  };

  const handleCancelar = () => {
    volverALista();
    navigate('/supervisor-evaluation');
  };

  // Calcular puntaje 0-20 y criterios bajos
  const totalSubcriterios = criterios.reduce((total, criterio) => total + criterio.subcriterios.length, 0);
  const detallesCriterio = criterios.map(criterio => {
    const subPuntajes = criterio.subcriterios.map(sub => Number(puntajes[sub.idSubCriterio] || 0));
    const promedio = subPuntajes.length > 0 ? subPuntajes.reduce((a, b) => a + b, 0) / subPuntajes.length : 0;
    return { nombre: criterio.nombre, promedio };
  });
  const criteriosBajos = detallesCriterio.filter(c => c.promedio < 0.55);
  const puntajeTotal = totalSubcriterios > 0 ? (Object.values(puntajes).map(Number).reduce((a, b) => a + b, 0) / totalSubcriterios) : 0;
  const puntaje20 = Math.round(puntajeTotal * 20 * 100) / 100;

  const getProgress = () => {
    const totalSubcriterios = criterios.reduce((total, criterio) => total + criterio.subcriterios.length, 0);
    const completedSubcriterios = Object.keys(puntajes).length;
    return totalSubcriterios > 0 ? (completedSubcriterios / totalSubcriterios) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Cargando información...
          </span>
        </div>
      </div>
    );
  }

  // Vista de lista de evaluaciones
  if (!mostrarFormulario) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <button onClick={() => setError(null)} className="text-sm mt-2 underline">Cerrar</button>
          </Alert>
        )}

        {/* Header */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-xl">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-900 dark:text-green-100">
                  Historial de Evaluaciones (Supervisor al Docente)
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Revisa tus evaluaciones de supervisor a docente.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Lista de evaluaciones */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {historialEvaluaciones.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                No tienes evaluaciones de supervisor a docente en tu historial.
              </div>
            </div>
          ) : (
            historialEvaluaciones.map((evaluacion) => (
              <EvaluationCard
                key={evaluacion.idEvaluacion}
                evaluacion={evaluacion}
                colorScheme="green"
                onStartEvaluation={iniciarEvaluacion}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // Vista del formulario de evaluación
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <button onClick={() => setError(null)} className="text-sm mt-2 underline">Cerrar</button>
        </Alert>
      )}

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={volverALista}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Evaluar Docente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Evaluación</CardTitle>
          <CardDescription>Completa el formulario para evaluar al docente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Docente</Label>
              <Input value={evaluacionActual?.nombreEvaluado || ''} disabled />
            </div>
            <div>
              <Label>Curso</Label>
              <Input value={evaluacionActual?.nombreAsignacion || ''} disabled />
            </div>
          </div>
          <div>
            <Label>Período Académico</Label>
            <Input value={evaluacionActual?.periodo || ''} disabled />
          </div>

          <Separator />

          <h2 className="text-xl font-semibold">Criterios de Evaluación</h2>
          {criterios.map((criterio) => (
            <div key={criterio.idCriterio} className="space-y-4">
              <h3 className="text-lg font-medium">{criterio.nombre}</h3>
              {criterio.subcriterios.map((sub) => (
                <div key={sub.idSubCriterio} className="ml-4 p-3 border rounded-md">
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">{sub.nombre}</p>
                  {renderRatingOptions(sub.idSubCriterio, puntajes[sub.idSubCriterio])}
                </div>
              ))}
            </div>
          ))}

          <Separator />

          <h2 className="text-xl font-semibold">Comentarios Adicionales</h2>
          <Textarea
            placeholder="Escribe tus comentarios aquí..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={5}
            disabled={estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada'}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handleCancelar} disabled={enviando}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button onClick={handleEnviar} disabled={enviando || estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada'}>
          {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Send className="mr-2 h-4 w-4" />
          Enviar
        </Button>
      </div>

      {/* Sección de Resumen y Recomendaciones */}
      {(estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada') && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumen de la Evaluación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold">Puntaje Total: <span className="text-green-600">{puntaje20} / 20</span></p>
            {criteriosBajos.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Criterios con menor puntaje:</h3>
                <ul className="list-disc pl-5">
                  {criteriosBajos.map((c, index) => (
                    <li key={index} className="text-sm text-red-600">{c.nombre} (Promedio: {(c.promedio * 100).toFixed(0)}%)</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
