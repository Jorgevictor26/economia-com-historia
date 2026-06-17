import { Routes } from '@angular/router';
import { AdminArticleCreatePage as AdminArticleCreateStandalonePage } from '../pages/admin-article-create.page';
import { AdminContentsPage } from '../pages/contents/admin-contents.page';
import { AdminDashboardPage } from '../pages/dashboard/admin-dashboard.page';
import { AdminForumCreatePage } from '../pages/admin-forum-create.page';
import { AdminJindungoCreatePage } from '../pages/admin-jindungo-create.page';
import { AdminPodcastCreatePage } from '../pages/admin-podcast-create.page';
import { AdminQuizCreatePage as AdminQuizCreateStandalonePage } from '../pages/admin-quiz-create.page';
import { AdminSettingsPage } from '../pages/settings/admin-settings.page';
import { AdminStatisticsPage } from '../pages/statistics/admin-statistics.page';
import { AdminSubscriptionsPage } from '../pages/subscriptions/admin-subscriptions.page';
import { AdminUsersPage } from '../pages/users/admin-users.page';
import { AdminVideoCreatePage } from '../pages/admin-video-create.page';
import { AdminReportsPage } from '../pages/reports/admin-reports.page';

// Plataforma
const platformRoutes: Routes = [
  { path: '', component: AdminDashboardPage, pathMatch: 'full' },
  { path: 'statistics', component: AdminStatisticsPage },
];

// Gerenciamento de Conteúdo
const contentRoutes: Routes = [
  { path: 'contents', component: AdminContentsPage },
  { path: 'contents/create', component: AdminArticleCreateStandalonePage },
  { path: 'article/create', redirectTo: 'contents/create' },
];

// Criação de Conteúdo
const contentCreationRoutes: Routes = [
  { path: 'quiz', component: AdminQuizCreateStandalonePage },
  { path: 'quizzes', redirectTo: 'quiz' },
  { path: 'video/create', component: AdminVideoCreatePage },
  { path: 'videos/create', redirectTo: 'video/create' },
  { path: 'contents/video/create', redirectTo: 'video/create' },
  { path: 'podcast/create', component: AdminPodcastCreatePage },
  { path: 'podcasts/create', redirectTo: 'podcast/create' },
  { path: 'forum/create', component: AdminForumCreatePage },
  { path: 'forums/create', redirectTo: 'forum/create' },
  { path: 'contents/forum/create', redirectTo: 'forum/create' },
  { path: 'jindungo/create', component: AdminJindungoCreatePage },
  { path: 'jindungos/create', redirectTo: 'jindungo/create' },
  { path: 'contents/jindungo/create', redirectTo: 'jindungo/create' },
];

// Administração
const administrationRoutes: Routes = [
  { path: 'users', component: AdminUsersPage },
  { path: 'subscriptions', component: AdminSubscriptionsPage },
  { path: 'reports', component: AdminReportsPage },
];

// Infraestrutura
const infrastructureRoutes: Routes = [
  { path: 'settings', component: AdminSettingsPage },
];

// Aliases e redirecionamentos
const redirectRoutes: Routes = [
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
];

export const ADMIN_ROUTES: Routes = [
  ...platformRoutes,
  ...contentRoutes,
  ...contentCreationRoutes,
  ...administrationRoutes,
  ...infrastructureRoutes,
  ...redirectRoutes,
  { path: '**', redirectTo: '' },
];
