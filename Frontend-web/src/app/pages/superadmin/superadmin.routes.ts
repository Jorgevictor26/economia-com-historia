import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { AdminArticleCreatePage } from '../admin/create/admin-article-create.page';
import { AdminForumCreatePage } from '../admin/create/admin-forum-create.page';
import { AdminJindungoCreatePage } from '../admin/create/admin-jindungo-create.page';
import { AdminPodcastCreatePage } from '../admin/create/admin-podcast-create.page';
import { AdminQuizCreatePage } from '../admin/create/admin-quiz-create.page';
import { AdminVideoCreatePage } from '../admin/create/admin-video-create.page';

@Component({
  selector: 'app-super-admin-page',
  templateUrl: './super-admin-page.html'
})
export class SuperAdminPage {}

export const SUPER_ADMIN_ROUTES: Routes = [
  { path: 'quiz', component: AdminQuizCreatePage },
  { path: 'quizzes', redirectTo: 'quiz' },
  { path: 'contents/create', component: AdminArticleCreatePage },
  { path: 'article/create', redirectTo: 'contents/create' },
  { path: 'jindungo/create', component: AdminJindungoCreatePage },
  { path: 'jindungos/create', redirectTo: 'jindungo/create' },
  { path: 'contents/jindungo/create', redirectTo: 'jindungo/create' },
  { path: 'podcast/create', component: AdminPodcastCreatePage },
  { path: 'podcasts/create', redirectTo: 'podcast/create' },
  { path: 'video/create', component: AdminVideoCreatePage },
  { path: 'videos/create', redirectTo: 'video/create' },
  { path: 'contents/video/create', redirectTo: 'video/create' },
  { path: 'forum/create', component: AdminForumCreatePage },
  { path: 'forums/create', redirectTo: 'forum/create' },
  { path: 'contents/forum/create', redirectTo: 'forum/create' },
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  { path: ':section', component: SuperAdminPage },
];

