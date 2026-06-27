import { Component, inject, signal } from '@angular/core';
import { AuthStateService } from '../../../../services/auth-state.service';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminMetricCardComponent, AdminPageHeaderComponent } from '../../shared/components';

interface DashboardMetric {
  label: string;
  value: string;
  note: string;
  accent: string;
}

interface StudentRank {
  position: number;
  name: string;
  course: string;
  score: number;
  avatar: string;
}

interface ContentBar {
  label: string;
  value: number;
}

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [AdminConsoleShellComponent, AdminMetricCardComponent, AdminPageHeaderComponent],
  templateUrl: './admin-dashboard.page.html',
})
export class AdminDashboardPage {
  readonly auth = inject(AuthStateService);

  readonly metrics: DashboardMetric[] = [
    { label: 'Engajamento medio', value: '8.4 / 10', note: '+Comentarios e interacoes', accent: '#5c1e2f' },
    { label: 'Membros ativos', value: '1,842', note: '+4.6% novos hoje', accent: '#8A3F50' },
    { label: 'Taxa de retencao', value: '97.6%', note: 'Alta fidelidade', accent: '#5c1e2f' },
    { label: 'Total de subscritores', value: '12.450', note: '+12% novos seguidores', accent: '#8A3F50' },
  ];

  readonly topStudentsSignal = signal<StudentRank[]>([
    { position: 1, name: 'Carlos Tchipia', course: 'Gestao', score: 950, avatar: 'CT' },
    { position: 2, name: 'Jussana Paim', course: 'Contabilidade', score: 920, avatar: 'JP' },
    { position: 3, name: 'David Jaspe', course: 'Gestao', score: 980, avatar: 'DJ' },
    { position: 4, name: 'Isabel Marques', course: 'Contabilidade', score: 890, avatar: 'IM' },
    { position: 5, name: 'Liria Ba', course: 'Contabilidade', score: 870, avatar: 'LB' },
  ]);

  readonly contentBars: ContentBar[] = [
    { label: 'Podcast', value: 58 },
    { label: 'Artigo', value: 92 },
    { label: 'Quiz', value: 66 },
    { label: 'Conteudo', value: 96 },
    { label: 'Forum', value: 44 },
    { label: 'Diverso', value: 78 },
  ];

  topStudents(): StudentRank[] {
    return this.topStudentsSignal();
  }
}
