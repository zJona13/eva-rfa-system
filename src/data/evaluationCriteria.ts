
interface Subcriterio {
  id: string;
  nombre: string;
  descripcion: string;
}

interface CriterioEvaluacion {
  id: string;
  nombre: string;
  descripcion: string;
  subcriterios: Subcriterio[];
}

interface SubcriterioTexto {
  id: string;
  texto: string;
  criterio: string;
}

const criteriosEvaluacion: CriterioEvaluacion[] = [
  {
    id: 'criterio1',
    nombre: 'Conocimiento y Aplicación',
    descripcion: 'Evalúa el dominio del contenido y su aplicación práctica.',
    subcriterios: [
      {
        id: 'subcriterio1_1',
        nombre: 'Dominio del Contenido',
        descripcion: 'Conocimiento profundo y actualizado del tema.'
      },
      {
        id: 'subcriterio1_2',
        nombre: 'Aplicación Práctica',
        descripcion: 'Habilidad para aplicar el conocimiento en situaciones reales.'
      }
    ]
  },
  {
    id: 'criterio2',
    nombre: 'Habilidades de Comunicación',
    descripcion: 'Evalúa la claridad y efectividad en la comunicación de ideas.',
    subcriterios: [
      {
        id: 'subcriterio2_1',
        nombre: 'Claridad Verbal',
        descripcion: 'Capacidad para expresarse de manera clara y comprensible.'
      },
      {
        id: 'subcriterio2_2',
        nombre: 'Comunicación Escrita',
        descripcion: 'Habilidad para redactar documentos claros y concisos.'
      }
    ]
  },
  {
    id: 'criterio3',
    nombre: 'Colaboración y Trabajo en Equipo',
    descripcion: 'Evalúa la capacidad para trabajar eficazmente con otros.',
    subcriterios: [
      {
        id: 'subcriterio3_1',
        nombre: 'Participación Activa',
        descripcion: 'Contribución activa y constructiva en el equipo.'
      },
      {
        id: 'subcriterio3_2',
        nombre: 'Respeto y Empatía',
        descripcion: 'Mostrar respeto y empatía hacia los compañeros.'
      }
    ]
  },
  {
    id: 'criterio4',
    nombre: 'Profesionalismo y Ética',
    descripcion: 'Evalúa la conducta profesional y el cumplimiento de normas éticas.',
    subcriterios: [
      {
        id: 'subcriterio4_1',
        nombre: 'Conducta Profesional',
        descripcion: 'Mantener una actitud profesional en todo momento.'
      },
      {
        id: 'subcriterio4_2',
        nombre: 'Cumplimiento Ético',
        descripcion: 'Adherirse a los principios éticos y normas de la organización.'
      }
    ]
  },
  {
    id: 'criterio5',
    nombre: 'Resolución de Problemas',
    descripcion: 'Evalúa la capacidad para identificar y resolver problemas de manera efectiva.',
    subcriterios: [
      {
        id: 'subcriterio5_1',
        nombre: 'Análisis de Problemas',
        descripcion: 'Habilidad para analizar problemas y identificar causas.'
      },
      {
        id: 'subcriterio5_2',
        nombre: 'Soluciones Creativas',
        descripcion: 'Desarrollar soluciones creativas e innovadoras.'
      }
    ]
  }
];

