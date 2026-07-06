import { Component, OnInit, inject } from '@angular/core';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminMetricCardComponent, AdminPageHeaderComponent } from '../../shared/components';
import { BackendContentSubscription, ContentSubscriptionService } from '../../../../services/content-subscription.service';

interface SubscriptionMetric {
  label: string;
  value: string;
  note: string;
}

interface Subscriber {
  id: string | number;
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
export class AdminSubscriptionsPage implements OnInit {
  private readonly contentSubscriptionService = inject(ContentSubscriptionService);

  periodLabel = 'Últimos 30 dias';
  searchOpen = false;
  searchTerm = '';
  selectedView: 'requests' | 'subscribers' = 'requests';

  loading = false;
  errorMessage = '';

  metrics: SubscriptionMetric[] = [
    { label: 'Total de subscritores', value: '0', note: 'Subscrições Jindungo' },
    { label: 'Pedidos pendentes', value: '0', note: 'Aguardando aprovação' },
    { label: 'Membros ativos', value: '0', note: 'Com subscrição ativa' },
    { label: 'Textos Jindungo', value: '0', note: 'Com subscrições' },
  ];

  subscribers: Subscriber[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadSubscriptions();
  }

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

  async approveSubscription(subscriber: Subscriber): Promise<void> {
    await this.contentSubscriptionService.approve(subscriber.id);
    await this.loadSubscriptions();
  }

  async expireSubscription(subscriber: Subscriber): Promise<void> {
    await this.contentSubscriptionService.expire(subscriber.id);
    await this.loadSubscriptions();
  }

  async rejectSubscription(subscriber: Subscriber): Promise<void> {
    await this.contentSubscriptionService.reject(subscriber.id);
    await this.loadSubscriptions();
  }

  async deleteSubscription(subscriber: Subscriber): Promise<void> {
    await this.contentSubscriptionService.delete(subscriber.id);
    await this.loadSubscriptions();
  }

  private async loadSubscriptions(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const subscriptions = await this.contentSubscriptionService.getAll();

      this.subscribers = subscriptions.map((subscription) => this.toSubscriber(subscription));

      const pending = this.subscribers.filter((item) => item.status === 'Pendente').length;
      const active = this.subscribers.filter((item) => item.status === 'Ativo').length;
      const uniqueTexts = new Set(this.subscribers.map((item) => item.textTitle)).size;

      this.metrics = [
        { label: 'Total de subscritores', value: String(this.subscribers.length), note: 'Subscrições Jindungo' },
        { label: 'Pedidos pendentes', value: String(pending), note: 'Aguardando aprovação' },
        { label: 'Membros ativos', value: String(active), note: 'Com subscrição ativa' },
        { label: 'Textos Jindungo', value: String(uniqueTexts), note: 'Com subscrições' },
      ];
    } catch {
      this.errorMessage = 'Não foi possível carregar as subscrições.';
    } finally {
      this.loading = false;
    }
  }

  private toSubscriber(subscription: BackendContentSubscription): Subscriber {
    return {
      id: subscription.id,
      initials: this.getInitials(subscription.user?.name ?? 'Utilizador'),
      name: subscription.user?.name ?? 'Utilizador',
      email: subscription.user?.email ?? '-',
      status: this.toStatus(subscription),
      joinedAt: this.formatDate(subscription.requested_at ?? subscription.created_at),
      textTitle: subscription.content?.title ?? 'Texto Jindungo',
    };
  }

  private toStatus(subscription: BackendContentSubscription): Subscriber['status'] {
    if (subscription.status === 'approved') {
      const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;

      return expiresAt && expiresAt.getTime() <= Date.now() ? 'Expirado' : 'Ativo';
    }

    if (subscription.status === 'rejected') {
      return 'Recusado';
    }

    if (subscription.status === 'expired') {
      return 'Expirado';
    }

    return 'Pendente';
  }

  private visibleSubscribersByStatus(status: Subscriber['status']): Subscriber[] {
    return this.subscribers.filter((subscriber) => subscriber.status === status && this.matchesSearch(subscriber));
  }

  private matchesSearch(subscriber: Subscriber): boolean {
    const query = this.normalize(this.searchTerm);
    return !query || this.normalize(`${subscriber.name} ${subscriber.email} ${subscriber.textTitle}`).includes(query);
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  private formatDate(value?: string | null): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
