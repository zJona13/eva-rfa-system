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
import { ClipboardCheck, CheckSquare, MessageSquare, Send, Loader2, AlertCircle, User, ArrowLeft, CheckCircle2, TrendingUp, Award, Star, Target, Zap, AlertTriangle, ThumbsUp, Trophy, Sparkles } from 'lucide-react';
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
      { 
        value: '1', 
        label: 'Cumple Totalmente', 
        sublabel: 'Observado Satisfactoriamente',
        color: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle2
      },
      { 
        value: '0.5', 
        label: 'Cumple Parcialmente', 
        sublabel: 'Observado con Áreas de Mejora',
        color: 'text-amber-700 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        icon: AlertTriangle
      },
      { 
        value: '0', 
        label: 'No Cumple', 
        sublabel: 'No Observado',
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: AlertCircle
      }
    ];

    return (
      <div className="space-y-3">
        <RadioGroup
          value={currentValue || ''}
          onValueChange={(value) => handlePuntaje(idSubCriterio, value)}
          className="space-y-3"
          disabled={estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada'}
        >
          {options.map((option) => {
            const IconComponent = option.icon;
            const isSelected = currentValue === option.value;
            return (
              <div 
                key={option.value} 
                className={`relative rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                  isSelected 
                    ? `${option.bgColor} ${option.borderColor} shadow-lg transform scale-[1.02]` 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={option.value} 
                    id={`${idSubCriterio}-${option.value}`}
                    className={isSelected ? option.color : ''}
                    disabled={estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada'}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${isSelected ? option.bgColor : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <IconComponent className={`h-5 w-5 ${isSelected ? option.color : 'text-gray-500'}`} />
                    </div>
                    <Label 
                      htmlFor={`${idSubCriterio}-${option.value}`} 
                      className={`text-sm cursor-pointer flex-1 ${isSelected ? option.color : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-xs opacity-75">{option.sublabel}</div>
                    </Label>
                  </div>
                  {isSelected && (
                    <div className={`p-1 rounded-full ${option.bgColor}`}>
                      <CheckCircle2 className={`h-4 w-4 ${option.color}`} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Sticky Progress Bar */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/95 border-b border-green-200/50 dark:border-green-800/50 pb-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-green-950/30 p-6 rounded-2xl border border-green-200/50 dark:border-green-800/50 shadow-lg backdrop-blur-sm">
          <div className="flex justify-between items-center text-sm text-green-700 dark:text-green-300 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold">Progreso de evaluación supervisor-docente</span>
            </div>
            <span className="font-bold text-lg">{Math.round(getProgress())}% completado</span>
          </div>
          <Progress 
            value={getProgress()} 
            className="h-4 bg-green-200/50 dark:bg-green-800/50"
          />
          <div className="mt-2 text-xs text-green-600 dark:text-green-400">
            {Object.keys(puntajes).length} de {totalSubcriterios} criterios evaluados
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <button onClick={() => setError(null)} className="text-sm mt-2 underline">Cerrar</button>
        </Alert>
      )}

      {/* Header con botón de regreso */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-green-950/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-400/5 dark:to-emerald-400/5"></div>
        <CardHeader className="pb-6 relative">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={volverALista}
              className="mr-2 bg-white/70 backdrop-blur-sm border-green-200 hover:bg-white/90"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <ClipboardCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Evaluar Docente - {evaluacionActual?.nombreEvaluado}
              </CardTitle>
              <CardDescription className="text-lg text-green-700 dark:text-green-300 mt-1">
                {evaluacionActual?.nombreAsignacion} - Periodo {evaluacionActual?.periodo}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form Card */}
      <Card className="shadow-xl border-green-200/50 dark:border-green-800/50">
        <CardContent className="p-8">
          <div className="space-y-8">
            {/* Información del Docente Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Docente
                </label>
                <Input
                  value={evaluacionActual?.nombreEvaluado || ''}
                  disabled
                  className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Curso
                </label>
                <Input
                  value={evaluacionActual?.nombreAsignacion || ''}
                  disabled
                  className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Período Académico
                </label>
                <Input
                  value={evaluacionActual?.periodo || ''}
                  disabled
                  className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Criterios Section */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                  <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                    Cargando criterios...
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {criterios.map((criterio, index) => (
                  <Card key={criterio.idCriterio} className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-white to-green-50/30 dark:from-green-950/20">
                    <CardHeader className="pb-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Criterio {index + 1}
                        </Badge>
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-xl text-gray-900 dark:text-gray-100 font-bold">
                        {criterio.nombre}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-8">
                        {criterio.subcriterios?.map((sub, subIndex) => (
                          <div key={sub.idSubCriterio} className="p-6 bg-gradient-to-r from-gray-50/70 to-white/70 dark:from-gray-800/70 dark:to-gray-700/70 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm">
                            <div className="flex flex-col space-y-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                    <div className="p-1 bg-gradient-to-br from-emerald-500 to-green-600 rounded-md">
                                      <Star className="h-4 w-4 text-white" />
                                    </div>
                                    {sub.nombre}
                                  </h4>
                                  {sub.descripcion && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                      {sub.descripcion}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="outline" className="ml-4 bg-white/70 dark:bg-gray-700/70">
                                  {subIndex + 1}
                                </Badge>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-5 w-5 text-green-500" />
                                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Evaluación:
                                  </span>
                                </div>
                                {renderRatingOptions(sub.idSubCriterio, puntajes[sub.idSubCriterio])}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Separator className="my-8" />

            {/* Comentarios Section */}
            <Card className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">Comentarios Adicionales</CardTitle>
                </div>
                <CardDescription>
                  Comparte observaciones adicionales sobre el desempeño del docente (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Escribe tus comentarios y observaciones aquí..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={5}
                  disabled={estadoEvaluacion === 'Completada' || estadoEvaluacion === 'Cancelada'}
                  className="min-h-[120px] resize-none bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600"
                />
              </CardContent>
            </Card>

            {/* Resultados finales mejorados */}
            <Card className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800 border-2 border-slate-200 dark:border-slate-700 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-200 dark:from-slate-800 dark:to-gray-700 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      Resultados de la Evaluación
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Puntaje Principal */}
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className={`text-6xl font-bold ${getScoreColor(puntaje20)} mb-2`}>
                        {puntaje20.toFixed(1)}
                      </div>
                      <div className="text-2xl text-gray-600 dark:text-gray-400 font-medium">
                        / 20
                      </div>
                      <div className="absolute -top-2 -right-2">
                        {React.createElement(getScoreIcon(puntaje20), {
                          className: `h-8 w-8 ${getScoreColor(puntaje20)}`
                        })}
                      </div>
                    </div>
                    
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold ${
                      puntaje20 >= 16 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                        : puntaje20 >= 12 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : puntaje20 >= 8
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {React.createElement(getScoreIcon(puntaje20), { className: "h-5 w-5" })}
                      {getScoreMessage(puntaje20).title}
                    </div>
                  </div>

                  {/* Estadísticas adicionales */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {Math.round(getProgress())}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Completado
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {totalSubcriterios}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Criterios
                        </div>
                      </div>
                    </div>

                    {/* Progreso visual mejorado */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span>Progreso general</span>
                        <span>{Object.keys(puntajes).length}/{totalSubcriterios}</span>
                      </div>
                      <Progress 
                        value={getProgress()} 
                        className="h-3 bg-gray-200 dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Criterios bajos mejorados */}
                {criteriosBajos.length > 0 && (
                  <Alert variant="default" className="mt-8 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-800 dark:text-amber-200 font-bold">
                      Oportunidades de Mejora
                    </AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-300">
                      <p className="mb-3">Los siguientes criterios muestran áreas donde se puede mejorar:</p>
                      <div className="grid gap-2">
                        {criteriosBajos.map(c => (
                          <div key={c.nombre} className="flex items-center justify-between p-3 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg">
                            <span className="font-medium">{c.nombre}</span>
                            <Badge variant="outline" className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                              {Math.round(c.promedio * 100) / 100}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Botones de acción mejorados */}
            {estadoEvaluacion === 'Pendiente' || estadoEvaluacion === 'Activo' ? (
              <div className="flex gap-4 justify-end pt-6">
                <Button 
                  type="button" 
                  onClick={handleCancelar} 
                  disabled={enviando || loading} 
                  variant="outline"
                  size="lg"
                  className="px-8 bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  onClick={handleEnviar} 
                  disabled={enviando || loading} 
                  size="lg"
                  className="px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Evaluación
                    </>
                  )}
                </Button>
              </div>
            ) : null}

            {/* Estados finales */}
            {estadoEvaluacion === 'Completada' && (
              <Alert variant="default" className="mt-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200">
                  ¡Evaluación Completada!
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Tu evaluación ha sido finalizada exitosamente. Ya no puedes realizar cambios.
                </AlertDescription>
              </Alert>
            )}
            {estadoEvaluacion === 'Cancelada' && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Evaluación Cancelada</AlertTitle>
                <AlertDescription>
                  La evaluación fue cancelada por pasar la fecha/hora límite.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
