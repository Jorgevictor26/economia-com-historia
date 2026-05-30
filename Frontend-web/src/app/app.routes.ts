import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { superAdminGuard } from './core/guards/super-admin.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout';
import { SuperAdminLayoutComponent } from './layouts/super-admin-layout/super-admin-layout';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./modules/home/routes/home.routes').then((m) => m.HOME_ROUTES) },
      { path: 'auth', loadChildren: () => import('./modules/auth/routes/auth.routes').then((m) => m.AUTH_ROUTES) },
    ],
  },
  {
    path: 'app',
    component: DashboardLayoutComponent,
    children: [
      { path: 'home', loadChildren: () => import('./modules/daily-home/routes/daily-home.routes').then((m) => m.DAILY_HOME_ROUTES) },
      { path: 'contents', loadChildren: () => import('./modules/contents/routes/contents.routes').then((m) => m.CONTENTS_ROUTES) },
      { path: 'forums', canActivate: [authGuard], data: { loginOperation: 'aceder aos fóruns' }, loadChildren: () => import('./modules/forums/routes/forums.routes').then((m) => m.FORUMS_ROUTES) },
      { path: 'quizzes', loadChildren: () => import('./modules/quizzes/routes/quizzes.routes').then((m) => m.QUIZZES_ROUTES) },
      { path: 'podcasts', loadChildren: () => import('./modules/podcasts/routes/podcasts.routes').then((m) => m.PODCASTS_ROUTES) },
      { path: 'map', loadChildren: () => import('./modules/map/routes/map.routes').then((m) => m.MAP_ROUTES) },
      { path: 'jindungo', loadChildren: () => import('./modules/jindungo/routes/jindungo.routes').then((m) => m.JINDUNGO_ROUTES) },
      { path: 'favorites', canActivate: [authGuard], data: { loginOperation: 'ver favoritos' }, loadChildren: () => import('./modules/favorites/routes/favorites.routes').then((m) => m.FAVORITES_ROUTES) },
      { path: 'subscriptions', canActivate: [authGuard], data: { loginOperation: 'subscrever ao Jindungo' }, loadChildren: () => import('./modules/subscriptions/routes/subscriptions.routes').then((m) => m.SUBSCRIPTIONS_ROUTES) },
      { path: 'profile', canActivate: [authGuard], data: { loginOperation: 'ver o perfil' }, loadChildren: () => import('./modules/profile/routes/profile.routes').then((m) => m.PROFILE_ROUTES) },
      { path: 'notifications', canActivate: [authGuard], data: { loginOperation: 'ver notificações' }, loadChildren: () => import('./modules/notifications/routes/notifications.routes').then((m) => m.NOTIFICATIONS_ROUTES) },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },
  { path: 'admin', component: AdminLayoutComponent, canActivate: [adminGuard], loadChildren: () => import('./modules/admin/routes/admin.routes').then((m) => m.ADMIN_ROUTES) },
  { path: 'super-admin', component: SuperAdminLayoutComponent, canActivate: [superAdminGuard], loadChildren: () => import('./modules/super-admin/routes/super-admin.routes').then((m) => m.SUPER_ADMIN_ROUTES) },
  { path: '**', redirectTo: '' },
];
