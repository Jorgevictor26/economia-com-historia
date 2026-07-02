import { Component, inject, signal } from '@angular/core';
import { AdminStatisticsPeriod, AdminStatisticsService } from '../../../../services/admin-statistics.service';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminPageHeaderComponent } from '../../shared/components';

type Period = AdminStatisticsPeriod;

interface StatisticCard {
  label: string;
  value: string;
  note: string;
  icon: string;
}

interface ChartPoint {
  label: string;
  value: string;
  percent: number;
  tone: string;
}

interface DataRow {
  label: string;
  value: string;
  detail: string;
  percent?: number;
}

interface PerformanceRow {
  name: string;
  views: string;
  engagement: string;
  score: string;
}

@Component({
  selector: 'app-admin-statistics-page',
  standalone: true,
  imports: [AdminConsoleShellComponent, AdminPageHeaderComponent],
  templateUrl: './admin-statistics.page.html',
})
export class AdminStatisticsPage {
  private readonly statisticsService = inject(AdminStatisticsService);

  readonly selectedPeriod = signal<Period>('Semanal');
  readonly isLoading = signal(true);
  readonly loadError = signal('');

  readonly periods: Period[] = ['Diario', 'Semanal', 'Mensal'];

  readonly summaryCards = signal<StatisticCard[]>([]);
  readonly evolution = signal<ChartPoint[]>([]);
  readonly contentViews = signal<DataRow[]>([]);
  readonly categoryViews = signal<DataRow[]>([]);
  readonly reactionBreakdown = signal<DataRow[]>([]);
  readonly commentPeriods = signal<DataRow[]>([]);
  readonly userGrowth = signal<DataRow[]>([]);
  readonly authorPerformance = signal<PerformanceRow[]>([]);
  readonly categoryPerformance = signal<PerformanceRow[]>([]);
  readonly forumStats = signal<DataRow[]>([]);
  readonly quizStats = signal<DataRow[]>([]);

  constructor() {
    void this.loadStatistics();
  }

  selectPeriod(period: Period): void {
    this.selectedPeriod.set(period);
    void this.loadStatistics();
  }

  private async loadStatistics(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');

    try {
      const overview = await this.statisticsService.getOverview(this.selectedPeriod());
      const tones = ['bg-[#8A3F50]', 'bg-[#5C1E2F]', 'bg-[#2A9D8F]', 'bg-[#D4AF37]'];

      this.summaryCards.set([
        { label: 'Visualizacoes totais', value: this.formatNumber(overview.summary.total_views), note: 'Soma atual dos conteudos', icon: 'visibility' },
        { label: 'Reacoes totais', value: this.formatNumber(overview.summary.total_reactions), note: 'Todos os tipos combinados', icon: 'thumb_up' },
        { label: 'Comentarios', value: this.formatNumber(overview.summary.total_comments), note: `Periodo ${this.selectedPeriod().toLowerCase()}`, icon: 'chat_bubble' },
        { label: 'Crescimento de utilizadores', value: `${overview.summary.user_growth_percent}%`, note: 'Novos utilizadores no periodo', icon: 'trending_up' },
      ]);
      this.evolution.set(overview.evolution.map((point, index) => ({
        label: point.label,
        value: this.formatNumber(point.value),
        percent: point.percent,
        tone: tones[index % tones.length],
      })));
      this.contentViews.set(overview.content_views.map((row) => this.toDataRow(row)));
      this.categoryViews.set(overview.category_views.map((row) => this.toDataRow(row)));
      this.reactionBreakdown.set(overview.reaction_breakdown.map((row) => this.toDataRow(row)));
      this.commentPeriods.set(overview.comment_periods.map((row) => this.toDataRow(row)));
      this.userGrowth.set(overview.user_growth.map((row) => this.toDataRow(row)));
      this.authorPerformance.set(overview.author_performance.map((row) => this.toPerformanceRow(row)));
      this.categoryPerformance.set(overview.category_performance.map((row) => this.toPerformanceRow(row)));
      this.forumStats.set(overview.forum_stats.map((row) => this.toDataRow(row)));
      this.quizStats.set(overview.quiz_stats.map((row) => this.toDataRow(row)));
    } catch {
      this.loadError.set('Nao foi possivel carregar as estatisticas agora.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private toDataRow(row: { label: string; value: number; detail: string; percent?: number }): DataRow {
    return {
      label: row.label,
      value: this.formatNumber(row.value),
      detail: row.detail,
      percent: row.percent ?? 0,
    };
  }

  private toPerformanceRow(row: { name: string; views: number; engagement: string; score: number }): PerformanceRow {
    return {
      name: row.name,
      views: this.formatNumber(row.views),
      engagement: row.engagement,
      score: `${row.score}%`,
    };
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-AO', { notation: value > 9999 ? 'compact' : 'standard' }).format(value);
  }
}
