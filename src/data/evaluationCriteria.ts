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

export { criteriosEvaluacion };
