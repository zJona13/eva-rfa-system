
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Traducciones básicas
const translations = {
  es: {
    // Common
    'common.loading': 'Cargando...',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.date': 'Fecha',
    'common.comments': 'Comentarios',
    'common.status': 'Estado',
    'common.score': 'Puntaje',
    'common.total': 'Total',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.close': 'Cerrar',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.selfEvaluation': 'Autoevaluación',
    'nav.studentEvaluation': 'Evaluación Estudiante',
    'nav.checklistEvaluation': 'Supervisión',
    'nav.incidents': 'Incidencias',
    'nav.reports': 'Reportes',
    'nav.roles': 'Mantenimientos',
    'nav.validation': 'Validación',
    
    // Header
    'header.systemTitle': 'Sistema de Evaluación para Desempeño del Personal - IES',
    'header.changeTheme': 'Cambiar tema',
    'header.logout': 'Salir',
    
    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Registrarse',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar contraseña',
    'auth.forgotPassword': '¿Olvidó su contraseña?',
    'auth.loginSubtitle': 'Ingrese sus credenciales para acceder al sistema',
    'auth.institutionalEmail': 'Correo electrónico institucional',
    'auth.fullName': 'Nombre completo',
    'auth.createAccount': 'Crear una cuenta',
    'auth.alreadyHaveAccount': '¿Ya tiene una cuenta?',
    'auth.dontHaveAccount': '¿No tiene una cuenta?',
    'auth.loggingIn': 'Iniciando sesión...',
    'auth.registering': 'Registrando...',
    'auth.sessionClosed': 'Sesión cerrada exitosamente',
    
    // Dashboard
    'dashboard.goodMorning': 'Buenos días',
    'dashboard.goodAfternoon': 'Buenas tardes',
    'dashboard.goodEvening': 'Buenas noches',
    'dashboard.welcome': 'Bienvenido al Sistema de Evaluación para Desempeño del Personal IES RFA.',
    'dashboard.totalEvaluations': 'Total de evaluaciones',
    'dashboard.pendingEvaluations': 'Evaluaciones pendientes',
    'dashboard.pendingValidations': 'Validaciones pendientes',
    'dashboard.generalAverage': 'Promedio general',
    'dashboard.receivedEvaluations': 'Evaluaciones recibidas',
    'dashboard.approvedEvaluations': 'Evaluaciones aprobadas',
    'dashboard.averageScore': 'Promedio de calificación',
    'dashboard.registeredIncidents': 'Incidencias registradas',
    'dashboard.personalIncidents': 'Incidencias personales',
    'dashboard.activeIncidents': 'Incidencias activas',
    'dashboard.totalResults': 'Total de resultados',
    
    // Self Evaluation
    'selfEval.title': 'Autoevaluación del Personal',
    'selfEval.subtitle': 'Consulta tus autoevaluaciones anteriores y tu progreso profesional.',
    'selfEval.formTitle': 'Autoevaluación Docente',
    'selfEval.formSubtitle': 'Reflexiona sobre tu desempeño y marca la opción que mejor describa tu práctica',
    'selfEval.history': 'Historial de Autoevaluaciones',
    'selfEval.historyDescription': 'Consulta tus autoevaluaciones anteriores y tu progreso. Nota aprobatoria: ≥ 11/20',
    'selfEval.noEvaluations': 'No has realizado autoevaluaciones aún.',
    'selfEval.firstEvaluation': 'Realizar Primera Autoevaluación',
    'selfEval.newEvaluation': 'Nueva Autoevaluación',
    'selfEval.evaluationInfo': 'Información de la Autoevaluación',
    'selfEval.teacher': 'Docente',
    'selfEval.totalScore': 'Puntaje Total Obtenido',
    'selfEval.additionalComments': 'Comentarios Adicionales',
    'selfEval.reflections': 'Escriba sus reflexiones y áreas de mejora...',
    'selfEval.saveEvaluation': 'Guardar Autoevaluación',
    'selfEval.saving': 'Guardando...',
    'selfEval.created': 'Autoevaluación creada exitosamente',
    'selfEval.createError': 'Error al crear autoevaluación',
    'selfEval.rateAll': 'Debe calificar todos los subcriterios',
    'selfEval.noColaborador': 'No se pudo obtener información del colaborador',
    
    // Evaluation Scale
    'scale.title': 'Escala de Valoración',
    'scale.full': 'Logrado Totalmente / Siempre',
    'scale.partial': 'Logrado Parcialmente / A Veces',
    'scale.none': 'No Logrado / Nunca',
    'scale.points1': '1 punto:',
    'scale.points05': '0.5 puntos:',
    'scale.points0': '0 puntos:',
    
    // Evaluation Status
    'evaluation.approved': 'Aprobado',
    'evaluation.failed': 'Desaprobado',
    'evaluation.completed': 'Completada',
    'evaluation.pending': 'Pendiente',
    'evaluation.evaluator': 'Evaluador',
    'evaluation.evaluated': 'Evaluado',
    'evaluation.generateIncident': 'Generar Incidencia',
    
    // Student Evaluation
    'studentEval.title': 'Evaluación del Estudiante al Docente',
    'studentEval.subtitle': 'Consulta las evaluaciones que has realizado a los docentes.',
    'studentEval.history': 'Mis Evaluaciones a Docentes',
    'studentEval.historyDescription': 'Historial de evaluaciones que has realizado a docentes. Nota aprobatoria: ≥ 11/20',
    'studentEval.noEvaluations': 'No has evaluado a ningún docente aún.',
    'studentEval.firstEvaluation': 'Evaluar Primer Docente',
    'studentEval.newEvaluation': 'Nueva Evaluación',
    'studentEval.teacherEvaluated': 'Docente evaluado',
    
    // Checklist Evaluation
    'checklistEval.title': 'Supervisión Docente',
    'checklistEval.subtitle': 'Consulta las evaluaciones de supervisión que has realizado utilizando criterios predefinidos.',
    'checklistEval.history': 'Mis Evaluaciones de Supervisión',
    'checklistEval.historyDescription': 'Historial de evaluaciones de supervisión que has realizado. Nota aprobatoria: ≥ 11/20',
    'checklistEval.noEvaluations': 'No has realizado evaluaciones de supervisión aún.',
    'checklistEval.firstEvaluation': 'Realizar Primera Supervisión',
    'checklistEval.newEvaluation': 'Nueva Supervisión',
    
    // Language
    'language.spanish': 'Español',
    'language.english': 'English',
    'language.change': 'Cambiar idioma',
  },
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.date': 'Date',
    'common.comments': 'Comments',
    'common.status': 'Status',
    'common.score': 'Score',
    'common.total': 'Total',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.selfEvaluation': 'Self Evaluation',
    'nav.studentEvaluation': 'Student Evaluation',
    'nav.checklistEvaluation': 'Supervision',
    'nav.incidents': 'Incidents',
    'nav.reports': 'Reports',
    'nav.roles': 'Maintenance',
    'nav.validation': 'Validation',
    
    // Header
    'header.systemTitle': 'Staff Performance Evaluation System - IES',
    'header.changeTheme': 'Change theme',
    'header.logout': 'Logout',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm password',
    'auth.forgotPassword': 'Forgot your password?',
    'auth.loginSubtitle': 'Enter your credentials to access the system',
    'auth.institutionalEmail': 'Institutional email',
    'auth.fullName': 'Full name',
    'auth.createAccount': 'Create an account',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.loggingIn': 'Logging in...',
    'auth.registering': 'Registering...',
    'auth.sessionClosed': 'Session closed successfully',
    
    // Dashboard
    'dashboard.goodMorning': 'Good morning',
    'dashboard.goodAfternoon': 'Good afternoon',
    'dashboard.goodEvening': 'Good evening',
    'dashboard.welcome': 'Welcome to the IES RFA Staff Performance Evaluation System.',
    'dashboard.totalEvaluations': 'Total evaluations',
    'dashboard.pendingEvaluations': 'Pending evaluations',
    'dashboard.pendingValidations': 'Pending validations',
    'dashboard.generalAverage': 'General average',
    'dashboard.receivedEvaluations': 'Received evaluations',
    'dashboard.approvedEvaluations': 'Approved evaluations',
    'dashboard.averageScore': 'Average score',
    'dashboard.registeredIncidents': 'Registered incidents',
    'dashboard.personalIncidents': 'Personal incidents',
    'dashboard.activeIncidents': 'Active incidents',
    'dashboard.totalResults': 'Total results',
    
    // Self Evaluation
    'selfEval.title': 'Staff Self Evaluation',
    'selfEval.subtitle': 'Review your previous self-evaluations and professional progress.',
    'selfEval.formTitle': 'Teacher Self Evaluation',
    'selfEval.formSubtitle': 'Reflect on your performance and mark the option that best describes your practice',
    'selfEval.history': 'Self Evaluation History',
    'selfEval.historyDescription': 'Review your previous self-evaluations and progress. Passing grade: ≥ 11/20',
    'selfEval.noEvaluations': 'You have not completed any self-evaluations yet.',
    'selfEval.firstEvaluation': 'Complete First Self Evaluation',
    'selfEval.newEvaluation': 'New Self Evaluation',
    'selfEval.evaluationInfo': 'Self Evaluation Information',
    'selfEval.teacher': 'Teacher',
    'selfEval.totalScore': 'Total Score Obtained',
    'selfEval.additionalComments': 'Additional Comments',
    'selfEval.reflections': 'Write your reflections and areas for improvement...',
    'selfEval.saveEvaluation': 'Save Self Evaluation',
    'selfEval.saving': 'Saving...',
    'selfEval.created': 'Self evaluation created successfully',
    'selfEval.createError': 'Error creating self evaluation',
    'selfEval.rateAll': 'You must rate all subcriteria',
    'selfEval.noColaborador': 'Could not get collaborator information',
    
    // Evaluation Scale
    'scale.title': 'Rating Scale',
    'scale.full': 'Fully Achieved / Always',
    'scale.partial': 'Partially Achieved / Sometimes',
    'scale.none': 'Not Achieved / Never',
    'scale.points1': '1 point:',
    'scale.points05': '0.5 points:',
    'scale.points0': '0 points:',
    
    // Evaluation Status
    'evaluation.approved': 'Approved',
    'evaluation.failed': 'Failed',
    'evaluation.completed': 'Completed',
    'evaluation.pending': 'Pending',
    'evaluation.evaluator': 'Evaluator',
    'evaluation.evaluated': 'Evaluated',
    'evaluation.generateIncident': 'Generate Incident',
    
    // Student Evaluation
    'studentEval.title': 'Student to Teacher Evaluation',
    'studentEval.subtitle': 'Review the evaluations you have completed for teachers.',
    'studentEval.history': 'My Teacher Evaluations',
    'studentEval.historyDescription': 'History of evaluations you have completed for teachers. Passing grade: ≥ 11/20',
    'studentEval.noEvaluations': 'You have not evaluated any teachers yet.',
    'studentEval.firstEvaluation': 'Evaluate First Teacher',
    'studentEval.newEvaluation': 'New Evaluation',
    'studentEval.teacherEvaluated': 'Teacher evaluated',
    
    // Checklist Evaluation
    'checklistEval.title': 'Teacher Supervision',
    'checklistEval.subtitle': 'Review the supervision evaluations you have conducted using predefined criteria.',
    'checklistEval.history': 'My Supervision Evaluations',
    'checklistEval.historyDescription': 'History of supervision evaluations you have conducted. Passing grade: ≥ 11/20',
    'checklistEval.noEvaluations': 'You have not conducted any supervision evaluations yet.',
    'checklistEval.firstEvaluation': 'Conduct First Supervision',
    'checklistEval.newEvaluation': 'New Supervision',
    
    // Language
    'language.spanish': 'Español',
    'language.english': 'English',
    'language.change': 'Change language',
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('iesrfa-language');
    return (saved as Language) || 'es';
  });

  useEffect(() => {
    localStorage.setItem('iesrfa-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
