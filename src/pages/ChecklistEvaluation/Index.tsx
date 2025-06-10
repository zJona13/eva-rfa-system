
import { useEffect, useState } from 'react';
import { getCriteriosPorTipoEvaluacion, crearEvaluacion } from '../../services/evaluacionApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, ClipboardCheck, CheckSquare, MessageSquare, Send, Loader2 } from 'lucide-react';

export default function ChecklistEvaluationPage() {
  const [criterios, setCriterios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [puntajes, setPuntajes] = useState({});
  const [comentario, setComentario] = useState('');
  const [idAsignacion, setIdAsignacion] = useState('');
  const [idEvaluador, setIdEvaluador] = useState('');
  const [idEvaluado, setIdEvaluado] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    // 2 = Evaluación Evaluador al Docente
    getCriteriosPorTipoEvaluacion(2).then(data => {
      setCriterios(data.criterios);
      setLoading(false);
    });
  }, []);

  const handlePuntaje = (idSubCriterio, valor) => {
    setPuntajes(prev => ({ ...prev, [idSubCriterio]: valor }));
  };

  const renderStarRating = (idSubCriterio, currentValue) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handlePuntaje(idSubCriterio, star)}
            className={`p-1 rounded-full transition-all duration-200 hover:scale-110 ${
              star <= (currentValue || 0) 
                ? 'text-green-500 hover:text-green-600' 
                : 'text-gray-300 hover:text-green-400'
            }`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {currentValue || 0}/5
        </span>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    
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
      idAsignacion: Number(idAsignacion),
      idEvaluador: Number(idEvaluador),
      idEvaluado: Number(idEvaluado),
      idTipoEvaluacion: 2,
      detalles
    };
    
    try {
      const res = await crearEvaluacion(evaluacionData);
      alert('Evaluación checklist enviada: ' + res.evaluacionId);
      setPuntajes({});
      setComentario('');
    } catch (e) {
      alert('Error al enviar evaluación checklist');
    } finally {
      setEnviando(false);
    }
  };

  const getProgress = () => {
    const totalSubcriterios = criterios.reduce((total, criterio) => total + criterio.subcriterios.length, 0);
    const completedSubcriterios = Object.keys(puntajes).length;
    return totalSubcriterios > 0 ? (completedSubcriterios / totalSubcriterios) * 100 : 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-xl">
              <ClipboardCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-green-900 dark:text-green-100">
                Evaluación Evaluador al Docente
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Evaluación sistemática del desempeño docente mediante checklist
              </CardDescription>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-green-700 dark:text-green-300 mb-2">
              <span>Progreso de evaluación</span>
              <span>{Math.round(getProgress())}% completado</span>
            </div>
            <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
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
            {/* IDs Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ID Asignación
                </label>
                <Input
                  type="number"
                  placeholder="123"
                  value={idAsignacion}
                  onChange={e => setIdAsignacion(e.target.value)}
                  required
                  className="bg-white dark:bg-gray-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ID Evaluador
                </label>
                <Input
                  type="number"
                  placeholder="456"
                  value={idEvaluador}
                  onChange={e => setIdEvaluador(e.target.value)}
                  required
                  className="bg-white dark:bg-gray-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ID Evaluado
                </label>
                <Input
                  type="number"
                  placeholder="789"
                  value={idEvaluado}
                  onChange={e => setIdEvaluado(e.target.value)}
                  required
                  className="bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Criterios Section */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                  <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                    Cargando criterios...
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {criterios.map((criterio, index) => (
                  <Card key={criterio.idCriterio} className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          Criterio {index + 1}
                        </Badge>
                        <CheckSquare className="h-5 w-5 text-green-500" />
                      </div>
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                        {criterio.nombre}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {criterio.subcriterios.map((sub, subIndex) => (
                          <div key={sub.idSubCriterio} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex flex-col space-y-3">
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
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Calificación:
                                </span>
                                {renderStarRating(sub.idSubCriterio, puntajes[sub.idSubCriterio])}
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
                  Observaciones y recomendaciones (opcional)
                </label>
              </div>
              <Textarea
                placeholder="Agrega observaciones específicas, recomendaciones para mejora o comentarios adicionales..."
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
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-medium"
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
