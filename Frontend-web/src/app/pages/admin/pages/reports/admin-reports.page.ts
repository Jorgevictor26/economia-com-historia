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
  readonly metrics: ReportMetric[] = [
    { label: 'Denuncias pendentes', value: '24', tone: 'gold' },
    { label: 'Urgencia critica', value: '03', tone: 'red' },
    { label: 'Resolvidas (24h)', value: '142', tone: 'wine' },
    { label: 'Tempo de resposta', value: '18m', tone: 'amber' },
  ];

  readonly reports: ReportItem[] = [
    {
      severity: 'Critico',
      title: 'Comentario em: "A Economia do Reino do Kongo"',
      target: 'Discurso de odio',
      excerpt: '...texto removido por conter violacoes graves as diretrizes de respeito e integridade historica do portal...',
      meta: '12 minutos atras',
      reporter: 'Autor: Joao M.',
      category: 'Reportado por: Ana P., Miguel (4)',
      time: 'Agora',
      primaryAction: 'Banir usuario',
      secondaryAction: 'Aviso previo',
      mutedAction: 'Ignorar',
    },
    {
      severity: 'Moderado',
      title: 'Usuario: @historia_fake_ang',
      target: 'Perfil inapropriado',
      excerpt: 'Bio: Divulgacao de fatos alternativos sobre a moeda Kwanza.',
      meta: '2 horas atras',
      reporter: 'Razao: Desinformacao',
      category: 'Historico: 1 aviso anterior',
      time: 'Pendente',
      primaryAction: 'Suspender',
      secondaryAction: 'Editar perfil',
      mutedAction: 'Visto',
    },
    {
      severity: 'Baixo',
      title: 'Topico: "Melhores investimentos em Luanda para 2025"',
      target: 'Spam / Conteudo irrelevante',
      excerpt: 'Compre agora criptomoedas e ganhe bonus imediatos no site bit-fake-link.com...',
      meta: '5 horas atras',
      reporter: 'Origem: UPL Detectou',
      category: 'Marcado como marketing',
      time: 'Fila',
      primaryAction: 'Remover post',
      secondaryAction: 'Descartar',
      mutedAction: 'Arquivar',
    },
  ];

  readonly activityLogs: ActivityLog[] = [
    { time: '14:02', actor: 'Moderador Carlos', detail: 'removeu comentario de "Pedro S." por violacao de termos.', tone: 'red' },
    { time: '13:45', actor: 'Sistema', detail: 'bloqueou automaticamente usuario "Barreto_DL" por 12 reports em 9 minutos.', tone: 'gold' },
    { time: '12:30', actor: 'Super Admin Ana Helena', detail: 'aprovou recurso de "Marta L.".', tone: 'wine' },
  ];

  metricColor(tone: ReportMetric['tone']): string {
    const colors: Record<ReportMetric['tone'], string> = {
      gold: '#d8a500',
      red: '#e52525',
      wine: '#5c1e2f',
      amber: '#b88700',
    };

    return colors[tone];
  }
}
