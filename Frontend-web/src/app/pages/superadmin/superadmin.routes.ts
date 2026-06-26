import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-super-admin-page',
  standalone: true,
  templateUrl: './super-admin-page.html'
})
export class SuperAdminPage {}

export const SUPER_ADMIN_ROUTES: Routes = [
  { path: 'quiz', loadComponent: () => import('../writer/content-create/admin-quiz-create.page').then((m) => m.AdminQuizCreatePage) },
  { path: 'quizzes', redirectTo: 'quiz' },
  { path: 'contents/create', loadComponent: () => import('../writer/content-create/admin-article-create.page').then((m) => m.AdminArticleCreatePage) },
  { path: 'article/create', redirectTo: 'contents/create' },
  { path: 'jindungo/create', loadComponent: () => import('../writer/content-create/admin-jindungo-create.page').then((m) => m.AdminJindungoCreatePage) },
  { path: 'jindungos/create', redirectTo: 'jindungo/create' },
  { path: 'contents/jindungo/create', redirectTo: 'jindungo/create' },
  { path: 'podcast/create', loadComponent: () => import('../writer/content-create/admin-podcast-create.page').then((m) => m.AdminPodcastCreatePage) },
  { path: 'podcasts/create', redirectTo: 'podcast/create' },
  { path: 'video/create', loadComponent: () => import('../writer/content-create/admin-video-create.page').then((m) => m.AdminVideoCreatePage) },
  { path: 'videos/create', redirectTo: 'video/create' },
  { path: 'contents/video/create', redirectTo: 'video/create' },
  { path: 'forum/create', loadComponent: () => import('../writer/content-create/admin-forum-create.page').then((m) => m.AdminForumCreatePage) },
  { path: 'forums/create', redirectTo: 'forum/create' },
  { path: 'contents/forum/create', redirectTo: 'forum/create' },
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  { path: ':section', component: SuperAdminPage },
];

