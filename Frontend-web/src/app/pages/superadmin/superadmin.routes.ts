import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { AdminArticleCreatePage, AdminQuizCreatePage } from '../admin/admin.routes';
import { AdminPodcastCreatePage } from '../admin/create/admin-podcast-create.page';

@Component({
  selector: 'app-super-admin-page',
  templateUrl: './super-admin-page.html'
})
export class SuperAdminPage {}

export const SUPER_ADMIN_ROUTES: Routes = [
  { path: 'quiz', component: AdminQuizCreatePage },
  { path: 'quizzes', component: AdminQuizCreatePage },
  { path: 'contents/create', component: AdminArticleCreatePage },
  { path: 'podcast/create', component: AdminPodcastCreatePage },
  { path: 'podcasts/create', component: AdminPodcastCreatePage },
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  { path: ':section', component: SuperAdminPage },
];

