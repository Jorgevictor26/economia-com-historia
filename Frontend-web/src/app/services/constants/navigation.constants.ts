import { NavigationItem } from '../../components/interfaces/navigation-item.interface';

export const DASHBOARD_NAVIGATION: NavigationItem[] = [
  { label: 'Conteudos', route: '/app/contents', icon: 'book' },
  { label: 'Quizzes', route: '/app/quizzes', icon: 'spark' },
  { label: 'Fóruns', route: '/app/forums', icon: 'chat' },
  { label: 'Podcasts', route: '/app/podcasts', icon: 'audio' },
  { label: 'Jindungo', route: '/app/jindungo', icon: 'lock' },
  { label: 'Perfil', route: '/app/profile', icon: 'user' },
];

export const ADMIN_NAVIGATION: NavigationItem[] = [
  { label: 'Dashboard', route: '/admin', icon: 'grid', exact: true },
  { label: 'Conteudos', route: '/admin/contents', icon: 'book' },
  { label: 'Quizzes', route: '/admin/quizzes', icon: 'spark' },
  { label: 'Moderacao', route: '/admin/moderation', icon: 'shield' },
  { label: 'Denuncias', route: '/admin/reports', icon: 'flag' },
];

export const SUPER_ADMIN_NAVIGATION: NavigationItem[] = [
  { label: 'Utilizadores', route: '/super-admin/users', icon: 'users' },
  { label: 'Administradores', route: '/super-admin/admins', icon: 'shield' },
  { label: 'Permissoes', route: '/super-admin/permissions', icon: 'key' },
  { label: 'Analytics', route: '/super-admin/analytics', icon: 'chart' },
  { label: 'Monitoramento', route: '/super-admin/monitoring', icon: 'pulse' },
];
