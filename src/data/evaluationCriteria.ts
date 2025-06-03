// Criterios y subcriterios hardcodeados para las evaluaciones

export interface Subcriterio {
  id: string;
  texto: string;
  puntaje: number;
  criterio: string;
}

export interface CriterioEvaluacion {
  nombre: string;
  descripcion: string;
  puntajeMaximo: number;
}

// Subcriterios para Ficha de Supervisión de Aprendizaje
export const subcriteriosSupervision: Subcriterio[] = [
  // PROGRAMACIÓN (2 puntos)
  {
    id: 'prog_1',
    texto: 'El sílabo de la UD se encuentra actualizado y disponible en la plataforma virtual (ej. Chamilo).',
    puntaje: 1,
    criterio: 'PROGRAMACIÓN'
  },
  {
    id: 'prog_2',
    texto: 'La sesión de aprendizaje desarrollada corresponde a lo programado en el sílabo y presenta su ficha.',
    puntaje: 1,
    criterio: 'PROGRAMACIÓN'
  },
  
  // MATERIALES EDUCATIVOS (3 puntos)
  {
    id: 'mat_1',
    texto: 'Los materiales educativos son pertinentes a la sesión de aprendizaje (antes, durante y después).',
    puntaje: 1,
    criterio: 'MATERIALES EDUCATIVOS'
  },
  {
    id: 'mat_2',
    texto: 'Los materiales educativos son visibles, claros y están organizados en la plataforma.',
    puntaje: 1,
    criterio: 'MATERIALES EDUCATIVOS'
  },
  {
    id: 'mat_3',
    texto: 'Los materiales para actividades posteriores (guías, instrucciones) son adecuados y promueven el aprendizaje.',
    puntaje: 1,
    criterio: 'MATERIALES EDUCATIVOS'
  },
  
  // DESARROLLO (10 puntos)
  {
    id: 'des_1',
    texto: 'Inicia la sesión de aprendizaje con puntualidad y saluda a los alumnos.',
    puntaje: 1,
    criterio: 'DESARROLLO'
  },
  {
    id: 'des_2',
    texto: 'Registra la asistencia de los estudiantes (según modalidad) en la plataforma o medio establecido.',
    puntaje: 1,
    criterio: 'DESARROLLO'
  },
  {
    id: 'des_3',
    texto: 'Establece/recuerda orientaciones (netiquetas, normas de convivencia) para la participación.',
    puntaje: 1,
    criterio: 'DESARROLLO'
  },
  {
    id: 'des_4',
    texto: 'Realiza una actividad de motivación eficaz para generar la atención de los estudiantes.',
    puntaje: 1,
    criterio: 'DESARROLLO'
  },
  {
    id: 'des_5',
    texto: 'Declara el tema a desarrollar y el logro de aprendizaje esperado para la sesión.',
    puntaje: 1,
    criterio: 'DESARROLLO'
  },
  {
    id: 'des_6',
    texto: 'Desarrolla el contenido utilizando metodologías activas y participativas.',
    puntaje: 1,
    criterio: 'DESARROLLO'
  },
  {
    id: 'des_7',
    texto: 'Prioriza el trabajo colaborativo durante la sesión.',
    puntaje: 1,
    criterio: 'DESARROLLO'
  },
  {
    id: 'des_8',
    texto: 'Emplea una voz clara, modulada y un lenguaje técnico apropiado.',
    puntaje: 1,
    criterio: 'DESARROLLO'
  },
  {
    id: 'des_9',
    texto: 'Responde a las preguntas e inquietudes de los estudiantes de manera efectiva.',
    puntaje: 1,
    criterio: 'DESARROLLO'
  },
  {
    id: 'des_10',
    texto: 'Fomenta el desarrollo de valores, actitudes positivas y la construcción de aprendizajes propios.',
    puntaje: 1,
    criterio: 'DESARROLLO'
  },
  
  // EVALUACIÓN (5 puntos)
  {
    id: 'eval_1',
    texto: 'La evaluación aplicada responde a los indicadores de logro de la sesión.',
    puntaje: 1,
    criterio: 'EVALUACIÓN'
  },
  {
    id: 'eval_2',
    texto: 'Utiliza instrumentos de evaluación variados y adecuados al objeto de evaluación.',
    puntaje: 1,
    criterio: 'EVALUACIÓN'
  },
  {
    id: 'eval_3',
    texto: 'Los criterios de evaluación son claros y comunicados previamente a los estudiantes.',
    puntaje: 1,
    criterio: 'EVALUACIÓN'
  },
  {
    id: 'eval_4',
    texto: 'Realiza la retroalimentación del proceso de aprendizaje de forma individual y/o grupal.',
    puntaje: 1,
    criterio: 'EVALUACIÓN'
  },
  {
    id: 'eval_5',
    texto: 'Comunica los resultados de la evaluación de manera oportuna y comprensible.',
    puntaje: 1,
    criterio: 'EVALUACIÓN'
  }
];