// Subcriterios específicos para autoevaluación
const subcriteriosAutoevaluacion: SubcriterioTexto[] = [
  { id: 'auto_1', texto: 'Demuestro dominio completo del contenido de mi área', criterio: 'Conocimiento y Aplicación' },
  { id: 'auto_2', texto: 'Aplico eficazmente el conocimiento en situaciones prácticas', criterio: 'Conocimiento y Aplicación' },
  { id: 'auto_3', texto: 'Me comunico de manera clara y efectiva', criterio: 'Habilidades de Comunicación' },
  { id: 'auto_4', texto: 'Redacto documentos de forma clara y concisa', criterio: 'Habilidades de Comunicación' },
  { id: 'auto_5', texto: 'Participo activamente en el trabajo en equipo', criterio: 'Colaboración y Trabajo en Equipo' },
  { id: 'auto_6', texto: 'Muestro respeto y empatía hacia mis compañeros', criterio: 'Colaboración y Trabajo en Equipo' },
  { id: 'auto_7', texto: 'Mantengo una conducta profesional en todo momento', criterio: 'Profesionalismo y Ética' },
  { id: 'auto_8', texto: 'Cumplo con los principios éticos de la organización', criterio: 'Profesionalismo y Ética' },
  { id: 'auto_9', texto: 'Analizo problemas e identifico causas efectivamente', criterio: 'Resolución de Problemas' },
  { id: 'auto_10', texto: 'Desarrollo soluciones creativas e innovadoras', criterio: 'Resolución de Problemas' },
  { id: 'auto_11', texto: 'Actualizo constantemente mis conocimientos', criterio: 'Conocimiento y Aplicación' },
  { id: 'auto_12', texto: 'Adapto mi comunicación según la audiencia', criterio: 'Habilidades de Comunicación' },
  { id: 'auto_13', texto: 'Colaboro efectivamente con diferentes personalidades', criterio: 'Colaboración y Trabajo en Equipo' },
  { id: 'auto_14', texto: 'Actúo con integridad en todas mis decisiones', criterio: 'Profesionalismo y Ética' },
  { id: 'auto_15', texto: 'Busco oportunidades de mejora continua', criterio: 'Resolución de Problemas' },
  { id: 'auto_16', texto: 'Comparto conocimientos con mis colegas', criterio: 'Conocimiento y Aplicación' },
  { id: 'auto_17', texto: 'Escucho activamente a otros', criterio: 'Habilidades de Comunicación' },
  { id: 'auto_18', texto: 'Apoyo el desarrollo de mis compañeros', criterio: 'Colaboración y Trabajo en Equipo' },
  { id: 'auto_19', texto: 'Cumplo mis compromisos y responsabilidades', criterio: 'Profesionalismo y Ética' },
  { id: 'auto_20', texto: 'Aprendo de los errores y los convierto en oportunidades', criterio: 'Resolución de Problemas' }
];

// Subcriterios específicos para supervisión
const subcriteriosSupervision: SubcriterioTexto[] = [
  { id: 'sup_1', texto: 'Planifica las clases de manera estructurada y coherente', criterio: 'Planificación y Organización' },
  { id: 'sup_2', texto: 'Utiliza metodologías pedagógicas apropiadas', criterio: 'Metodología Pedagógica' },
  { id: 'sup_3', texto: 'Mantiene el control del aula de manera efectiva', criterio: 'Gestión del Aula' },
  { id: 'sup_4', texto: 'Se comunica claramente con los estudiantes', criterio: 'Comunicación Efectiva' },
  { id: 'sup_5', texto: 'Utiliza recursos didácticos apropiados', criterio: 'Uso de Recursos' },
  { id: 'sup_6', texto: 'Evalúa el progreso de los estudiantes adecuadamente', criterio: 'Evaluación del Aprendizaje' },
  { id: 'sup_7', texto: 'Adapta la enseñanza a diferentes estilos de aprendizaje', criterio: 'Adaptación Pedagógica' },
  { id: 'sup_8', texto: 'Fomenta la participación activa de los estudiantes', criterio: 'Participación Estudiantil' },
  { id: 'sup_9', texto: 'Maneja conflictos de manera profesional', criterio: 'Gestión de Conflictos' },
  { id: 'sup_10', texto: 'Cumple puntualmente con los horarios establecidos', criterio: 'Puntualidad y Responsabilidad' },
  { id: 'sup_11', texto: 'Proporciona retroalimentación constructiva', criterio: 'Retroalimentación' },
  { id: 'sup_12', texto: 'Mantiene un ambiente de respeto en el aula', criterio: 'Ambiente de Aprendizaje' },
  { id: 'sup_13', texto: 'Integra tecnología educativa cuando es apropiado', criterio: 'Innovación Tecnológica' },
  { id: 'sup_14', texto: 'Colabora efectivamente con colegas', criterio: 'Trabajo Colaborativo' },
  { id: 'sup_15', texto: 'Reflexiona sobre su práctica docente', criterio: 'Desarrollo Profesional' },
  { id: 'sup_16', texto: 'Atiende las necesidades individuales de los estudiantes', criterio: 'Atención Personalizada' },
  { id: 'sup_17', texto: 'Motiva e inspira a los estudiantes', criterio: 'Motivación Estudiantil' },
  { id: 'sup_18', texto: 'Mantiene registros académicos actualizados', criterio: 'Documentación Académica' },
  { id: 'sup_19', texto: 'Busca oportunidades de mejora continua', criterio: 'Mejora Continua' },
  { id: 'sup_20', texto: 'Actúa con ética profesional', criterio: 'Ética Profesional' }
];

