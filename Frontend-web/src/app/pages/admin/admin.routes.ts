import { Component, computed, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { AdminConsoleShellComponent } from './components/admin-console-shell.component';
import { AdminEditorialSectionComponent } from './components/admin-editorial-section.component';
import { AdminArticleCreatePage as AdminArticleCreateStandalonePage } from './create/admin-article-create.page';
import { AdminForumCreatePage } from './create/admin-forum-create.page';
import { AdminJindungoCreatePage } from './create/admin-jindungo-create.page';
import { AdminPodcastCreatePage } from './create/admin-podcast-create.page';
import { AdminQuizCreatePage as AdminQuizCreateStandalonePage } from './create/admin-quiz-create.page';
import { AdminVideoCreatePage } from './create/admin-video-create.page';

interface AdminMetric {
  label: string;
  value: string;
  delta: string;
}

interface StudentRank {
  position: number;
  name: string;
  course: string;
  score: number;
  avatar: string;
}

@Component({
  selector: 'app-admin-page',
  imports: [RouterLink],
  templateUrl: './admin-page.html'
})
export class AdminPage {
  readonly searchTerm = signal('');
  readonly metrics: AdminMetric[] = [
    { label: 'Engajamento Médio', value: '8.4 / 10', delta: 'Crescimento e interações' },
    { label: 'Membros Ativos', value: '1,842', delta: '+4.5% novos hoje' },
    { label: 'Taxa de Retenção', value: '97.6%', delta: 'Alta fidelidade' },
    { label: 'Total de Subscritores', value: '12.450', delta: '+8.2% novos seguidores' },
  ];

  readonly students: StudentRank[] = [
    {
      position: 1,
      name: 'Carlos Tchipia',
      course: 'Gestão',
      score: 950,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    },
    {
      position: 2,
      name: 'Jussana Paim',
      course: 'Contabilidade',
      score: 920,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    },
    {
      position: 3,
      name: 'David Jaspe',
      course: 'Gestão',
      score: 980,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    },
    {
      position: 4,
      name: 'Isabel Marques',
      course: 'Contabilidade',
      score: 890,
      avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&q=80',
    },
    {
      position: 5,
      name: 'Líria Bá',
      course: 'Contabilidade',
      score: 870,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    },
  ];

  readonly contentBars = [
    { label: 'Podcast', value: 45 },
    { label: 'Artigo', value: 80 },
    { label: 'Quiz', value: 56 },
    { label: 'Conteúdo', value: 82 },
    { label: 'Fórum', value: 33 },
    { label: 'Diverso', value: 69 },
  ];

  readonly filteredMetrics = computed(() => {
    const query = this.normalizeText(this.searchTerm());
    if (!query) {
      return this.metrics;
    }

    return this.metrics.filter((metric) => this.normalizeText(`${metric.label} ${metric.value} ${metric.delta}`).includes(query));
  });

  readonly filteredStudents = computed(() => {
    const query = this.normalizeText(this.searchTerm());
    if (!query) {
      return this.students;
    }

    return this.students.filter((student) => this.normalizeText(`${student.name} ${student.course} ${student.score}`).includes(query));
  });

  readonly filteredContentBars = computed(() => {
    const query = this.normalizeText(this.searchTerm());
    if (!query) {
      return this.contentBars;
    }

    return this.contentBars.filter((bar) => this.normalizeText(`${bar.label} ${bar.value}`).includes(query));
  });

  readonly searchResults = computed(() => [
    ...this.filteredMetrics().map((metric) => ({ label: metric.label, detail: `${metric.value} - ${metric.delta}`, route: '/admin' })),
    ...this.filteredStudents().map((student) => ({ label: student.name, detail: `${student.course} - ${student.score} pontos`, route: '/admin' })),
    ...this.filteredContentBars().map((bar) => ({ label: bar.label, detail: `${bar.value}% no gráfico`, route: '/admin' })),
  ].slice(0, 6));

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

@Component({
  selector: 'app-admin-article-create-page',
  imports: [RouterLink, AdminConsoleShellComponent, AdminEditorialSectionComponent],
  templateUrl: './admin-article-create-page.html'
})
export class AdminArticleCreatePage {}
@Component({
  selector: 'app-admin-quiz-create-page',
  imports: [AdminConsoleShellComponent, AdminEditorialSectionComponent],
  templateUrl: './admin-quiz-create-page.html'
})
export class AdminQuizCreatePage{
  readonly mode = signal<'ia' | 'manual'>('ia');
  readonly qualityRules = ['Ligado a um conteudo', 'Sem perguntas opinativas', 'Revisao obrigatoria'];
  readonly previewQuestions = [
    { kind: 'Múltipla escolha', title: 'Qual instrumento ajuda a controlar a liquidez na economia?', status: 'IA' },
    { kind: 'Aplicação', title: 'Como a inflacao altera o poder de compra das familias?', status: 'Revisar' },
  ];
  readonly editorialQueue = [
    { title: 'Kongo e comercio', meta: 'História - 6 perguntas', count: '82%' },
    { title: 'Reservas cambiais', meta: 'Economia - 10 perguntas', count: '64%' },
    { title: 'Petróleo e soberania', meta: 'Jindungo - 8 perguntas', count: '41%' },
  ];
}

export const ADMIN_ROUTES: Routes = [
  { path: 'quiz', component: AdminQuizCreateStandalonePage },
  { path: 'quizzes', component: AdminQuizCreateStandalonePage },
  { path: 'podcast/create', component: AdminPodcastCreatePage },
  { path: 'podcasts/create', component: AdminPodcastCreatePage },
  { path: 'jindungo/create', component: AdminJindungoCreatePage },
  { path: 'jindungos/create', component: AdminJindungoCreatePage },
  { path: 'contents/jindungo/create', component: AdminJindungoCreatePage },
  { path: 'video/create', component: AdminVideoCreatePage },
  { path: 'videos/create', component: AdminVideoCreatePage },
  { path: 'contents/video/create', component: AdminVideoCreatePage },
  { path: 'forum/create', component: AdminForumCreatePage },
  { path: 'forums/create', component: AdminForumCreatePage },
  { path: 'contents/forum/create', component: AdminForumCreatePage },
  { path: 'contents/create', component: AdminArticleCreateStandalonePage },
  { path: '', component: AdminPage },
  { path: ':section', component: AdminPage },
];