// Subcriterios para Autoevaluación Docente
export const subcriteriosAutoevaluacion: Subcriterio[] = [
  // I. PLANIFICACIÓN Y PROGRAMACIÓN (2 puntos)
  {
    id: 'plan_1',
    texto: 'Mantengo el sílabo actualizado y fácilmente accesible para los estudiantes.',
    puntaje: 1,
    criterio: 'I. PLANIFICACIÓN Y PROGRAMACIÓN'
  },
  {
    id: 'plan_2',
    texto: 'Mis sesiones de aprendizaje se desarrollan conforme a lo planificado en el sílabo y cuento con la ficha de sesión.',
    puntaje: 1,
    criterio: 'I. PLANIFICACIÓN Y PROGRAMACIÓN'
  },
  
  // II. MATERIALES EDUCATIVOS (3 puntos)
  {
    id: 'mat_auto_1',
    texto: 'Selecciono y diseño materiales educativos pertinentes para los diferentes momentos de la sesión.',
    puntaje: 1,
    criterio: 'II. MATERIALES EDUCATIVOS'
  },
  {
    id: 'mat_auto_2',
    texto: 'Aseguro que los materiales sean claros, visualmente adecuados y estén bien organizados en la plataforma.',
    puntaje: 1,
    criterio: 'II. MATERIALES EDUCATIVOS'
  },
  {
    id: 'mat_auto_3',
    texto: 'Los materiales para actividades asincrónicas (guías, rúbricas) están bien estructurados y fomentan la autonomía.',
    puntaje: 1,
    criterio: 'II. MATERIALES EDUCATIVOS'
  },
  
  // III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA (10 puntos)
  {
    id: 'des_auto_1',
    texto: 'Inicio mis clases puntualmente y establezco un ambiente cordial.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA'
  },
  {
    id: 'des_auto_2',
    texto: 'Verifico la asistencia y las condiciones para la participación (normas, netiquetas).',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA'
  },
  {
    id: 'des_auto_3',
    texto: 'Capto el interés de los estudiantes mediante estrategias de motivación efectivas.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA'
  },
  {
    id: 'des_auto_4',
    texto: 'Comunico con claridad el tema y los objetivos de aprendizaje de la sesión.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA'
  },
  {
    id: 'des_auto_5',
    texto: 'Aplico metodologías activas que involucran al estudiante en su proceso de aprendizaje.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA'
  },
  {
    id: 'des_auto_6',
    texto: 'Promuevo el trabajo colaborativo y la interacción entre estudiantes.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA'
  },
  {
    id: 'des_auto_7',
    texto: 'Mi expresión oral es clara, con volumen y modulación adecuados, utilizando un lenguaje preciso.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA'
  },
  {
    id: 'des_auto_8',
    texto: 'Atiendo y resuelvo las dudas de los estudiantes de forma paciente y clara.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA'
  },
  {
    id: 'des_auto_9',
    texto: 'Fomento la reflexión, el pensamiento crítico y la construcción autónoma del conocimiento.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA'
  },
  {
    id: 'des_auto_10',
    texto: 'Integro el desarrollo de valores y actitudes positivas en mis sesiones.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA'
  },
  
  // IV. EVALUACIÓN Y RETROALIMENTACIÓN (5 puntos)
  {
    id: 'eval_auto_1',
    texto: 'Diseño evaluaciones coherentes con los indicadores de logro propuestos.',
    puntaje: 1,
    criterio: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN'
  },
  {
    id: 'eval_auto_2',
    texto: 'Utilizo diversidad de instrumentos y técnicas de evaluación apropiados.',
    puntaje: 1,
    criterio: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN'
  },
  {
    id: 'eval_auto_3',
    texto: 'Doy a conocer los criterios de evaluación de forma anticipada y clara.',
    puntaje: 1,
    criterio: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN'
  },
  {
    id: 'eval_auto_4',
    texto: 'Ofrezco retroalimentación continua, específica y constructiva a los estudiantes.',
    puntaje: 1,
    criterio: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN'
  },
  {
    id: 'eval_auto_5',
    texto: 'Comunico los resultados de las evaluaciones en los plazos establecidos y de forma que faciliten la comprensión.',
    puntaje: 1,
    criterio: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN'
  }
];

