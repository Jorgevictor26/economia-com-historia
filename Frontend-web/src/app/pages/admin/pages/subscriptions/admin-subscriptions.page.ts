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
  status: 'Ativo' | 'Pendente' | 'Expirado' | 'Recusado';
  joinedAt: string;
  textTitle: string;
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
  selectedView: 'requests' | 'subscribers' = 'requests';

  readonly metrics: SubscriptionMetric[] = [
    { label: 'Total de subscritores', value: '12.450', note: '+12% novos pedidos' },
    { label: 'Taxa de retenção', value: '97.6%', note: 'Alta fidelidade' },
    { label: 'Membros ativos', value: '1,842', note: '+45 novos hoje' },
    { label: 'Textos Jindungo', value: '3', note: 'Com subscritores ativos' },
  ];

  subscribers: Subscriber[] = [
    { initials: 'AM', name: 'Antonio Manuel', email: 'antonio.m@exemplo.co', status: 'Ativo', joinedAt: '12 Mar, 2024', textTitle: 'O Impacto das Reservas Internacionais no Kwanza' },
    { initials: 'BS', name: 'Beatriz Santos', email: 'beatriz.s@exemplo.co', status: 'Pendente', joinedAt: '08 Mar, 2024', textTitle: 'Análise do Mercado de Diamantes na Lunda Sul' },
    { initials: 'JL', name: 'Joao Lourenco', email: 'joao.l@exemplo.co', status: 'Ativo', joinedAt: '25 Mar, 2024', textTitle: 'Análise da Política Monetaria de Angola' },
    { initials: 'MN', name: 'Mariana Neto', email: 'mariana.n@exemplo.co', status: 'Pendente', joinedAt: '02 Abr, 2024', textTitle: 'O Impacto das Reservas Internacionais no Kwanza' },
    { initials: 'CL', name: 'Carla Lopes', email: 'carla.l@exemplo.co', status: 'Ativo', joinedAt: '18 Abr, 2024', textTitle: 'Análise do Mercado de Diamantes na Lunda Sul' },
    { initials: 'ED', name: 'Emanuel Dala', email: 'emanuel.d@exemplo.co', status: 'Ativo', joinedAt: '03 Mai, 2024', textTitle: 'O Impacto das Reservas Internacionais no Kwanza' },
  ];

  get pendingCount(): number {
    return this.subscribers.filter((subscriber) => subscriber.status === 'Pendente').length;
  }

  visiblePendingRequests(): Subscriber[] {
    return this.visibleSubscribersByStatus('Pendente');
  }

  visibleActiveSubscribers(): Subscriber[] {
    return this.visibleSubscribersByStatus('Ativo');
  }

  setView(view: 'requests' | 'subscribers'): void {
    this.selectedView = view;
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

  approveSubscription(subscriber: Subscriber): void {
    subscriber.status = 'Ativo';
  }

  expireSubscription(subscriber: Subscriber): void {
    subscriber.status = 'Expirado';
  }

  rejectSubscription(subscriber: Subscriber): void {
    subscriber.status = 'Recusado';
  }

  deleteSubscription(subscriber: Subscriber): void {
    this.subscribers = this.subscribers.filter((item) => item !== subscriber);
  }

  private visibleSubscribersByStatus(status: Subscriber['status']): Subscriber[] {
    return this.subscribers.filter((subscriber) => subscriber.status === status && this.matchesSearch(subscriber));
  }

  private matchesSearch(subscriber: Subscriber): boolean {
    const query = this.normalize(this.searchTerm);
    return !query || this.normalize(`${subscriber.name} ${subscriber.email} ${subscriber.textTitle}`).includes(query);
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

