import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { AdminArticleCreatePage, AdminQuizCreatePage } from '../../admin/routes/admin.routes';
import { AdminPodcastCreatePage } from '../../admin/pages/admin-podcast-create.page';

@Component({
  selector: 'app-super-admin-page',
  template: `
    <section class="rounded-lg bg-white p-8 text-ink shadow-sm">
      <h1 class="text-3xl font-extrabold text-bordeaux">Super Admin</h1>
      <div class="mt-6 grid gap-3 md:grid-cols-3">
        <article class="rounded-md border border-black/10 p-4">
          <h2 class="font-bold text-bordeaux">Promover escritores</h2>
          <p class="mt-2 text-sm text-black/60">Escritores criam artigos, podcasts e textos com Jindungo.</p>
        </article>
        <article class="rounded-md border border-black/10 p-4">
          <h2 class="font-bold text-bordeaux">Promover moderadores</h2>
          <p class="mt-2 text-sm text-black/60">Moderadores gerem comentários, denúncias e debates dos fóruns.</p>
        </article>
        <article class="rounded-md border border-black/10 p-4">
          <h2 class="font-bold text-bordeaux">Administradores</h2>
          <p class="mt-2 text-sm text-black/60">Administradores e superadministrador administram conteúdos, fóruns e quizzes.</p>
        </article>
      </div>
      <p class="mt-3 text-black/60">Utilizadores, administradores, permissões, analytics e monitoramento.</p>
    </section>
  `,
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