// Subcriterios para Evaluación del Docente por el Estudiante
export const subcriteriosEstudiante: Subcriterio[] = [
  // I. ORGANIZACIÓN DE LA ASIGNATURA (2 puntos)
  {
    id: 'org_1',
    texto: 'El profesor/a deja claro desde el inicio cómo se desarrollará la asignatura (sílado, cronograma).',
    puntaje: 1,
    criterio: 'I. ORGANIZACIÓN DE LA ASIGNATURA'
  },
  {
    id: 'org_2',
    texto: 'Las clases siguen una estructura y planificación comprensible.',
    puntaje: 1,
    criterio: 'I. ORGANIZACIÓN DE LA ASIGNATURA'
  },
  
  // II. MATERIALES EDUCATIVOS (3 puntos)
  {
    id: 'mat_est_1',
    texto: 'Los materiales que usa el/la profesor/a (presentaciones, lecturas, etc.) me ayudan a entender los temas.',
    puntaje: 1,
    criterio: 'II. MATERIALES EDUCATIVOS'
  },
  {
    id: 'mat_est_2',
    texto: 'Los materiales son claros y están bien organizados en la plataforma del curso.',
    puntaje: 1,
    criterio: 'II. MATERIALES EDUCATIVOS'
  },
  {
    id: 'mat_est_3',
    texto: 'El profesor/a proporciona guías o instrucciones claras para las tareas o trabajos fuera de clase.',
    puntaje: 1,
    criterio: 'II. MATERIALES EDUCATIVOS'
  },
  
  // III. DESARROLLO DE LAS CLASES Y ENSEÑANZA (10 puntos)
  {
    id: 'des_est_1',
    texto: 'El/La profesor/a es puntual y aprovecha bien el tiempo de la clase.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA'
  },
  {
    id: 'des_est_2',
    texto: 'El/La profesor/a explica los temas de forma que los entiendo.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA'
  },
  {
    id: 'des_est_3',
    texto: 'El/La profesor/a utiliza ejemplos o actividades que facilitan mi aprendizaje.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA'
  },
  {
    id: 'des_est_4',
    texto: 'El/La profesor/a fomenta mi participación en clase.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA'
  },
  {
    id: 'des_est_5',
    texto: 'Se promueve el trabajo en equipo y la colaboración entre compañeros.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA'
  },
  {
    id: 'des_est_6',
    texto: 'El/La profesor/a se expresa con claridad (voz, lenguaje).',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA'
  },
  {
    id: 'des_est_7',
    texto: 'El/La profesor/a responde mis preguntas de manera clara y respetuosa.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA'
  },
  {
    id: 'des_est_8',
    texto: 'El/La profesor/a muestra entusiasmo por los temas que enseña.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA'
  },
  {
    id: 'des_est_9',
    texto: 'Siento un ambiente de respeto y confianza en sus clases.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA'
  },
  {
    id: 'des_est_10',
    texto: 'El/La profesor/a me anima a pensar por mí mismo/a y a ser crítico/a.',
    puntaje: 1,
    criterio: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA'
  },
  
  // IV. EVALUACIÓN Y RETROALIMENTACIÓN (5 puntos)
  {
    id: 'eval_est_1',
    texto: 'Las evaluaciones (exámenes, trabajos) se relacionan con lo que se enseña en clase.',
    puntaje: 1,
    criterio: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN'
  },
  {
    id: 'eval_est_2',
    texto: 'El/La profesor/a explica claramente cómo seremos evaluados.',
    puntaje: 1,
    criterio: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN'
  },
  {
    id: 'eval_est_3',
    texto: 'Considero que la forma de evaluar del profesor/a es justa.',
    puntaje: 1,
    criterio: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN'
  },
  {
    id: 'eval_est_4',
    texto: 'El/La profesor/a me da comentarios útiles (retroalimentación) sobre mis trabajos o mi desempeño.',
    puntaje: 1,
    criterio: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN'
  },
  {
    id: 'eval_est_5',
    texto: 'El/La profesor/a entrega los resultados de las evaluaciones en un tiempo razonable.',
    puntaje: 1,
    criterio: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN'
  }
];

// Add the missing export for criteriosEvaluacion
export const criteriosEvaluacion: Record<string, CriterioEvaluacion[]> = {
  'Autoevaluacion': [
    { nombre: 'Planificación', descripcion: 'Organización y planificación del curso', puntajeMaximo: 5 },
    { nombre: 'Metodología', descripcion: 'Aplicación de metodologías de enseñanza', puntajeMaximo: 10 },
    { nombre: 'Evaluación', descripcion: 'Procesos de evaluación y retroalimentación', puntajeMaximo: 5 }
  ],
  'Evaluador-Evaluado': [
    { nombre: 'Desempeño Docente', descripcion: 'Calidad del desempeño en el aula', puntajeMaximo: 10 },
    { nombre: 'Metodología', descripcion: 'Uso de metodologías apropiadas', puntajeMaximo: 5 },
    { nombre: 'Evaluación', descripcion: 'Efectividad de la evaluación', puntajeMaximo: 5 }
  ],
  'Estudiante-Docente': [
    { nombre: 'Organización', descripcion: 'Organización del curso y materiales', puntajeMaximo: 5 },
    { nombre: 'Enseñanza', descripcion: 'Calidad de la enseñanza', puntajeMaximo: 10 },
    { nombre: 'Evaluación', descripcion: 'Justicia y claridad en la evaluación', puntajeMaximo: 5 }
  ]
};

export const getCriteriosAgrupados = (subcriterios: Subcriterio[]) => {
  return subcriterios.reduce((acc, subcriterio) => {
    if (!acc[subcriterio.criterio]) {
      acc[subcriterio.criterio] = [];
    }
    acc[subcriterio.criterio].push(subcriterio);
    return acc;
  }, {} as Record<string, Subcriterio[]>);
};