// Subcriterios específicos para evaluación de estudiantes
const subcriteriosEstudiante: SubcriterioTexto[] = [
  { id: 'est_1', texto: 'El profesor explica claramente los temas', criterio: 'Claridad en la Enseñanza' },
  { id: 'est_2', texto: 'Las clases están bien organizadas', criterio: 'Organización' },
  { id: 'est_3', texto: 'El profesor resuelve las dudas de manera efectiva', criterio: 'Atención a Estudiantes' },
  { id: 'est_4', texto: 'Utiliza ejemplos que ayudan a entender mejor', criterio: 'Metodología' },
  { id: 'est_5', texto: 'Es puntual y cumple con los horarios', criterio: 'Puntualidad' },
  { id: 'est_6', texto: 'Trata a todos los estudiantes con respeto', criterio: 'Respeto' },
  { id: 'est_7', texto: 'Fomenta la participación en clase', criterio: 'Participación' },
  { id: 'est_8', texto: 'Proporciona retroalimentación útil', criterio: 'Retroalimentación' },
  { id: 'est_9', texto: 'Está disponible para consultas', criterio: 'Disponibilidad' },
  { id: 'est_10', texto: 'Utiliza material didáctico apropiado', criterio: 'Recursos Didácticos' },
  { id: 'est_11', texto: 'Evalúa de manera justa', criterio: 'Evaluación Justa' },
  { id: 'est_12', texto: 'Muestra dominio del tema', criterio: 'Dominio del Contenido' },
  { id: 'est_13', texto: 'Es innovador en sus métodos de enseñanza', criterio: 'Innovación' },
  { id: 'est_14', texto: 'Mantiene un ambiente positivo en clase', criterio: 'Ambiente de Clase' },
  { id: 'est_15', texto: 'Relaciona los temas con situaciones reales', criterio: 'Aplicación Práctica' },
  { id: 'est_16', texto: 'Es paciente con los estudiantes', criterio: 'Paciencia' },
  { id: 'est_17', texto: 'Motiva a los estudiantes a aprender', criterio: 'Motivación' },
  { id: 'est_18', texto: 'Utiliza tecnología de manera efectiva', criterio: 'Uso de Tecnología' },
  { id: 'est_19', texto: 'Adapta su enseñanza a diferentes ritmos de aprendizaje', criterio: 'Adaptabilidad' },
  { id: 'est_20', texto: 'Recomendaría este profesor a otros estudiantes', criterio: 'Recomendación General' }
];

// Función para agrupar subcriterios por criterio
const getCriteriosAgrupados = (subcriterios: SubcriterioTexto[]): Record<string, SubcriterioTexto[]> => {
  return subcriterios.reduce((grupos, subcriterio) => {
    const criterio = subcriterio.criterio;
    if (!grupos[criterio]) {
      grupos[criterio] = [];
    }
    grupos[criterio].push(subcriterio);
    return grupos;
  }, {} as Record<string, SubcriterioTexto[]>);
};

export { 
  criteriosEvaluacion, 
  subcriteriosAutoevaluacion, 
  subcriteriosSupervision, 
  subcriteriosEstudiante, 
  getCriteriosAgrupados 
};
export type { CriterioEvaluacion, Subcriterio, SubcriterioTexto };
