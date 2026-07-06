import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminDashboardActivity, AdminDashboardMetricSummary, AdminDashboardService } from '../../../../services/admin-dashboard.service';
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
export class AdminDashboardPage implements OnInit {
  private readonly dashboardService = inject(AdminDashboardService);

  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly metrics = signal<DashboardMetric[]>(this.emptyMetrics());
  readonly activities = signal<ActivityItem[]>([]);
  readonly alerts = signal<AlertItem[]>([]);
  readonly contentMix = signal<{ label: string; value: number; count: number }[]>([]);

  readonly quickActions: QuickAction[] = [
    { label: 'Novo Conteudo', route: '/admin/contents/create', icon: 'add_circle', tone: 'primary' },
    { label: 'Novo Forum', route: '/admin/forum/create', icon: 'forum', tone: 'neutral' },
    { label: 'Gerir Utilizadores', route: '/admin/users', icon: 'group', tone: 'neutral' },
    { label: 'Ver Estatisticas', route: '/admin/statistics', icon: 'monitoring', tone: 'primary' },
  ];

  ngOnInit(): void {
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

    try {
      const overview = await this.dashboardService.getOverview();

      this.metrics.set(this.buildMetrics(overview.metrics));
      this.activities.set(this.buildActivities(overview.activities));
      this.alerts.set(this.buildAlerts(overview.metrics));
      this.contentMix.set(overview.content_mix);
    } catch {
      this.metrics.set(this.emptyMetrics());
      this.activities.set([]);
      this.alerts.set([]);
      this.contentMix.set([]);
      this.loadError.set('Nao foi possivel carregar o painel geral agora.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private buildMetrics(summary: AdminDashboardMetricSummary): DashboardMetric[] {
    return [
      { label: 'Artigos publicados', value: this.formatNumber(summary.articles_published), note: 'Artigos visiveis na plataforma', accent: '#5C1E2F', progress: this.percent(summary.articles_published, summary.total_contents) },
      { label: 'Pendentes / rascunhos', value: this.formatNumber(summary.pending_contents), note: 'A rever ou completar', accent: '#8A3F50', progress: this.percent(summary.pending_contents, summary.total_contents) },
      { label: 'Comentarios hoje', value: this.formatNumber(summary.today_comments), note: 'Novos comentarios do dia', accent: '#D4AF37', progress: Math.min(summary.today_comments * 8, 100) },
      { label: 'Notificacoes hoje', value: this.formatNumber(summary.today_notifications), note: 'Novas notificacoes criadas', accent: '#616161', progress: Math.min(summary.today_notifications * 8, 100) },
      { label: 'Utilizadores ativos', value: this.formatNumber(summary.active_users), note: `${this.formatNumber(summary.total_users)} registados`, accent: '#2A9D8F', progress: this.percent(summary.active_users, summary.total_users) },
    ];
  }

  private buildActivities(activities: AdminDashboardActivity[]): ActivityItem[] {
    return activities.map((activity) => ({
      title: activity.title,
      meta: `${activity.meta} - ${this.relativeDate(activity.created_at)}`,
      icon: activity.icon,
      tone: activity.tone,
    }));
  }

  private buildAlerts(summary: AdminDashboardMetricSummary): AlertItem[] {
    return [
      {
        title: 'Denuncias por moderar',
        description: 'Comentarios marcados por utilizadores aguardam revisao.',
        value: this.formatNumber(summary.pending_reports),
        icon: 'report',
        tone: summary.pending_reports ? 'danger' : 'info',
        route: '/admin/reports',
      },
      {
        title: 'Conteudos com pendencia',
        description: 'Itens privados, rascunhos ou em revisao editorial.',
        value: this.formatNumber(summary.pending_contents),
        icon: 'pending_actions',
        tone: summary.pending_contents ? 'warning' : 'info',
        route: '/admin/contents',
      },
      {
        title: 'Pedidos de foruns privados',
        description: 'Comunidades com acesso restrito ou aprovacao obrigatoria.',
        value: this.formatNumber(summary.private_forums),
        icon: 'lock_person',
        tone: summary.private_forums ? 'warning' : 'info',
        route: '/admin/forum/create',
      },
      {
        title: 'Quizzes disponiveis',
        description: 'Banco de avaliacao ativo para aprendizagem.',
        value: this.formatNumber(summary.total_quizzes),
        icon: 'quiz',
        tone: 'info',
        route: '/admin/quiz',
      },
    ];
  }

  private emptyMetrics(): DashboardMetric[] {
    return [
      'Artigos publicados',
      'Pendentes / rascunhos',
      'Comentarios hoje',
      'Notificacoes hoje',
      'Utilizadores ativos',
    ].map((label) => ({ label, value: '0', note: 'A carregar', accent: '#8A3F50', progress: 0 }));
  }

  private percent(value: number, total: number): number {
    return total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
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

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-AO', { notation: value > 9999 ? 'compact' : 'standard' }).format(value);
  }
}
