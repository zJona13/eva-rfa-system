
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Star, User, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import useApiWithToken from '@/hooks/useApiWithToken';
import { criteriosEvaluacion } from '@/data/evaluationCriteria';

interface EvaluacionDisponible {
  id: number;
  fechaEvaluacion: string;
  horaEvaluacion: string;
  tipo: string;
  estado: string;
  evaluadoNombre: string;
  evaluadoId: number;
  asignacionId: number;
  fechaInicio: string;
  fechaFin: string;
}

interface EvaluacionFormProps {
  evaluacion: EvaluacionDisponible;
  onCompleted: () => void;
  onCancel: () => void;
}

const EvaluacionForm: React.FC<EvaluacionFormProps> = ({
  evaluacion,
  onCompleted,
  onCancel
}) => {
  const { apiRequest } = useApiWithToken();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comentarios, setComentarios] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [allRated, setAllRated] = useState(false);

  // Inicializar ratings
  useEffect(() => {
    const initialRatings: Record<string, number> = {};
    criteriosEvaluacion.forEach(criterio => {
      criterio.subcriterios.forEach(sub => {
        initialRatings[sub.id] = 0;
      });
    });
    setRatings(initialRatings);
  }, []);

  // Verificar si todos los criterios han sido calificados
  useEffect(() => {
    const totalSubcriterios = criteriosEvaluacion.reduce((acc, criterio) => 
      acc + criterio.subcriterios.length, 0
    );
    const ratedSubcriterios = Object.values(ratings).filter(rating => rating > 0).length;
    setAllRated(ratedSubcriterios === totalSubcriterios);
  }, [ratings]);

  const handleRatingChange = (subcriterioId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [subcriterioId]: rating
    }));
  };

  const calculateTotalScore = () => {
    const totalRatings = Object.values(ratings).reduce((sum, rating) => sum + rating, 0);
    const totalSubcriterios = Object.keys(ratings).length;
    return totalSubcriterios > 0 ? (totalRatings / totalSubcriterios) : 0;
  };

  const handleSubmit = async () => {
    if (!allRated) {
      toast.error('Debes calificar todos los criterios antes de enviar');
      return;
    }

    if (!comentarios.trim()) {
      toast.error('Debes agregar comentarios antes de enviar');
      return;
    }

    setIsSubmitting(true);

    try {
      const evaluacionData = {
        id: evaluacion.id,
        score: calculateTotalScore(),
        comments: comentarios,
        status: 'Completada',
        subcriteriosRatings: ratings
      };

      const response = await apiRequest(`/evaluaciones/completar`, {
        method: 'POST',
        body: evaluacionData
      });

      if (response?.success) {
        toast.success('Evaluación completada exitosamente');
        onCompleted();
      } else {
        toast.error(response?.message || 'Error al completar la evaluación');
      }
    } catch (error) {
      console.error('Error al completar evaluación:', error);
      toast.error('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExit = () => {
    if (allRated && comentarios.trim()) {
      setShowExitWarning(true);
    } else {
      onCancel();
    }
  };

  // Prevenir cierre accidental del navegador
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (allRated || comentarios.trim()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [allRated, comentarios]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{evaluacion.tipo}</CardTitle>
              <p className="text-muted-foreground mt-1">
                Complete esta evaluación para continuar
              </p>
            </div>
            <Badge variant="secondary">
              {evaluacion.estado}
            </Badge>
          </div>
          
          <div className="flex gap-4 text-sm text-gray-600 mt-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{evaluacion.evaluadoNombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(evaluacion.fechaEvaluacion).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{evaluacion.horaEvaluacion}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Criterios de Evaluación */}
          {criteriosEvaluacion.map((criterio) => (
            <div key={criterio.id} className="space-y-4">
              <h3 className="text-lg font-semibold">{criterio.nombre}</h3>
              <p className="text-sm text-gray-600">{criterio.descripcion}</p>
              
              {criterio.subcriterios.map((subcriterio) => (
                <div key={subcriterio.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{subcriterio.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1">{subcriterio.descripcion}</p>
                    </div>
                    <Badge variant={ratings[subcriterio.id] > 0 ? 'default' : 'secondary'}>
                      {ratings[subcriterio.id] > 0 ? `${ratings[subcriterio.id]}/5` : 'Sin calificar'}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(subcriterio.id, star)}
                        className={`p-1 rounded transition-colors ${
                          star <= (ratings[subcriterio.id] || 0)
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Comentarios */}
          <div className="space-y-2">
            <Label htmlFor="comentarios">Comentarios (obligatorio)</Label>
            <Textarea
              id="comentarios"
              placeholder="Proporciona comentarios detallados sobre la evaluación..."
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Resumen de la Evaluación</h4>
            <div className="flex justify-between items-center">
              <span>Puntaje promedio:</span>
              <Badge variant="outline">
                {calculateTotalScore().toFixed(1)}/5.0
              </Badge>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span>Criterios calificados:</span>
              <Badge variant={allRated ? 'default' : 'secondary'}>
                {Object.values(ratings).filter(r => r > 0).length} / {Object.keys(ratings).length}
              </Badge>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleExit}
              disabled={isSubmitting}
            >
              Salir
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!allRated || !comentarios.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Completando...' : 'Completar Evaluación'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advertencia de salida */}
      <AlertDialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ¿Estás seguro de que quieres salir?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Has completado la evaluación pero no la has enviado. Si sales ahora, perderás todo el progreso.
              ¿Estás seguro de que quieres continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowExitWarning(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onCancel}>
              Salir sin guardar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EvaluacionForm;
