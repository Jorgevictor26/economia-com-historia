import { Component, signal } from '@angular/core';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminPageHeaderComponent } from '../../shared/components';

type Period = 'Diario' | 'Semanal' | 'Mensal';

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
  readonly selectedPeriod = signal<Period>('Semanal');

  readonly periods: Period[] = ['Diario', 'Semanal', 'Mensal'];

  readonly summaryCards = signal<StatisticCard[]>([
    { label: 'Visualizacoes totais', value: '124.8K', note: 'Ultimos 30 dias', icon: 'visibility' },
    { label: 'Reacoes totais', value: '38.4K', note: 'Todos os tipos combinados', icon: 'thumb_up' },
    { label: 'Comentarios', value: '6.2K', note: 'Ultimas 4 semanas', icon: 'chat_bubble' },
    { label: 'Crescimento de utilizadores', value: '+12.7%', note: 'Ultimo mes', icon: 'trending_up' },
  ]);

  readonly evolution = signal<ChartPoint[]>([
    { label: 'Seg', value: '9.8K', percent: 46, tone: 'bg-[#8A3F50]' },
    { label: 'Ter', value: '13.4K', percent: 63, tone: 'bg-[#5C1E2F]' },
    { label: 'Qua', value: '11.1K', percent: 52, tone: 'bg-[#2A9D8F]' },
    { label: 'Qui', value: '18.6K', percent: 88, tone: 'bg-[#D4AF37]' },
    { label: 'Sex', value: '16.2K', percent: 76, tone: 'bg-[#5C1E2F]' },
    { label: 'Sab', value: '10.7K', percent: 50, tone: 'bg-[#8A3F50]' },
    { label: 'Dom', value: '14.9K', percent: 70, tone: 'bg-[#2A9D8F]' },
  ]);

  readonly contentViews = signal<DataRow[]>([
    { label: 'Como o cafe mudou a economia', value: '18.2K', detail: '9.8% do total', percent: 92 },
    { label: 'Historia de Angola', value: '14.9K', detail: '8.1% do total', percent: 78 },
    { label: 'A importancia dos documentos', value: '11.4K', detail: '6.2% do total', percent: 66 },
    { label: 'Quiz sobre politica economica', value: '9.7K', detail: '5.3% do total', percent: 54 },
  ]);

  readonly categoryViews = signal<DataRow[]>([
    { label: 'Artigos', value: '42.3K', detail: '34%', percent: 84 },
    { label: 'Videos', value: '36.7K', detail: '29%', percent: 73 },
    { label: 'Podcasts', value: '23.8K', detail: '19%', percent: 48 },
    { label: 'Foruns', value: '12.6K', detail: '10%', percent: 32 },
    { label: 'Quizzes', value: '9.4K', detail: '8%', percent: 24 },
  ]);

  readonly reactionBreakdown = signal<DataRow[]>([
    { label: 'Gostos', value: '24.1K', detail: '+4.8%', percent: 76 },
    { label: 'Amar', value: '7.8K', detail: '+3.2%', percent: 45 },
    { label: 'Interessante', value: '3.6K', detail: '+2.0%', percent: 28 },
    { label: 'Informativo', value: '2.9K', detail: '+1.4%', percent: 22 },
  ]);

  readonly commentPeriods = signal<DataRow[]>([
    { label: 'Hoje', value: '1.3K', detail: '25% menos que ontem', percent: 58 },
    { label: 'Esta semana', value: '3.9K', detail: '12% mais que semana passada', percent: 72 },
    { label: 'Este mes', value: '6.2K', detail: '7.4% mais que mes anterior', percent: 81 },
  ]);

  readonly userGrowth = signal<DataRow[]>([
    { label: 'Novos utilizadores', value: '1.1K', detail: 'Ultimos 7 dias', percent: 64 },
    { label: 'Utilizadores ativos', value: '18.6K', detail: 'Sessoes registadas', percent: 86 },
    { label: 'Conversoes premium', value: '842', detail: 'Assinaturas no periodo', percent: 38 },
  ]);

  readonly authorPerformance = signal<PerformanceRow[]>([
    { name: 'Carlos Silva', views: '26.4K', engagement: '4.8K interacoes', score: '92%' },
    { name: 'Ana Costa', views: '19.1K', engagement: '3.2K comentarios', score: '84%' },
    { name: 'Maria Sousa', views: '14.8K', engagement: '2.7K reacoes', score: '78%' },
    { name: 'Equipe editorial', views: '11.6K', engagement: '1.9K partilhas', score: '71%' },
  ]);

  readonly categoryPerformance = signal<PerformanceRow[]>([
    { name: 'Economia colonial', views: '31.2K', engagement: '5.6K interacoes', score: '89%' },
    { name: 'Historia contemporanea', views: '28.8K', engagement: '4.9K comentarios', score: '85%' },
    { name: 'Politicas publicas', views: '21.7K', engagement: '3.1K reacoes', score: '76%' },
  ]);

  readonly forumStats = signal<DataRow[]>([
    { label: 'Foruns ativos', value: '42', detail: 'Neste mes', percent: 80 },
    { label: 'Topicos criados', value: '1.7K', detail: 'Discussoes em alta', percent: 68 },
    { label: 'Participantes', value: '6.9K', detail: 'Respostas recentes', percent: 74 },
  ]);

  readonly quizStats = signal<DataRow[]>([
    { label: 'Quizzes publicados', value: '27', detail: 'Conteudo interativo', percent: 62 },
    { label: 'Tentativas', value: '8.4K', detail: 'Ultimos 30 dias', percent: 79 },
    { label: 'Conclusoes', value: '5.7K', detail: 'Taxa media 68%', percent: 68 },
  ]);

  selectPeriod(period: Period): void {
    this.selectedPeriod.set(period);
  }
}
