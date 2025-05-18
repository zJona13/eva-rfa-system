
import { 
  ClipboardList, 
  UserSquare2, 
  Users, 
  AlertCircle, 
  CheckSquare, 
  ShieldCheck, 
  BarChart4, 
  Home 
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: string[];
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['admin', 'evaluator', 'evaluated', 'student', 'validator'],
  },
  {
    title: 'Autoevaluación',
    href: '/self-evaluation',
    icon: UserSquare2,
    roles: ['admin', 'evaluated'],
  },
  {
    title: 'Evaluación a Docentes',
    href: '/student-evaluation',
    icon: ClipboardList,
    roles: ['admin', 'student'],
  },
  {
    title: 'Incidencias',
    href: '/incidents',
    icon: AlertCircle,
    roles: ['admin', 'evaluator', 'evaluated', 'student', 'validator'],
  },
  {
    title: 'Listas de Cotejo',
    href: '/checklist-evaluation',
    icon: CheckSquare,
    roles: ['admin', 'evaluator'],
  },
  {
    title: 'Roles y Permisos',
    href: '/roles',
    icon: Users,
    roles: ['admin'],
    badge: {
      text: 'Admin',
      variant: 'destructive',
    },
  },
  {
    title: 'Validación',
    href: '/validation',
    icon: ShieldCheck,
    roles: ['admin', 'validator'],
  },
  {
    title: 'Resultados',
    href: '/results',
    icon: BarChart4,
    roles: ['admin', 'evaluator', 'evaluated'],
  },
];

export const modulesData = [
  {
    id: 1,
    title: 'Autoevaluación del Personal',
    description: 'Evaluación individual según criterios del periodo vigente',
    href: '/self-evaluation',
    icon: UserSquare2,
    color: 'bg-ies-blue-100 text-ies-blue-600',
    roles: ['admin', 'evaluated'],
  },
  {
    id: 2,
    title: 'Evaluación de Estudiantes a Docentes',
    description: 'Evaluación anónima de estudiantes a sus docentes',
    href: '/student-evaluation',
    icon: ClipboardList,
    color: 'bg-ies-purple-100 text-ies-purple-600',
    roles: ['admin', 'student'],
  },
  {
    id: 3,
    title: 'Gestión de Incidencias',
    description: 'Registro y seguimiento de incidencias del sistema',
    href: '/incidents',
    icon: AlertCircle,
    color: 'bg-ies-warning-50 text-ies-warning-500',
    roles: ['admin', 'evaluator', 'evaluated', 'student', 'validator'],
  },
  {
    id: 4,
    title: 'Calificación con Lista de Cotejo',
    description: 'Calificación mediante criterios predefinidos',
    href: '/checklist-evaluation',
    icon: CheckSquare,
    color: 'bg-ies-success-50 text-ies-success-500',
    roles: ['admin', 'evaluator'],
  },
  {
    id: 5,
    title: 'Administración de Roles',
    description: 'Gestión de usuarios, roles y permisos',
    href: '/roles',
    icon: Users,
    color: 'bg-ies-neutral-100 text-ies-neutral-700',
    roles: ['admin'],
  },
  {
    id: 6,
    title: 'Validación de Evaluaciones',
    description: 'Revisión y validación de evaluaciones completadas',
    href: '/validation',
    icon: ShieldCheck,
    color: 'bg-ies-blue-100 text-ies-blue-600',
    roles: ['admin', 'validator'],
  },
  {
    id: 7,
    title: 'Publicación de Resultados',
    description: 'Consulta de resultados individuales y agrupados',
    href: '/results',
    icon: BarChart4,
    color: 'bg-ies-purple-100 text-ies-purple-600',
    roles: ['admin', 'evaluator', 'evaluated'],
  },
];
