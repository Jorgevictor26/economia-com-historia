import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminUserService, BackendManagedUser } from '../../../../services/admin-user.service';
import { BackendCommentReport, CommentReportService } from '../../../../services/comment-report.service';
import { BackendContent, ContentService } from '../../../../services/content.service';
import { BackendForum, ForumService } from '../../../../services/forum.service';
import { QuizService } from '../../../../services/quiz.service';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminMetricCardComponent, AdminPageHeaderComponent } from '../../shared/components';

interface DashboardMetric {
  label: string;
  value: string;
  note: string;
  accent: string;
  progress: number;
}

interface QuickAction {
  label: string;
  route: string;
  icon: string;
  tone: 'primary' | 'neutral';
}

interface ActivityItem {
  title: string;
  meta: string;
  icon: string;
  tone: 'content' | 'user' | 'forum' | 'report';
}

interface AlertItem {
  title: string;
  description: string;
  value: string;
  icon: string;
  tone: 'danger' | 'warning' | 'info';
  route: string;
}

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [RouterLink, AdminConsoleShellComponent, AdminMetricCardComponent, AdminPageHeaderComponent],
  templateUrl: './admin-dashboard.page.html',
})
export class AdminDashboardPage {
  private readonly contentService = inject(ContentService);
  private readonly usersService = inject(AdminUserService);
  private readonly forumService = inject(ForumService);
  private readonly quizService = inject(QuizService);
  private readonly reportsService = inject(CommentReportService);

  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly metrics = signal<DashboardMetric[]>(this.emptyMetrics());
  readonly activities = signal<ActivityItem[]>([]);
  readonly alerts = signal<AlertItem[]>([]);
  readonly contentMix = signal([
    { label: 'Artigos', value: 72 },
    { label: 'Videos', value: 54 },
    { label: 'Podcasts', value: 33 },
    { label: 'Quizzes', value: 28 },
    { label: 'Foruns', value: 47 },
    { label: 'Jindungo', value: 18 },
  ]);

  readonly quickActions: QuickAction[] = [
    { label: 'Novo Conteudo', route: '/admin/contents/create', icon: 'add_circle', tone: 'primary' },
    { label: 'Novo Forum', route: '/admin/forum/create', icon: 'forum', tone: 'neutral' },
    { label: 'Gerir Utilizadores', route: '/admin/users', icon: 'group', tone: 'neutral' },
    { label: 'Ver Estatisticas', route: '/admin/statistics', icon: 'monitoring', tone: 'primary' },
  ];

  constructor() {
    void this.loadDashboard();
  }

  actionClasses(action: QuickAction): string {
    return action.tone === 'primary'
      ? 'border-[#5C1E2F] bg-[#5C1E2F] text-white hover:bg-[#471525]'
      : 'border-[#E0E0E0] bg-white text-[#5C1E2F] hover:border-[#8A3F50] hover:bg-[#F2E6E9]';
  }

  alertClasses(alert: AlertItem): string {
    const classes: Record<AlertItem['tone'], string> = {
      danger: 'border-[#F8D7DA] bg-[#FDECEA] text-[#B42318]',
      warning: 'border-[#E8D5DB] bg-[#F2E6E9] text-[#8A3F50]',
      info: 'border-[#E0E0E0] bg-white text-[#616161]',
    };

    return classes[alert.tone];
  }

  activityToneClasses(activity: ActivityItem): string {
    const classes: Record<ActivityItem['tone'], string> = {
      content: 'bg-[#F2E6E9] text-[#8A3F50]',
      user: 'bg-[#E9F4F2] text-[#2A9D8F]',
      forum: 'bg-[#F5F5F5] text-[#616161]',
      report: 'bg-[#FDECEA] text-[#B42318]',
    };

    return classes[activity.tone];
  }

  private async loadDashboard(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');

    const [contentsResult, usersResult, forumsResult, quizzesResult, reportsResult] = await Promise.allSettled([
      this.contentService.getAll(),
      this.usersService.getAll({ perPage: 100 }),
      this.forumService.getAll(),
      this.quizService.loadAll(),
      this.reportsService.getAll({ perPage: 100 }),
    ]);

    const contentsPage = contentsResult.status === 'fulfilled' ? contentsResult.value : null;
    const contents = contentsPage?.data ?? [];
    const users = usersResult.status === 'fulfilled' ? usersResult.value.data : [];
    const forums = forumsResult.status === 'fulfilled' ? forumsResult.value : [];
    const quizzes = quizzesResult.status === 'fulfilled' ? quizzesResult.value : [];
    const reports = reportsResult.status === 'fulfilled' ? reportsResult.value.data : [];

    this.metrics.set(this.buildMetrics(contents, contentsPage?.pagination.total ?? contents.length, users));
    this.activities.set(this.buildActivities(contents, users, forums, reports));
    this.alerts.set(this.buildAlerts(contents, forums, reports, quizzes.length));

    if ([contentsResult, usersResult, forumsResult, quizzesResult, reportsResult].some((result) => result.status === 'rejected')) {
      this.loadError.set('Alguns dados nao puderam ser carregados agora.');
    }

    this.isLoading.set(false);
  }

