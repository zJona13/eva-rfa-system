import React, { useEffect, useState } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck, CheckSquare, MessageSquare, Send, Loader2, AlertCircle, User, ArrowLeft, CheckCircle2, TrendingUp, Award, Star, Target, Zap } from 'lucide-react';
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
      
      const infoData = await obtenerInfoEvaluacion(idEvaluacion);
      const evaluacionCargada = infoData.evaluacion;

      console.log('Evaluación de supervisor cargada (iniciarEvaluacion):', evaluacionCargada);

      setEvaluacionActual(evaluacionCargada);
      setEstadoEvaluacion(evaluacionCargada.estado);
      setComentario(evaluacionCargada.comentario || '');

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
    setEstadoEvaluacion('Pendiente');
  };

  const handlePuntaje = (idSubCriterio, valor) => {
    setPuntajes(prev => ({ ...prev, [idSubCriterio]: valor }));
  };

  const handlePeriodoChange = (value) => {
    //setEvaluacionInfo(prev => ({ ...prev, periodo: value }));
  };

  const handleDocenteSelect = (docente) => {
    //setEvaluacionInfo(prev => ({
    //  ...prev,
    //  nombreDocente: docente.name,
    //  idDocente: docente.id
    //}));
    //setOpen(false);
  };

  const renderRatingOptions = (idSubCriterio, currentValue) => {
    const options = [
      { value: '1', label: 'Cumple Totalmente / Observado Satisfactoriamente', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/20' },
      { value: '0.5', label: 'Cumple Parcialmente / Observado con Áreas de Mejora', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/20' },
      { value: '0', label: 'No Cumple / No Observado', color: 'text-red-500 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/20' }
    ];

    return (
      <div className="space-y-3">
        <RadioGroup
          value={currentValue || ''}
          onValueChange={(value) => handlePuntaje(idSubCriterio, value)}
          className="space-y-3"
          disabled={estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada'}
        >
          {options.map((option) => (
            <div key={option.value} className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              currentValue === option.value 
                ? `${option.bgColor} border-current shadow-sm` 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
              <RadioGroupItem 
                value={option.value} 
                id={`${idSubCriterio}-${option.value}`} 
                disabled={estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada'}
                className="border-2"
              />
              <Label 
                htmlFor={`${idSubCriterio}-${option.value}`} 
                className={`text-sm cursor-pointer ${option.color} font-medium flex-1`}
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
        status: 'Activo',
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

  const getScoreColor = (score) => {
    if (score >= 16) return 'text-emerald-500';
    if (score >= 12) return 'text-blue-500';
    if (score >= 8) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreIcon = (score) => {
    if (score >= 16) return Award;
    if (score >= 12) return Star;
    if (score >= 8) return Target;
    return TrendingUp;
  };

  const getScoreMessage = (score) => {
    if (score >= 16) return { title: '¡Excelente Evaluación!', subtitle: 'Evaluación sobresaliente del docente' };
    if (score >= 12) return { title: 'Buena Evaluación', subtitle: 'Evaluación satisfactoria del docente' };
    if (score >= 8) return { title: 'Evaluación Regular', subtitle: 'Hay oportunidades de mejora' };
    return { title: 'Necesita Mejoras', subtitle: 'Se requiere plan de desarrollo' };
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
      {/* Barra de progreso sticky */}
      {mostrarFormulario && (
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b shadow-sm">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-green-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Evaluación Supervisor-Docente</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {Object.keys(puntajes).length} de {totalSubcriterios} criterios
              </div>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        </div>
      )}

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
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Evaluar Docente
        </h1>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-950/20">
        <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
            <User className="h-5 w-5" />
            Detalles de la Evaluación
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Completa el formulario para evaluar al docente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Docente</Label>
              <Input 
                value={evaluacionActual?.nombreEvaluado || ''} 
                disabled 
                className="bg-gray-50 dark:bg-gray-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Curso</Label>
              <Input 
                value={evaluacionActual?.nombreAsignacion || ''} 
                disabled 
                className="bg-gray-50 dark:bg-gray-800/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período Académico</Label>
            <Input 
              value={evaluacionActual?.periodo || ''} 
              disabled 
              className="bg-gray-50 dark:bg-gray-800/50"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Criterios de Evaluación</h2>
        </div>

        {criterios.length === 0 ? (
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-500" />
            <p className="text-gray-600 dark:text-gray-400">Cargando criterios de evaluación...</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {criterios.map((criterio, index) => (
              <Card key={criterio.idCriterio} className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-white to-green-50/30 dark:from-green-950/20">
                <CardHeader className="pb-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Criterio {index + 1}
                    </Badge>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {criterio.subcriterios?.length || 0} subcriterios
                    </span>
                  </div>
                  <CardTitle className="text-xl text-green-900 dark:text-green-100">
                    {criterio.nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {criterio.subcriterios?.map((sub, subIndex) => (
                    <div key={sub.idSubCriterio} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-green-100 dark:border-green-900/30">
                      <div className="flex items-start gap-3 mb-4">
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800">
                          {index + 1}.{subIndex + 1}
                        </Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-relaxed">
                            {sub.nombre}
                          </h4>
                          {renderRatingOptions(sub.idSubCriterio, puntajes[sub.idSubCriterio])}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-950/20">
        <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
            <MessageSquare className="h-5 w-5" />
            Comentarios Adicionales
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Comparte observaciones adicionales sobre el desempeño del docente (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea
            placeholder="Escribe tus comentarios y observaciones aquí..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={5}
            disabled={estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada'}
            className="min-h-[120px] resize-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4 pt-6">
        <Button variant="outline" onClick={handleCancelar} disabled={enviando} className="px-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button 
          onClick={handleEnviar} 
          disabled={enviando || estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada'}
          className="px-6 bg-green-600 hover:bg-green-700 text-white"
        >
          {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Send className="mr-2 h-4 w-4" />
          Enviar Evaluación
        </Button>
      </div>

      {/* Sección de Resumen Final Mejorada */}
      {(estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada' || Object.keys(puntajes).length === totalSubcriterios) && (
        <Card className="mt-8 shadow-2xl border-0 bg-gradient-to-br from-white via-green-50/20 to-emerald-50/30 dark:from-gray-800 dark:via-green-950/10 dark:to-emerald-950/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-green-400/5 dark:to-emerald-400/5" />
          <CardHeader className="relative bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-400/10 dark:to-emerald-400/10 border-b border-green-200/20 dark:border-green-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100">
                  Resumen de la Evaluación
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Análisis detallado de los resultados obtenidos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative p-8 space-y-8">
            {/* Puntaje Principal */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className={`text-6xl font-bold ${getScoreColor(puntaje20)} relative z-10`}>
                  {puntaje20.toFixed(1)}
                  <span className="text-2xl ml-1 text-gray-500 dark:text-gray-400">
                    / 20
                  </span>
                </div>
                <div className="absolute -top-2 -right-2">
                  {(() => {
                    const IconComponent = getScoreIcon(puntaje20);
                    return <IconComponent className={`h-8 w-8 ${getScoreColor(puntaje20)}`} />;
                  })()}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className={`text-2xl font-bold ${getScoreColor(puntaje20)}`}>
                  {getScoreMessage(puntaje20).title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {getScoreMessage(puntaje20).subtitle}
                </p>
              </div>

              {/* Barra de progreso visual */}
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>0</span>
                  <span>20</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      puntaje20 >= 16 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                      puntaje20 >= 12 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      puntaje20 >= 8 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                      'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${(puntaje20 / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-green-100 dark:border-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Object.keys(puntajes).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Criterios Evaluados
                </div>
              </div>
              
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-green-100 dark:border-green-900/30">
                <Star className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {((puntaje20 / 20) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Porcentaje Obtenido
                </div>
              </div>
              
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-green-100 dark:border-green-900/30">
                <Zap className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {criteriosBajos.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Áreas de Mejora
                </div>
              </div>
            </div>

            {/* Criterios con menor puntaje */}
            {criteriosBajos.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-500" />
                  Áreas de Mejora Identificadas
                </h3>
                <div className="space-y-3">
                  {criteriosBajos.map((criterio, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                      <span className="font-medium text-amber-800 dark:text-amber-200">
                        {criterio.nombre}
                      </span>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        {(criterio.promedio * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comentarios */}
            {comentario && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  Comentarios de la Evaluación
                </h3>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {comentario}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
