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
  accessLevel: 'Premium Académico' | 'Gratuito' | 'Premium Executivo';
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
  periodLabel = 'Últimos 30 dias';
  searchOpen = false;
  searchTerm = '';
  selectedStatus = 'Todos';

  readonly metrics: SubscriptionMetric[] = [
    { label: 'Total de subscritores', value: '12.450', note: '+12% novos seguidores' },
    { label: 'Taxa de retenção', value: '97.6%', note: 'Alta fidelidade' },
    { label: 'Membros ativos', value: '1,842', note: '+45 novos hoje' },
    { label: 'Engajamento médio', value: '8.4 / 10', note: 'Comentários e interações' },
  ];

  subscribers: Subscriber[] = [
    { initials: 'AM', name: 'Antonio Manuel', email: 'antonio.m@exemplo.co', accessLevel: 'Premium Académico', status: 'Ativo', joinedAt: '12 Mar, 2024' },
    { initials: 'BS', name: 'Beatriz Santos', email: 'beatriz.s@exemplo.co', accessLevel: 'Gratuito', status: 'Pendente', joinedAt: '08 Mar, 2024' },
    { initials: 'JL', name: 'Joao Lourenco', email: 'joao.l@exemplo.co', accessLevel: 'Premium Académico', status: 'Ativo', joinedAt: '25 Mar, 2024' },
    { initials: 'MN', name: 'Mariana Neto', email: 'mariana.n@exemplo.co', accessLevel: 'Premium Executivo', status: 'Pendente', joinedAt: '02 Abr, 2024' },
  ];

  get pendingCount(): number {
    return this.subscribers.filter((subscriber) => subscriber.status === 'Pendente').length;
  }

  visibleSubscribers(): Subscriber[] {
    const query = this.normalize(this.searchTerm);

    return this.subscribers.filter((subscriber) => {
      const matchesSearch = !query || this.normalize(`${subscriber.name} ${subscriber.email} ${subscriber.accessLevel}`).includes(query);
      const matchesStatus = this.selectedStatus === 'Todos' || subscriber.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  togglePeriod(): void {
    this.periodLabel = this.periodLabel === 'Últimos 30 dias' ? 'Últimos 7 dias' : 'Últimos 30 dias';
  }

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
    if (!this.searchOpen) {
      this.searchTerm = '';
    }
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  updateStatusFilter(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
  }

  approveSubscription(subscriber: Subscriber): void {
    subscriber.status = 'Ativo';
    if (subscriber.accessLevel === 'Gratuito') {
      subscriber.accessLevel = 'Premium Académico';
    }
  }

  expireSubscription(subscriber: Subscriber): void {
    subscriber.status = 'Expirado';
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