  private buildMetrics(contents: BackendContent[], totalContents: number, users: BackendManagedUser[]): DashboardMetric[] {
    const published = contents.filter((content) => (content.visibility ?? 'public') === 'public').length;
    const drafts = Math.max(totalContents - published, contents.filter((content) => (content.visibility ?? 'public') !== 'public').length);
    const activeUsers = users.filter((user) => (user.status ?? 'active').toLowerCase() !== 'inactive').length;
    const todayComments = contents
      .filter((content) => this.isToday(content.updated_at ?? content.created_at))
      .reduce((total, content) => total + Number(content.comments_count ?? 0), 0);

    return [
      { label: 'Conteudos publicados', value: this.formatNumber(published), note: 'Visiveis na plataforma', accent: '#5C1E2F', progress: this.percent(published, totalContents) },
      { label: 'Pendentes / rascunhos', value: this.formatNumber(drafts), note: 'A rever ou completar', accent: '#8A3F50', progress: this.percent(drafts, totalContents) },
      { label: 'Utilizadores ativos', value: this.formatNumber(activeUsers), note: `${this.formatNumber(users.length)} registados`, accent: '#2A9D8F', progress: this.percent(activeUsers, users.length) },
      { label: 'Total de conteudos', value: this.formatNumber(totalContents), note: 'Todos os formatos', accent: '#616161', progress: 100 },
      { label: 'Novos comentarios hoje', value: this.formatNumber(todayComments), note: 'Em conteudos atualizados hoje', accent: '#D4AF37', progress: Math.min(todayComments * 8, 100) },
    ];
  }

  private buildActivities(
    contents: BackendContent[],
    users: BackendManagedUser[],
    forums: BackendForum[],
    reports: BackendCommentReport[],
  ): ActivityItem[] {
    const contentActivities = contents.slice(0, 3).map((content) => ({
      title: content.title,
      meta: `${content.content_type?.name ?? 'Conteudo'} - ${this.relativeDate(content.updated_at ?? content.created_at)}`,
      icon: 'article',
      tone: 'content' as const,
    }));
    const userActivities = users.slice(0, 2).map((user) => ({
      title: user.name,
      meta: `Utilizador ${this.relativeDate(user.created_at)}`,
      icon: 'person_add',
      tone: 'user' as const,
    }));
    const forumActivities = forums.slice(0, 2).map((forum) => ({
      title: forum.name,
      meta: `${forum.visibility === 'private' ? 'Forum privado' : 'Forum publico'} - ${this.relativeDate(forum.updated_at ?? forum.created_at)}`,
      icon: 'forum',
      tone: 'forum' as const,
    }));
    const reportActivities = reports.slice(0, 2).map((report) => ({
      title: `Denuncia #${report.id}`,
      meta: `${this.reportStatusLabel(report.status)} - ${this.relativeDate(report.created_at)}`,
      icon: 'flag',
      tone: 'report' as const,
    }));

    return [...reportActivities, ...contentActivities, ...forumActivities, ...userActivities].slice(0, 7);
  }

  private buildAlerts(
    contents: BackendContent[],
    forums: BackendForum[],
    reports: BackendCommentReport[],
    quizzesCount: number,
  ): AlertItem[] {
    const pendingReports = reports.filter((report) => report.status === 'pending').length;
    const privateForumRequests = forums.filter((forum) => forum.visibility === 'private' || forum.join_approval_required).length;
    const pendingContents = contents.filter((content) => (content.visibility ?? 'public') !== 'public').length;

    return [
      {
        title: 'Denuncias por moderar',
        description: 'Comentarios marcados por utilizadores aguardam revisao.',
        value: this.formatNumber(pendingReports),
        icon: 'report',
        tone: pendingReports ? 'danger' : 'info',
        route: '/admin/reports',
      },
      {
        title: 'Conteudos com pendencia',
        description: 'Itens privados, rascunhos ou em revisao editorial.',
        value: this.formatNumber(pendingContents),
        icon: 'pending_actions',
        tone: pendingContents ? 'warning' : 'info',
        route: '/admin/contents',
      },
      {
        title: 'Pedidos de foruns privados',
        description: 'Comunidades com acesso restrito ou aprovacao obrigatoria.',
        value: this.formatNumber(privateForumRequests),
        icon: 'lock_person',
        tone: privateForumRequests ? 'warning' : 'info',
        route: '/admin/forum/create',
      },
      {
        title: 'Quizzes disponiveis',
        description: 'Banco de avaliacao ativo para aprendizagem.',
        value: this.formatNumber(quizzesCount),
        icon: 'quiz',
        tone: 'info',
        route: '/admin/quiz',
      },
    ];
  }

  private emptyMetrics(): DashboardMetric[] {
    return [
      'Conteudos publicados',
      'Pendentes / rascunhos',
      'Utilizadores ativos',
      'Total de conteudos',
      'Novos comentarios hoje',
    ].map((label) => ({ label, value: '0', note: 'A carregar', accent: '#8A3F50', progress: 0 }));
  }

  private percent(value: number, total: number): number {
    return total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  }

  private isToday(value: string | null | undefined): boolean {
    const date = value ? new Date(value) : null;
    const today = new Date();

    return Boolean(date && !Number.isNaN(date.getTime()) && date.toDateString() === today.toDateString());
  }

  private relativeDate(value: string | null | undefined): string {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return 'sem data';
    }

    const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);

    if (diffDays <= 0) {
      return 'hoje';
    }

    return `ha ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
  }

  private reportStatusLabel(status: string): string {
    if (status === 'approved') {
      return 'aprovada';
    }

    if (status === 'rejected') {
      return 'reprovada';
    }

    return 'pendente';
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-AO', { notation: value > 9999 ? 'compact' : 'standard' }).format(value);
  }
}
