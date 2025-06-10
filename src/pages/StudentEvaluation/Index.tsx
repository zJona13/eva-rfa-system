import { useEffect, useState } from 'react';
import { getCriteriosPorTipoEvaluacion, crearEvaluacion } from '../../services/evaluacionApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Users, BookOpen, MessageSquare, Send, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentEvaluationPage() {
  const [criterios, setCriterios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [puntajes, setPuntajes] = useState({});
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [evaluacionInfo, setEvaluacionInfo] = useState({
    nombreDocente: '',
    area: '',
    fecha: new Date().toLocaleDateString(),
    periodo: '',
    nombreEstudiante: '',
    idAsignacion: '',
    idEvaluador: '',
    idEvaluado: ''
  });

  // Lista de periodos académicos
  const periodosAcademicos = [
    { value: '2024-1', label: '2024 - I' },
    { value: '2024-2', label: '2024 - II' },
    { value: '2025-1', label: '2025 - I' },
    { value: '2025-2', label: '2025 - II' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        // Obtener criterios de evaluación
        const criteriosData = await getCriteriosPorTipoEvaluacion(1);
        setCriterios(criteriosData.criterios);

        // Obtener información del estudiante actual
        const response = await fetch('http://localhost:3309/api/users/current');
        if (!response.ok) {
          throw new Error('Error al obtener información del usuario');
        }
        const userData = await response.json();
        
        // Validar datos requeridos
        if (!userData.teacherName || !userData.areaName) {
          throw new Error('No se pudo obtener la información completa del docente');
        }

        // Actualizar información de la evaluación
        setEvaluacionInfo({
          nombreDocente: userData.teacherName,
          area: userData.areaName,
          fecha: new Date().toLocaleDateString(),
          periodo: userData.currentPeriod || periodosAcademicos[0].value,
          nombreEstudiante: userData.studentName || userData.name,
          idAsignacion: userData.assignmentId || '',
          idEvaluador: userData.studentId || '',
          idEvaluado: userData.teacherId || ''
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePuntaje = (idSubCriterio, valor) => {
    setPuntajes(prev => ({ ...prev, [idSubCriterio]: valor }));
  };

  const handlePeriodoChange = (value) => {
    setEvaluacionInfo(prev => ({ ...prev, periodo: value }));
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
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`${idSubCriterio}-${option.value}`} />
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    
    try {
      // Validar que todos los criterios estén calificados
      const totalSubcriterios = criterios.reduce((total, criterio) => total + criterio.subcriterios.length, 0);
      if (Object.keys(puntajes).length !== totalSubcriterios) {
        throw new Error('Debe calificar todos los criterios antes de enviar la evaluación');
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
      const evaluacionData = {
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        score,
        comments: comentario,
        status: 'Activo',
        idAsignacion: Number(evaluacionInfo.idAsignacion),
        idEvaluador: Number(evaluacionInfo.idEvaluador),
        idEvaluado: Number(evaluacionInfo.idEvaluado),
        idTipoEvaluacion: 1,
        periodo: evaluacionInfo.periodo,
        detalles
      };
      
      const res = await crearEvaluacion(evaluacionData);
      alert('Evaluación enviada exitosamente');
      setPuntajes({});
      setComentario('');
    } catch (e) {
      setError(e.message || 'Error al enviar evaluación');
    } finally {
      setEnviando(false);
    }
  };

  const getProgress = () => {
    const totalSubcriterios = criterios.reduce((total, criterio) => total + criterio.subcriterios.length, 0);
    const completedSubcriterios = Object.keys(puntajes).length;
    return totalSubcriterios > 0 ? (completedSubcriterios / totalSubcriterios) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Cargando información de la evaluación...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header Card */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
                Evaluación Estudiante al Docente
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Evalúa el desempeño y metodología de tu docente
              </CardDescription>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-blue-700 dark:text-blue-300 mb-2">
              <span>Progreso de evaluación</span>
              <span>{Math.round(getProgress())}% completado</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form Card */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de la Evaluación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre del Docente
                </label>
                <Input
                  value={evaluacionInfo.nombreDocente}
                  disabled
                  className="bg-white dark:bg-gray-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Área
                </label>
                <Input
                  value={evaluacionInfo.area}
                  disabled
                  className="bg-white dark:bg-gray-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha
                </label>
                <Input
                  value={evaluacionInfo.fecha}
                  disabled
                  className="bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Periodo
                </label>
                <Select
                  value={evaluacionInfo.periodo}
                  onValueChange={handlePeriodoChange}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700">
                    <SelectValue placeholder="Seleccionar periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodosAcademicos.map((periodo) => (
                      <SelectItem key={periodo.value} value={periodo.value}>
                        {periodo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre del Estudiante
                </label>
                <Input
                  value={evaluacionInfo.nombreEstudiante}
                  disabled
                  className="bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Criterios Section */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                    Cargando criterios...
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {criterios.map((criterio, index) => (
                  <Card key={criterio.idCriterio} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          Criterio {index + 1}
                        </Badge>
                        <BookOpen className="h-5 w-5 text-blue-500" />
                      </div>
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                        {criterio.nombre}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {criterio.subcriterios.map((sub, subIndex) => (
                          <div key={sub.idSubCriterio} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex flex-col space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                    {sub.nombre}
                                  </h4>
                                  {sub.descripcion && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {sub.descripcion}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="outline" className="ml-4">
                                  {subIndex + 1}
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Calificación:
                                </span>
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

            <Separator />

            {/* Comentarios Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Comentario general (opcional)
                </label>
              </div>
              <Textarea
                placeholder="Comparte tus comentarios adicionales sobre la evaluación..."
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={enviando || loading}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium"
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
