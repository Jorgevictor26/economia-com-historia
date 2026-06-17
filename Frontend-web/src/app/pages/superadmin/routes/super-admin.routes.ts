import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { AdminArticleCreatePage } from '../../admin/pages/admin-article-create.page';
import { AdminPodcastCreatePage } from '../../admin/pages/admin-podcast-create.page';
import { AdminQuizCreatePage } from '../../admin/pages/admin-quiz-create.page';

@Component({
  selector: 'app-super-admin-page',
  templateUrl: './super-admin.page.html',
})
export class SuperAdminPage {}

export const SUPER_ADMIN_ROUTES: Routes = [
  { path: 'quiz', component: AdminQuizCreatePage },
  { path: 'quizzes', redirectTo: 'quiz' },
  { path: 'contents/create', component: AdminArticleCreatePage },
  { path: 'podcast/create', component: AdminPodcastCreatePage },
  { path: 'podcasts/create', redirectTo: 'podcast/create' },
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  { path: ':section', component: SuperAdminPage },
];
