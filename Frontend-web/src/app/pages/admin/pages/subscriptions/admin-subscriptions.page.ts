import { Component } from '@angular/core';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminMetricCardComponent, AdminPageHeaderComponent } from '../../shared/components';

interface SubscriptionMetric {
  label: string;
  value: string;
  note: string;
}

interface Subscriber {
  initials: string;
  name: string;
  email: string;
  accessLevel: 'Premium Academico' | 'Gratuito' | 'Premium Executivo';
  status: 'Ativo' | 'Pendente' | 'Expirado';
  joinedAt: string;
}

@Component({
  selector: 'app-admin-subscriptions-page',
  standalone: true,
  imports: [AdminConsoleShellComponent, AdminMetricCardComponent, AdminPageHeaderComponent],
  templateUrl: './admin-subscriptions.page.html',
})
export class AdminSubscriptionsPage {
  readonly metrics: SubscriptionMetric[] = [
    { label: 'Total de subscritores', value: '12.450', note: '+12% novos seguidores' },
    { label: 'Taxa de retencao', value: '97.6%', note: 'Alta fidelidade' },
    { label: 'Membros ativos', value: '1,842', note: '+45 novos hoje' },
    { label: 'Engajamento medio', value: '8.4 / 10', note: 'Comentarios e interacoes' },
  ];

  readonly subscribers: Subscriber[] = [
    { initials: 'AM', name: 'Antonio Manuel', email: 'antonio.m@exemplo.co', accessLevel: 'Premium Academico', status: 'Ativo', joinedAt: '12 Mar, 2024' },
    { initials: 'BS', name: 'Beatriz Santos', email: 'beatriz.s@exemplo.co', accessLevel: 'Gratuito', status: 'Pendente', joinedAt: '08 Mar, 2024' },
    { initials: 'JL', name: 'Joao Lourenco', email: 'joao.l@exemplo.co', accessLevel: 'Premium Academico', status: 'Ativo', joinedAt: '25 Mar, 2024' },
    { initials: 'MN', name: 'Mariana Neto', email: 'mariana.n@exemplo.co', accessLevel: 'Premium Executivo', status: 'Pendente', joinedAt: '02 Abr, 2024' },
  ];

  get pendingCount(): number {
    return this.subscribers.filter((subscriber) => subscriber.status === 'Pendente').length;
  }

  approveSubscription(subscriber: Subscriber): void {
    subscriber.status = 'Ativo';
    if (subscriber.accessLevel === 'Gratuito') {
      subscriber.accessLevel = 'Premium Academico';
    }
  }
}
