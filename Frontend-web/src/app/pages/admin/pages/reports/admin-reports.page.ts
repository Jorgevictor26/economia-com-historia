import { Component } from '@angular/core';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminMetricCardComponent, AdminPageHeaderComponent } from '../../shared/components';

interface ReportMetric {
  label: string;
  value: string;
  tone: 'gold' | 'red' | 'wine' | 'amber';
}

interface ReportItem {
  severity: 'Critico' | 'Moderado' | 'Baixo';
  title: string;
  target: string;
  excerpt: string;
  meta: string;
  reporter: string;
  category: string;
  time: string;
  primaryAction: string;
  secondaryAction: string;
  mutedAction: string;
}

interface ActivityLog {
  time: string;
  actor: string;
  detail: string;
  tone: 'red' | 'gold' | 'wine';
}

@Component({
  selector: 'app-admin-reports-page',
  standalone: true,
  imports: [AdminConsoleShellComponent, AdminMetricCardComponent, AdminPageHeaderComponent],
  templateUrl: './admin-reports.page.html',
})
export class AdminReportsPage {
  showCriticalOnly = false;
  recentFirst = true;
  actionStatus = '';

  readonly metrics: ReportMetric[] = [
    { label: 'Denúncias pendentes', value: '24', tone: 'gold' },
    { label: 'Urgência crítica', value: '03', tone: 'red' },
    { label: 'Resolvidas (24h)', value: '142', tone: 'wine' },
    { label: 'Tempo de resposta', value: '18m', tone: 'amber' },
  ];

  reports: ReportItem[] = [
    {
      severity: 'Critico',
      title: 'Comentário em: "A Economia do Reino do Kongo"',
      target: 'Discurso de ódio',
      excerpt: '...texto removido por conter violações graves às diretrizes de respeito e integridade histórica do portal...',
      meta: '12 minutos atrás',
      reporter: 'Autor: Joao M.',
      category: 'Reportado por: Ana P., Miguel (4)',
      time: 'Agora',
      primaryAction: 'Banir usuário',
      secondaryAction: 'Aviso prévio',
      mutedAction: 'Ignorar',
    },
    {
      severity: 'Moderado',
      title: 'Usuário: @historia_fake_ang',
      target: 'Perfil inapropriado',
      excerpt: 'Bio: Divulgação de fatos alternativos sobre a moeda Kwanza.',
      meta: '2 horas atrás',
      reporter: 'Razão: Desinformação',
      category: 'Histórico: 1 aviso anterior',
      time: 'Pendente',
      primaryAction: 'Suspender',
      secondaryAction: 'Editar perfil',
      mutedAction: 'Visto',
    },
    {
      severity: 'Baixo',
      title: 'Tópico: "Melhores investimentos em Luanda para 2025"',
      target: 'Spam / Conteúdo irrelevante',
      excerpt: 'Compre agora criptomoedas e ganhe bônus imediatos no site bit-fake-link.com...',
      meta: '5 horas atrás',
      reporter: 'Origem: UPL Detectou',
      category: 'Marcado como marketing',
      time: 'Fila',
      primaryAction: 'Remover post',
      secondaryAction: 'Descartar',
      mutedAction: 'Arquivar',
    },
  ];

  readonly activityLogs: ActivityLog[] = [
    { time: '14:02', actor: 'Moderador Carlos', detail: 'removeu comentário de "Pedro S." por violação de termos.', tone: 'red' },
    { time: '13:45', actor: 'Sistema', detail: 'bloqueou automaticamente usuário "Barreto_DL" por 12 reports em 9 minutos.', tone: 'gold' },
    { time: '12:30', actor: 'Super Admin Ana Helena', detail: 'aprovou recurso de "Marta L.".', tone: 'wine' },
  ];

  metricColor(tone: ReportMetric['tone']): string {
    const colors: Record<ReportMetric['tone'], string> = {
      gold: '#D4AF37',
      red: '#8A3F50',
      wine: '#5c1e2f',
      amber: '#D4AF37',
    };

    return colors[tone];
  }

  visibleReports(): ReportItem[] {
    const reports = this.showCriticalOnly ? this.reports.filter((report) => report.severity === 'Critico') : [...this.reports];

    return this.recentFirst ? reports : reports.reverse();
  }

  toggleCriticalFilter(): void {
    this.showCriticalOnly = !this.showCriticalOnly;
    this.actionStatus = this.showCriticalOnly ? 'A mostrar apenas denúncias críticas.' : 'Filtro removido.';
  }

  toggleSort(): void {
    this.recentFirst = !this.recentFirst;
    this.actionStatus = this.recentFirst ? 'Ordenado por mais recentes.' : 'Ordenado por fila inversa.';
  }

  handleReportAction(report: ReportItem, action: string): void {
    this.reports = this.reports.filter((item) => item !== report);
    this.actionStatus = `${action}: "${report.title}" foi atualizado.`;
  }
}
