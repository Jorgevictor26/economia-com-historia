import { CanActivateFn, Routes } from '@angular/router';
import { adminGuard } from './services/admin.guard';
import { authGuard } from './services/auth.guard';
import { superAdminGuard } from './services/super-admin.guard';
import { AdminLayoutComponent } from './pages/layouts/admin-layout/admin-layout.component';
import { DashboardLayoutComponent } from './pages/layouts/dashboard-layout/dashboard-layout.component';
import { PublicLayoutComponent } from './pages/layouts/public-layout/public-layout.component';
import { SuperAdminLayoutComponent } from './pages/layouts/super-admin-layout/super-admin-layout.component';

type LazyRoutes = () => Promise<Routes>;

interface DashboardRoute {
  path: string;
  loadChildren: LazyRoutes;
  canActivate?: CanActivateFn[];
  loginOperation?: string;
}

const dashboardRoutes: DashboardRoute[] = [
  { path: 'home', loadChildren: () => import('./pages/users/user-home.routes').then((m) => m.USER_HOME_ROUTES) },
  { path: 'contents', loadChildren: () => import('./pages/users/contents/content-library.routes').then((m) => m.CONTENT_LIBRARY_ROUTES) },
  {
    path: 'forums',
    loadChildren: () => import('./pages/users/user-forums.routes').then((m) => m.USER_FORUMS_ROUTES),
  },
  { path: 'quizzes', loadChildren: () => import('./pages/users/quiz-dashboard.routes').then((m) => m.QUIZ_DASHBOARD_ROUTES) },
  {
    path: 'podcasts',
    canActivate: [authGuard],
    loginOperation: 'ouvir podcasts',
    loadChildren: () => import('./pages/users/podcast-library.routes').then((m) => m.PODCAST_LIBRARY_ROUTES),
  },
  { path: 'map', loadChildren: () => import('./pages/users/economic-map.routes').then((m) => m.ECONOMIC_MAP_ROUTES) },
  { path: 'jindungo', loadChildren: () => import('./pages/users/jindungo-library.routes').then((m) => m.JINDUNGO_LIBRARY_ROUTES) },
  {
    path: 'favorites',
    canActivate: [authGuard],
    loginOperation: 'ver favoritos',
    loadChildren: () => import('./pages/users/saved-contents.routes').then((m) => m.SAVED_CONTENTS_ROUTES),
  },
  {
    path: 'guardados',
    canActivate: [authGuard],
    loginOperation: 'ver guardados',
    loadChildren: () => import('./pages/users/saved-contents.routes').then((m) => m.SAVED_CONTENTS_ROUTES),
  },
  {
    path: 'subscriptions',
    canActivate: [authGuard],
    loginOperation: 'subscrever ao Jindungo',
    loadChildren: () => import('./pages/users/subscription-management.routes').then((m) => m.SUBSCRIPTION_MANAGEMENT_ROUTES),
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
    loadChildren: () => import('./pages/users/notifications-center.routes').then((m) => m.NOTIFICATIONS_CENTER_ROUTES),
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
    loadChildren: () => import('./pages/superadmin/super-admin.routes').then((m) => m.SUPER_ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' },
];

