import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';

interface AdminMetric {
  label: string;
  value: string;
  note: string;
}

interface StudentRank {
  position: number;
  name: string;
  course: string;
  score: number;
}

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [RouterLink, AdminConsoleShellComponent],
  templateUrl: './admin-dashboard.page.html',
})
export class AdminDashboardPage {
  readonly topStudentsSignal = signal<StudentRank[]>([
    { position: 1, name: 'Carlos Tchipia', course: 'Gestão', score: 950 },
    { position: 2, name: 'Jussana Paim', course: 'Contabilidade', score: 920 },
    { position: 3, name: 'David Jaspe', course: 'Gestão', score: 980 },
    { position: 4, name: 'Isabel Marques', course: 'Contabilidade', score: 890 },
    { position: 5, name: 'Líria Bá', course: 'Contabilidade', score: 870 },
  ]);

  readonly activityMetrics: AdminMetric[] = [
    { label: 'Taxa de Abertura', value: '86%', note: 'Conteúdos lidos nas últimas 24h' },
    { label: 'Novos Comentários', value: '128', note: 'Discussões iniciadas esta semana' },
    { label: 'Quizzes Respondidos', value: '2.4K', note: 'Total de tentativas ativas' },
  ];

  topStudents(): StudentRank[] {
    return this.topStudentsSignal();
  }
}
