import { CanActivateFn, Routes } from '@angular/router';
import { adminGuard } from './services/admin.guard';
import { authGuard } from './services/auth.guard';
import { superAdminGuard } from './services/super-admin.guard';
import { AdminLayoutComponent } from './pages/layouts/admin-layout/admin-layout';
import { DashboardLayoutComponent } from './pages/layouts/dashboard-layout/dashboard-layout';
import { PublicLayoutComponent } from './pages/layouts/public-layout/public-layout';
import { SuperAdminLayoutComponent } from './pages/layouts/super-admin-layout/super-admin-layout';

type LazyRoutes = () => Promise<Routes>;

interface DashboardRoute {
  path: string;
  loadChildren: LazyRoutes;
  canActivate?: CanActivateFn[];
  loginOperation?: string;
}

const dashboardRoutes: DashboardRoute[] = [
  { path: 'home', loadChildren: () => import('./pages/users/daily-home.routes').then((m) => m.DAILY_HOME_ROUTES) },
  { path: 'contents', loadChildren: () => import('./pages/users/contents/contents.routes').then((m) => m.CONTENTS_ROUTES) },
  {
    path: 'forums',
    canActivate: [authGuard],
    loginOperation: 'aceder aos fóruns',
    loadChildren: () => import('./pages/users/forums.routes').then((m) => m.FORUMS_ROUTES),
  },
  { path: 'quizzes', loadChildren: () => import('./pages/users/quizzes.routes').then((m) => m.QUIZZES_ROUTES) },
  { path: 'podcasts', loadChildren: () => import('./pages/users/podcasts.routes').then((m) => m.PODCASTS_ROUTES) },
  { path: 'map', loadChildren: () => import('./pages/users/map.routes').then((m) => m.MAP_ROUTES) },
  { path: 'jindungo', loadChildren: () => import('./pages/users/jindungo.routes').then((m) => m.JINDUNGO_ROUTES) },
  {
    path: 'favorites',
    canActivate: [authGuard],
    loginOperation: 'ver favoritos',
    loadChildren: () => import('./pages/users/favorites.routes').then((m) => m.FAVORITES_ROUTES),
  },
  {
    path: 'subscriptions',
    canActivate: [authGuard],
    loginOperation: 'subscrever ao Jindungo',
    loadChildren: () => import('./pages/users/subscriptions.routes').then((m) => m.SUBSCRIPTIONS_ROUTES),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loginOperation: 'ver o perfil',
    loadChildren: () => import('./pages/users/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loginOperation: 'ver notificações',
    loadChildren: () => import('./pages/users/notifications.routes').then((m) => m.NOTIFICATIONS_ROUTES),
  },
];

const toDashboardChild = ({ loginOperation, ...route }: DashboardRoute): Routes[number] => ({
  ...route,
  ...(loginOperation ? { data: { loginOperation } } : {}),
});

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./pages/public/public.routes').then((m) => m.HOME_ROUTES) },
      { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
    ],
  },
  {
    path: 'app',
    component: DashboardLayoutComponent,
    children: [
      ...dashboardRoutes.map(toDashboardChild),
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    loadChildren: () => import('./pages/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'super-admin',
    component: SuperAdminLayoutComponent,
    canActivate: [superAdminGuard],
    loadChildren: () => import('./pages/superadmin/superadmin.routes').then((m) => m.SUPER_ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
