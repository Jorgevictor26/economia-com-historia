import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-super-admin-placeholder-page',
  standalone: true,
  templateUrl: './super-admin-placeholder.page.html'
})
export class SuperAdminPlaceholderPage {}

export const SUPER_ADMIN_ROUTES: Routes = [
  { path: 'quiz', loadComponent: () => import('../writer/content-create/quiz-create.page').then((m) => m.QuizCreatePage) },
  { path: 'quizzes', redirectTo: 'quiz' },
  { path: 'contents/create', loadComponent: () => import('../writer/content-create/article-create.page').then((m) => m.ArticleCreatePage) },
  { path: 'article/create', redirectTo: 'contents/create' },
  { path: 'jindungo/create', loadComponent: () => import('../writer/content-create/jindungo-create.page').then((m) => m.JindungoCreatePage) },
  { path: 'jindungos/create', redirectTo: 'jindungo/create' },
  { path: 'contents/jindungo/create', redirectTo: 'jindungo/create' },
  { path: 'podcast/create', loadComponent: () => import('../writer/content-create/podcast-create.page').then((m) => m.PodcastCreatePage) },
  { path: 'podcasts/create', redirectTo: 'podcast/create' },
  { path: 'video/create', loadComponent: () => import('../writer/content-create/video-create.page').then((m) => m.VideoCreatePage) },
  { path: 'videos/create', redirectTo: 'video/create' },
  { path: 'contents/video/create', redirectTo: 'video/create' },
  { path: 'forum/create', loadComponent: () => import('../writer/content-create/forum-create.page').then((m) => m.ForumCreatePage) },
  { path: 'forums/create', redirectTo: 'forum/create' },
  { path: 'contents/forum/create', redirectTo: 'forum/create' },
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  { path: ':section', component: SuperAdminPlaceholderPage },
];

