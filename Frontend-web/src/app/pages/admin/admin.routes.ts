import { Routes } from '@angular/router';
import {
  adminDashboardGuard,
  contentWriterGuard,
  jindungoManagerGuard,
  platformManagerGuard,
  userManagerGuard,
} from '../../services/role-access.guards';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
    canActivate: [adminDashboardGuard],
    pathMatch: 'full',
  },
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
  {
    path: 'statistics',
    loadComponent: () => import('./pages/statistics/admin-statistics.page').then((m) => m.AdminStatisticsPage),
    canActivate: [platformManagerGuard],
  },
  {
    path: 'contents',
    loadComponent: () => import('./pages/contents/admin-contents.page').then((m) => m.AdminContentsPage),
    canActivate: [contentWriterGuard],
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/admin-users.page').then((m) => m.AdminUsersPage),
    canActivate: [userManagerGuard],
  },
  {
    path: 'subscriptions',
    loadComponent: () => import('./pages/subscriptions/admin-subscriptions.page').then((m) => m.AdminSubscriptionsPage),
    canActivate: [platformManagerGuard],
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/admin-reports.page').then((m) => m.AdminReportsPage),
    canActivate: [platformManagerGuard],
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/admin-settings.page').then((m) => m.AdminSettingsPage),
    canActivate: [platformManagerGuard],
  },
  {
    path: 'quiz',
    loadComponent: () => import('../writer/content-create/quiz-create.page').then((m) => m.QuizCreatePage),
    canActivate: [platformManagerGuard],
  },
  { path: 'quiz/create', redirectTo: 'quiz' },
  { path: 'quizzes', redirectTo: 'quiz' },
  { path: 'quizzes/create', redirectTo: 'quiz' },
  { path: 'contents/quiz/create', redirectTo: 'quiz' },
  {
    path: 'podcast/create',
    loadComponent: () => import('../writer/content-create/podcast-create.page').then((m) => m.PodcastCreatePage),
    canActivate: [contentWriterGuard],
  },
  { path: 'podcasts/create', redirectTo: 'podcast/create' },
  { path: 'contents/podcast/create', redirectTo: 'podcast/create' },
  {
    path: 'jindungo/create',
    loadComponent: () => import('../writer/content-create/jindungo-create.page').then((m) => m.JindungoCreatePage),
    canActivate: [jindungoManagerGuard],
  },
  { path: 'jindungos/create', redirectTo: 'jindungo/create' },
  { path: 'contents/jindungo/create', redirectTo: 'jindungo/create' },
  {
    path: 'video/create',
    loadComponent: () => import('../writer/content-create/video-create.page').then((m) => m.VideoCreatePage),
    canActivate: [contentWriterGuard],
  },
  { path: 'videos/create', redirectTo: 'video/create' },
  { path: 'contents/video/create', redirectTo: 'video/create' },
  {
    path: 'forum/create',
    loadComponent: () => import('../writer/content-create/forum-create.page').then((m) => m.ForumCreatePage),
    canActivate: [contentWriterGuard],
  },
  { path: 'forums/create', redirectTo: 'forum/create' },
  { path: 'contents/forum/create', redirectTo: 'forum/create' },
  {
    path: 'contents/create',
    loadComponent: () => import('../writer/content-create/article-create.page').then((m) => m.ArticleCreatePage),
    canActivate: [contentWriterGuard],
  },
  { path: 'article/create', redirectTo: 'contents/create' },
  { path: 'articles/create', redirectTo: 'contents/create' },
  { path: 'contents/article/create', redirectTo: 'contents/create' },
  { path: '**', redirectTo: '' },
];
